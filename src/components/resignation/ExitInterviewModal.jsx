'use client';
import React, { useState, useEffect } from 'react';
import { X, Save, Briefcase, User, TrendingUp, Building, Award, MessageSquare } from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';

export default function ExitInterviewModal({ interview, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState('ROLE');

  const sections = [
    { id: 'ROLE', label: 'Role & Responsibilities', icon: Briefcase },
    { id: 'MANAGEMENT', label: 'Management', icon: User },
    { id: 'COMPENSATION', label: 'Compensation', icon: TrendingUp },
    { id: 'CONDITIONS', label: 'Work Conditions', icon: Building },
    { id: 'CULTURE', label: 'Culture & Values', icon: Award },
    { id: 'FINAL', label: 'Final Comments', icon: MessageSquare },
  ];

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await resignationExitService.exitInterview.getQuestions();
      setQuestions(data);
      
      // Initialize responses
      const initialResponses = {};
      data.forEach(q => {
        initialResponses[q.id] = {
          question: q.id,
          rating_value: q.question_type === 'RATING' ? 3 : null,
          text_value: '',
          choice_value: ''
        };
      });
      setResponses(initialResponses);
    } catch (err) {
      console.error('Error loading questions:', err);
      alert('Failed to load exit interview questions');
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
        if (q.question_type === 'TEXT' && !response.text_value.trim()) {
          alert(`Please answer: ${q.question_text_en}`);
          return;
        }
      }

      // Prepare responses array
      const responsesArray = Object.values(responses);
      
      await resignationExitService.exitInterview.submitResponses(
        interview.id,
        responsesArray
      );

      alert('Exit interview completed successfully!');
      onSuccess && onSuccess();
      onClose();

    } catch (err) {
      console.error('Error submitting exit interview:', err);
      alert('Failed to submit exit interview. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const RatingQuestion = ({ question }) => {
    const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    const currentValue = responses[question.id]?.rating_value || 3;

    return (
      <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
        <label className="block text-sm font-medium text-almet-cloud-burst dark:text-gray-300 mb-3">
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
            <span className="text-sm font-medium text-almet-cloud-burst dark:text-gray-300">
              {labels[currentValue - 1]}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const TextQuestion = ({ question }) => {
    return (
      <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
        <label className="block text-sm font-medium text-almet-cloud-burst dark:text-gray-300 mb-2">
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
        <label className="block text-sm font-medium text-almet-cloud-burst dark:text-gray-300 mb-2">
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

  const ChoiceQuestion = ({ question }) => {
    return (
      <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
        <label className="block text-sm font-medium text-almet-cloud-burst dark:text-gray-300 mb-2">
          {question.question_text_en}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          value={responses[question.id]?.choice_value || ''}
          onChange={(e) => handleResponseChange(question.id, 'choice_value', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
        >
          <option value="">Select an option...</option>
          {question.choices && question.choices.map((choice, idx) => (
            <option key={idx} value={choice}>{choice}</option>
          ))}
        </select>
      </div>
    );
  };

  const renderQuestion = (question) => {
    switch (question.question_type) {
      case 'RATING':
        return <RatingQuestion key={question.id} question={question} />;
      case 'TEXT':
        return <TextQuestion key={question.id} question={question} />;
      case 'TEXTAREA':
        return <TextAreaQuestion key={question.id} question={question} />;
      case 'CHOICE':
        return <ChoiceQuestion key={question.id} question={question} />;
      default:
        return null;
    }
  };

  const sectionQuestions = questions.filter(q => q.section === currentSection);
  const currentSectionIndex = sections.findIndex(s => s.id === currentSection);
  const SectionIcon = sections[currentSectionIndex]?.icon;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-almet-sapphire mx-auto"></div>
          <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai mt-4 text-center">
            Loading exit interview...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-500 to-pink-600 p-4 text-white flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold">Exit Interview</h2>
            <p className="text-red-100 mt-0.5 text-xs">
              {interview.employee_name} - Last Day: {resignationExitService.helpers.formatDate(interview.last_working_day)}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex overflow-x-auto">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                    currentSection === section.id
                      ? 'border-almet-sapphire text-almet-sapphire bg-white dark:bg-gray-800'
                      : 'border-transparent text-almet-waterloo dark:text-almet-bali-hai hover:text-almet-cloud-burst dark:hover:text-gray-200'
                  }`}
                >
                  <Icon size={14} />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-4">
            {SectionIcon && (
              <div className="p-2 bg-almet-mystic dark:bg-almet-cloud-burst/30 rounded-lg">
                <SectionIcon className="text-almet-sapphire dark:text-almet-steel-blue" size={20} />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-almet-cloud-burst dark:text-gray-200">
                {sections[currentSectionIndex]?.label}
              </h3>
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                {sectionQuestions.length} questions
              </p>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {sectionQuestions.map(question => renderQuestion(question))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                if (currentSectionIndex > 0) {
                  setCurrentSection(sections[currentSectionIndex - 1].id);
                }
              }}
              disabled={currentSectionIndex === 0}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentSectionIndex < sections.length - 1 ? (
              <button
                onClick={() => setCurrentSection(sections[currentSectionIndex + 1].id)}
                className="flex-1 px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-xs font-medium"
              >
                Next Section
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Submit Exit Interview
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}