'use client';
import React, { useState, useEffect } from 'react';
import { X, Save, CheckCircle, AlertCircle } from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';

export default function ProbationReviewModal({ review, onClose, onSuccess, respondentType }) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // respondentType: 'EMPLOYEE' or 'MANAGER'
  const isEmployee = respondentType === 'EMPLOYEE';

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      
      // Determine which questions to load based on review period and respondent
      const reviewTypePrefix = isEmployee ? 'EMPLOYEE' : 'MANAGER';
      const reviewTypeSuffix = review.review_period.split('_')[0]; // '30', '60', or '90'
      const reviewType = `${reviewTypePrefix}_${reviewTypeSuffix}`;
      
      const data = await resignationExitService.probationReview.getQuestions(reviewType);
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
      console.error('Error loading questions:', err);
      alert('Failed to load probation review questions');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, field, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
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

      // Prepare responses array
      const responsesArray = Object.values(responses);
      
      await resignationExitService.probationReview.submitResponses(
        review.id,
        respondentType,
        responsesArray
      );

      alert('Probation review submitted successfully!');
      onSuccess && onSuccess();
      onClose();

    } catch (err) {
      console.error('Error submitting probation review:', err);
      alert('Failed to submit probation review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const RatingQuestion = ({ question }) => {
    const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    const currentValue = responses[question.id]?.rating_value || 3;

    return (
      <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {question.question_text_en}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleResponseChange(question.id, 'rating_value', rating)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                  currentValue >= rating
                    ? 'bg-almet-sapphire text-white shadow-md scale-105'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {labels[currentValue - 1]}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const YesNoQuestion = ({ question }) => {
    const currentValue = responses[question.id]?.yes_no_value;

    return (
      <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {question.question_text_en}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleResponseChange(question.id, 'yes_no_value', true)}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              currentValue === true
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            ✓ Yes
          </button>
          <button
            type="button"
            onClick={() => handleResponseChange(question.id, 'yes_no_value', false)}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              currentValue === false
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            ✗ No
          </button>
        </div>
      </div>
    );
  };

  const TextQuestion = ({ question }) => {
    return (
      <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {question.question_text_en}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="text"
          value={responses[question.id]?.text_value || ''}
          onChange={(e) => handleResponseChange(question.id, 'text_value', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
          placeholder="Your answer..."
        />
      </div>
    );
  };

  const TextAreaQuestion = ({ question }) => {
    return (
      <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {question.question_text_en}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          value={responses[question.id]?.text_value || ''}
          onChange={(e) => handleResponseChange(question.id, 'text_value', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none"
          placeholder="Your answer..."
        />
      </div>
    );
  };

  const renderQuestion = (question) => {
    switch (question.question_type) {
      case 'RATING':
        return <RatingQuestion key={question.id} question={question} />;
      case 'YES_NO':
        return <YesNoQuestion key={question.id} question={question} />;
      case 'TEXT':
        return <TextQuestion key={question.id} question={question} />;
      case 'TEXTAREA':
        return <TextAreaQuestion key={question.id} question={question} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-almet-sapphire mx-auto"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
            Loading probation review...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-almet-sapphire to-almet-astral p-4 text-white flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold">
              {review.review_period.replace('_', '-')} Probation Review
            </h2>
            <p className="text-blue-100 mt-0.5 text-xs">
              {review.employee_name} - {isEmployee ? 'Self Assessment' : 'Manager Evaluation'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Info Notice */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={16} />
              <div className="text-xs text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">
                  {isEmployee ? 'Self Assessment' : 'Manager Evaluation'}
                </p>
                <p>
                  {isEmployee 
                    ? 'Please honestly assess your performance during the probation period.'
                    : 'Please evaluate the employee\'s performance during the probation period.'}
                </p>
              </div>
            </div>
          </div>

          {/* Employee Info */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Employee Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{review.employee_name}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Position</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{review.position}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Department</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{review.department}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Review Period</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {review.review_period.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Review Questions
            </h3>
            {questions.map(question => renderQuestion(question))}
          </div>

          {/* Important Notice */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Before Submitting:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-yellow-700 dark:text-yellow-300">
              <li>Please review all your responses carefully</li>
              <li>This review will be shared with HR and management</li>
              <li>You cannot edit responses after submission</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-5 py-3 flex gap-3 justify-end border-t border-gray-200 dark:border-gray-600">
          <button 
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Save size={14} />
                Submit Review
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}