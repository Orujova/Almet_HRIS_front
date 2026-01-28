// components/resignation/ProbationReviewModal.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { X, Save, ChevronLeft, ChevronRight, Check, User, Briefcase, Calendar, AlertCircle } from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';

export default function ProbationReviewModal({ review, onClose, onSuccess, respondentType }) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const isEmployee = respondentType === 'EMPLOYEE';

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      
      // ✅ Construct review_type correctly
      const reviewTypePrefix = isEmployee ? 'EMPLOYEE' : 'MANAGER';
      const reviewTypeSuffix = review.review_period.split('_')[0]; // "30", "60", "90"
      const reviewType = `${reviewTypePrefix}_${reviewTypeSuffix}`; // "EMPLOYEE_30", "MANAGER_30"
      
      console.log('🔍 Loading questions for:', {
        review_period: review.review_period,
        respondentType,
        reviewType,
        isEmployee
      });
      
      // ✅ Call API with review_type filter
      const data = await resignationExitService.probationReview.getQuestions(reviewType);
      
      console.log('✅ Loaded questions:', data);
      
      if (!data || data.length === 0) {
        console.warn(`⚠️ No questions found for ${reviewType}`);
        setQuestions([]);
        setLoading(false);
        return;
      }
      
      setQuestions(data);
      
      // Initialize responses
      const initialResponses = {};
      data.forEach(q => {
        initialResponses[q.id] = {
          question: q.id,
          rating_value: q.question_type === 'RATING' ? 3 : null,
          yes_no_value: null,
          text_value: ''
        };
      });
      setResponses(initialResponses);
      
    } catch (err) {
      console.error('❌ Error loading questions:', err);
      alert('Failed to load probation review questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, field, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], [field]: value }
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Validate required questions
      const requiredQuestions = questions.filter(q => q.is_required);
      for (const q of requiredQuestions) {
        const response = responses[q.id];
        if (q.question_type === 'RATING' && !response.rating_value) {
          alert(`Please answer: ${q.question_text_en}`);
          setSubmitting(false);
          return;
        }
        if (q.question_type === 'YES_NO' && response.yes_no_value === null) {
          alert(`Please answer: ${q.question_text_en}`);
          setSubmitting(false);
          return;
        }
        if ((q.question_type === 'TEXT' || q.question_type === 'TEXTAREA') && !response.text_value.trim()) {
          alert(`Please answer: ${q.question_text_en}`);
          setSubmitting(false);
          return;
        }
      }

      await resignationExitService.probationReview.submitResponses(
        review.id,
        respondentType,
        Object.values(responses)
      );

      alert('Probation review submitted successfully!');
      onSuccess && onSuccess();
      onClose();

    } catch (err) {
      console.error('❌ Error submitting:', err);
      alert(err.response?.data?.detail || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const RatingQuestion = ({ question }) => {
    const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    const currentValue = responses[question.id]?.rating_value || 3;

    return (
      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
          {question.question_text_en}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleResponseChange(question.id, 'rating_value', rating)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                currentValue >= rating
                  ? 'bg-almet-sapphire text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {rating}
            </button>
          ))}
          <span className="text-sm font-medium text-gray-900 dark:text-white ml-3">
            {labels[currentValue - 1]}
          </span>
        </div>
      </div>
    );
  };

  const YesNoQuestion = ({ question }) => {
    const currentValue = responses[question.id]?.yes_no_value;

    return (
      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
          {question.question_text_en}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleResponseChange(question.id, 'yes_no_value', true)}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              currentValue === true
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            ✓ Yes
          </button>
          <button
            type="button"
            onClick={() => handleResponseChange(question.id, 'yes_no_value', false)}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              currentValue === false
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            ✗ No
          </button>
        </div>
      </div>
    );
  };

  const TextQuestion = ({ question }) => (
    <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
        {question.question_text_en}
        {question.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={responses[question.id]?.text_value || ''}
        onChange={(e) => handleResponseChange(question.id, 'text_value', e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
        placeholder="Your answer..."
      />
    </div>
  );

  const TextAreaQuestion = ({ question }) => (
    <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
        {question.question_text_en}
        {question.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={responses[question.id]?.text_value || ''}
        onChange={(e) => handleResponseChange(question.id, 'text_value', e.target.value)}
        rows={4}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none"
        placeholder="Your answer..."
      />
    </div>
  );

  const renderQuestion = (question) => {
    switch (question.question_type) {
      case 'RATING': return <RatingQuestion key={question.id} question={question} />;
      case 'YES_NO': return <YesNoQuestion key={question.id} question={question} />;
      case 'TEXT': return <TextQuestion key={question.id} question={question} />;
      case 'TEXTAREA': return <TextAreaQuestion key={question.id} question={question} />;
      default: return null;
    }
  };

  const questionsPerSection = 5;
  const totalSections = Math.ceil(questions.length / questionsPerSection);
  const sections = Array.from({ length: totalSections }, (_, i) => ({
    index: i,
    label: `Section ${i + 1}`,
    questions: questions.slice(i * questionsPerSection, (i + 1) * questionsPerSection)
  }));

  const currentSectionData = sections[currentStep] || { questions: [] };
  const isLastStep = currentStep === sections.length - 1;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
          <div className="w-12 h-12 border-4 border-almet-sapphire border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading questions...</p>
        </div>
      </div>
    );
  }

  // ✅ If no questions, show error state
  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Questions Available
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              No questions have been configured for this probation review yet. Please contact HR to add questions for {isEmployee ? 'Employee' : 'Manager'} {review.review_period.replace('_', ' ')} review.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">
                {review.review_period.replace('_', '-')} Probation Review
              </h2>
              <p className="text-blue-100 text-xs mt-0.5">
                {review.employee_name} • {isEmployee ? 'Self Assessment' : 'Manager Evaluation'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Stepper */}
        {sections.length > 1 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {sections.map((section, idx) => (
                <div key={idx} className="flex items-center flex-1">
                  <button
                    onClick={() => setCurrentStep(idx)}
                    disabled={submitting}
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                      idx < currentStep
                        ? 'bg-green-500 text-white'
                        : idx === currentStep
                        ? 'bg-almet-sapphire text-white scale-110'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {idx < currentStep ? <Check size={14} /> : idx + 1}
                  </button>
                  {idx < sections.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${
                      idx < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Employee Info */}
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <User size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="text-gray-900 dark:text-white font-medium">{review.employee_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="text-gray-700 dark:text-gray-300">{review.position}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="text-gray-700 dark:text-gray-300">{review.review_period.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {currentSectionData.label}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {currentSectionData.questions.length} questions in this section
              </p>
            </div>
            {currentSectionData.questions.map(question => renderQuestion(question))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0 || submitting}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          
          {!isLastStep ? (
            <button
              onClick={() => setCurrentStep(Math.min(sections.length - 1, currentStep + 1))}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral text-sm font-medium transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Submit Review
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}