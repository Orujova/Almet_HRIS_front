'use client';
import React, { useState, useEffect } from 'react';
import { X, Save, ChevronLeft, ChevronRight, Check, User, Briefcase, Calendar } from 'lucide-react';
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
      
      const reviewTypePrefix = isEmployee ? 'EMPLOYEE' : 'MANAGER';
      const reviewTypeSuffix = review.review_period.split('_')[0];
      const reviewType = `${reviewTypePrefix}_${reviewTypeSuffix}`;
      
      const data = await resignationExitService.probationReview.getQuestions(reviewType);
      setQuestions(data);
      
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
      console.error('Error loading questions:', err);
      alert('Failed to load probation review questions');
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
      
      const requiredQuestions = questions.filter(q => q.is_required);
      for (const q of requiredQuestions) {
        const response = responses[q.id];
        if (q.question_type === 'RATING' && !response.rating_value) {
          alert(`Please answer: ${q.question_text_en}`);
          return;
        }
        if (q.question_type === 'YES_NO' && response.yes_no_value === null) {
          alert(`Please answer: ${q.question_text_en}`);
          return;
        }
        if (q.question_type === 'TEXT' && !response.text_value.trim()) {
          alert(`Please answer: ${q.question_text_en}`);
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
      console.error('Error submitting:', err);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const RatingQuestion = ({ question }) => {
    const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    const currentValue = responses[question.id]?.rating_value || 3;

    return (
      <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          {question.question_text_en}
          {question.is_required && <span className="text-rose-500 ml-1">*</span>}
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleResponseChange(question.id, 'rating_value', rating)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                currentValue >= rating
                  ? 'bg-almet-sapphire text-white shadow-sm scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {rating}
            </button>
          ))}
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-2">
            {labels[currentValue - 1]}
          </span>
        </div>
      </div>
    );
  };

  const YesNoQuestion = ({ question }) => {
    const currentValue = responses[question.id]?.yes_no_value;

    return (
      <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          {question.question_text_en}
          {question.is_required && <span className="text-rose-500 ml-1">*</span>}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleResponseChange(question.id, 'yes_no_value', true)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              currentValue === true
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            ✓ Yes
          </button>
          <button
            type="button"
            onClick={() => handleResponseChange(question.id, 'yes_no_value', false)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              currentValue === false
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            ✗ No
          </button>
        </div>
      </div>
    );
  };

  const TextQuestion = ({ question }) => (
    <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
        {question.question_text_en}
        {question.is_required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={responses[question.id]?.text_value || ''}
        onChange={(e) => handleResponseChange(question.id, 'text_value', e.target.value)}
        className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire"
        placeholder="Your answer..."
      />
    </div>
  );

  const TextAreaQuestion = ({ question }) => (
    <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
        {question.question_text_en}
        {question.is_required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <textarea
        value={responses[question.id]?.text_value || ''}
        onChange={(e) => handleResponseChange(question.id, 'text_value', e.target.value)}
        rows={3}
        className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire resize-none"
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

  // Group questions by sections (every 5 questions)
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="w-10 h-10 border-3 border-almet-sapphire border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral p-3 text-white flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold">
              {review.review_period.replace('_', '-')} Probation Review
            </h2>
            <p className="text-blue-100 text-[10px]">
              {review.employee_name} - {isEmployee ? 'Self Assessment' : 'Manager Evaluation'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Stepper */}
        {sections.length > 1 && (
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {sections.map((section, idx) => (
                <div key={idx} className="flex items-center flex-1">
                  <button
                    onClick={() => setCurrentStep(idx)}
                    disabled={submitting}
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-bold transition-all ${
                      idx < currentStep
                        ? 'bg-emerald-500 text-white'
                        : idx === currentStep
                        ? 'bg-almet-sapphire text-white scale-110'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {idx < currentStep ? <Check size={12} /> : idx + 1}
                  </button>
                  {idx < sections.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${
                      idx < currentStep ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Employee Info */}
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <User size={10} className="text-blue-600" />
              <span className="text-gray-600 dark:text-gray-400">{review.employee_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase size={10} className="text-blue-600" />
              <span className="text-gray-600 dark:text-gray-400">{review.position}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={10} className="text-blue-600" />
              <span className="text-gray-600 dark:text-gray-400">{review.review_period.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">
              {currentSectionData.label}
              <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                ({currentSectionData.questions.length} questions)
              </span>
            </h3>
            {currentSectionData.questions.map(question => renderQuestion(question))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 flex justify-between border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0 || submitting}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 text-xs font-medium disabled:opacity-50"
          >
            <ChevronLeft size={12} /> Back
          </button>
          
          {!isLastStep ? (
            <button
              onClick={() => setCurrentStep(Math.min(sections.length - 1, currentStep + 1))}
              className="flex items-center gap-1 px-3 py-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral text-xs font-medium"
            >
              Next <ChevronRight size={12} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Save size={12} />
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