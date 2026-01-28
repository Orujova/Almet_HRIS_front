// app/(dashboard)/resignation-exit/question-management/page.jsx
'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Plus, Edit2, Trash2, Save, X, GripVertical, 
  MessageSquare, CheckSquare, List, AlignLeft, ArrowLeft
} from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';

export default function QuestionManagementPage() {
  const [activeType, setActiveType] = useState('exit_interview');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, [activeType]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      let data;
      
      if (activeType === 'exit_interview') {
        data = await resignationExitService.exitInterview.getQuestions();
      } else {
        // ✅ Load ALL probation questions (no filter)
        data = await resignationExitService.probationReview.getQuestions();
      }

      console.log('📋 Loaded questions:', {
        type: activeType,
        count: data.length,
        questions: data
      });
      
      setQuestions(data);
    } catch (err) {
      console.error('❌ Error loading questions:', err);
      alert('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowModal(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowModal(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      if (activeType === 'exit_interview') {
        await resignationExitService.exitInterview.deleteQuestion(questionId);
      } else {
        await resignationExitService.probationReview.deleteQuestion(questionId);
      }
      
      await loadQuestions();
      alert('Question deleted successfully!');
    } catch (err) {
      console.error('Error deleting question:', err);
      alert('Failed to delete question');
    }
  };

  const QuestionCard = ({ question }) => {
    const typeIcons = {
      RATING: <CheckSquare size={16} />,
      TEXT: <AlignLeft size={16} />,
      TEXTAREA: <MessageSquare size={16} />,
      YES_NO: <CheckSquare size={16} />,
      CHOICE: <List size={16} />
    };

    const sectionColors = {
      ROLE: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      MANAGEMENT: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      COMPENSATION: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      CONDITIONS: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      CULTURE: 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
      FINAL: 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-400',
    };

    const reviewTypeColors = {
      EMPLOYEE_30: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      MANAGER_30: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
      EMPLOYEE_60: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      MANAGER_60: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
      EMPLOYEE_90: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      MANAGER_90: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    };

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded cursor-move">
            <GripVertical size={16} className="text-gray-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                  Order: {question.order}
                </span>
                
                {/* Exit Interview Section */}
                {activeType === 'exit_interview' && question.section && (
                  <span className={`text-xs px-2 py-1 rounded font-medium ${sectionColors[question.section]}`}>
                    {question.section}
                  </span>
                )}
                
                {/* Probation Review Type */}
                {activeType === 'probation_review' && question.review_type && (
                  <span className={`text-xs px-2 py-1 rounded font-medium ${reviewTypeColors[question.review_type]}`}>
                    {question.review_type.replace(/_/g, ' ')}
                  </span>
                )}
                
                {/* Question Type */}
                <span className="text-xs px-2 py-1 rounded bg-almet-sapphire/10 text-almet-sapphire dark:text-almet-steel-blue font-medium flex items-center gap-1">
                  {typeIcons[question.question_type]}
                  {question.question_type}
                </span>
                
                {/* Required Badge */}
                {question.is_required && (
                  <span className="text-xs px-2 py-1 rounded bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium">
                    Required
                  </span>
                )}
                
                {/* Active Badge */}
                {!question.is_active && (
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
                    Inactive
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleEditQuestion(question)}
                  className="p-1.5 text-almet-sapphire hover:bg-almet-mystic dark:hover:bg-almet-cloud-burst/30 rounded transition-colors"
                  title="Edit question"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                  title="Delete question"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-900 dark:text-gray-200 mb-2">
              {question.question_text_en}
            </p>
            
            {question.question_text_az && (
              <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                AZ: {question.question_text_az}
              </p>
            )}
            
            {question.choices && question.choices.length > 0 && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">Choices: </span>
                {question.choices.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const groupedQuestions = () => {
    if (activeType === 'exit_interview') {
      const sections = ['ROLE', 'MANAGEMENT', 'COMPENSATION', 'CONDITIONS', 'CULTURE', 'FINAL'];
      return sections.map(section => ({
        label: section.replace(/_/g, ' '),
        key: section,
        questions: questions.filter(q => q.section === section)
      }));
    } else {
      // ✅ Probation review types
      const types = [
        { key: 'EMPLOYEE_30', label: 'EMPLOYEE 30' },
        { key: 'MANAGER_30', label: 'MANAGER 30' },
        { key: 'EMPLOYEE_60', label: 'EMPLOYEE 60' },
        { key: 'MANAGER_60', label: 'MANAGER 60' },
        { key: 'EMPLOYEE_90', label: 'EMPLOYEE 90' },
        { key: 'MANAGER_90', label: 'MANAGER 90' }
      ];
      
      return types.map(type => ({
        label: type.label,
        key: type.key,
        questions: questions.filter(q => q.review_type === type.key)
      }));
    }
  };

  const getTotalCount = () => questions.length;
  const getExitInterviewCount = () => questions.filter(q => q.section).length;
  const getProbationReviewCount = () => questions.filter(q => q.review_type).length;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl font-bold">Question Management</h1>
                <p className="text-blue-100 text-xs mt-1">
                  Manage exit interview and probation review questions • {getTotalCount()} total questions
                </p>
              </div>
            </div>
            <button
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-white text-almet-sapphire rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
            >
              <Plus size={16} />
              Add Question
            </button>
          </div>
        </div>

        {/* Type Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 flex gap-1 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveType('exit_interview')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeType === 'exit_interview'
                ? 'bg-almet-sapphire text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Exit Interview Questions
            <span className="ml-2 text-xs opacity-75">
              ({getExitInterviewCount()})
            </span>
          </button>
          <button
            onClick={() => setActiveType('probation_review')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeType === 'probation_review'
                ? 'bg-almet-sapphire text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Probation Review Questions
            <span className="ml-2 text-xs opacity-75">
              ({getProbationReviewCount()})
            </span>
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-almet-sapphire mx-auto mb-3"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading questions...</p>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Questions Yet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Get started by creating your first {activeType === 'exit_interview' ? 'exit interview' : 'probation review'} question
              </p>
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm font-medium inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>
          ) : (
            groupedQuestions().map((group) => (
              <div key={group.key} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {group.label}
                  </h3>
                  <span className="text-xs font-medium px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                    {group.questions.length} {group.questions.length === 1 ? 'question' : 'questions'}
                  </span>
                </div>
                
                {group.questions.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      No questions in this section
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {group.questions
                      .sort((a, b) => a.order - b.order)
                      .map(question => (
                        <QuestionCard key={question.id} question={question} />
                      ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <QuestionFormModal
            questionType={activeType}
            editingQuestion={editingQuestion}
            onClose={() => {
              setShowModal(false);
              setEditingQuestion(null);
            }}
            onSuccess={() => {
              setShowModal(false);
              setEditingQuestion(null);
              loadQuestions();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// ========================================
// Question Form Modal Component
// ========================================
function QuestionFormModal({ questionType, editingQuestion, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    question_text_en: editingQuestion?.question_text_en || '',
    question_text_az: editingQuestion?.question_text_az || '',
    question_type: editingQuestion?.question_type || 'RATING',
    section: editingQuestion?.section || 'ROLE',
    review_type: editingQuestion?.review_type || 'EMPLOYEE_30',
    order: editingQuestion?.order || 0,
    is_required: editingQuestion?.is_required || false,
    is_active: editingQuestion?.is_active !== false,
    choices: editingQuestion?.choices || []
  });
  const [choiceInput, setChoiceInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddChoice = () => {
    if (choiceInput.trim()) {
      setFormData({
        ...formData,
        choices: [...formData.choices, choiceInput.trim()]
      });
      setChoiceInput('');
    }
  };

  const handleRemoveChoice = (index) => {
    setFormData({
      ...formData,
      choices: formData.choices.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    if (!formData.question_text_en.trim()) {
      alert('Please enter question text in English');
      return;
    }

    try {
      setSubmitting(true);

      if (questionType === 'exit_interview') {
        if (editingQuestion) {
          await resignationExitService.exitInterview.updateQuestion(editingQuestion.id, formData);
        } else {
          await resignationExitService.exitInterview.createQuestion(formData);
        }
      } else {
        if (editingQuestion) {
          await resignationExitService.probationReview.updateQuestion(editingQuestion.id, formData);
        } else {
          await resignationExitService.probationReview.createQuestion(formData);
        }
      }

      alert(`Question ${editingQuestion ? 'updated' : 'created'} successfully!`);
      onSuccess();
    } catch (err) {
      console.error('Error saving question:', err);
      alert(err.response?.data?.detail || 'Failed to save question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-almet-sapphire to-almet-astral p-4 text-white flex items-center justify-between z-10 border-b border-white/10">
          <h2 className="text-lg font-bold">
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.question_type}
              onChange={(e) => setFormData({...formData, question_type: e.target.value})}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
            >
              <option value="RATING">Rating (1-5)</option>
              <option value="TEXT">Text Response</option>
              <option value="TEXTAREA">Long Text Response</option>
              {questionType === 'exit_interview' && <option value="CHOICE">Multiple Choice</option>}
              {questionType === 'probation_review' && <option value="YES_NO">Yes/No</option>}
            </select>
          </div>

          {/* Section / Review Type */}
          {questionType === 'exit_interview' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Section <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({...formData, section: e.target.value})}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
              >
                <option value="ROLE">Role & Responsibilities</option>
                <option value="MANAGEMENT">Work Environment & Management</option>
                <option value="COMPENSATION">Compensation & Career Development</option>
                <option value="CONDITIONS">Work Conditions</option>
                <option value="CULTURE">Company Culture & Values</option>
                <option value="FINAL">Final Comments</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.review_type}
                onChange={(e) => setFormData({...formData, review_type: e.target.value})}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
              >
                <option value="EMPLOYEE_30">Employee 30-Day</option>
                <option value="MANAGER_30">Manager 30-Day</option>
                <option value="EMPLOYEE_60">Employee 60-Day</option>
                <option value="MANAGER_60">Manager 60-Day</option>
                <option value="EMPLOYEE_90">Employee 90-Day</option>
                <option value="MANAGER_90">Manager 90-Day</option>
              </select>
            </div>
          )}

          {/* Question Text (English) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Text (English) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.question_text_en}
              onChange={(e) => setFormData({...formData, question_text_en: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none"
              placeholder="Enter question in English..."
            />
          </div>

          {/* Question Text (Azerbaijani) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Text (Azerbaijani)
            </label>
            <textarea
              value={formData.question_text_az}
              onChange={(e) => setFormData({...formData, question_text_az: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none"
              placeholder="Sualı Azərbaycan dilində daxil edin..."
            />
          </div>

          {/* Choices (for CHOICE type) */}
          {formData.question_type === 'CHOICE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Answer Choices
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={choiceInput}
                  onChange={(e) => setChoiceInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChoice())}
                  placeholder="Enter choice and press Enter..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddChoice}
                  className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral text-sm font-medium"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1">
                {formData.choices.map((choice, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">{choice}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChoice(index)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
              min="0"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) => setFormData({...formData, is_required: e.target.checked})}
                className="w-4 h-4 text-almet-sapphire rounded border-gray-300 focus:ring-2 focus:ring-almet-sapphire"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors">
                Required Question
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-4 h-4 text-almet-sapphire rounded border-gray-300 focus:ring-2 focus:ring-almet-sapphire"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors">
                Active
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-5 py-3 flex gap-3 justify-end border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Saving...
          </>
        ) : (
          <>
            <Save size={14} />
            {editingQuestion ? 'Update' : 'Create'} Question
          </>
        )}
      </button>
    </div>
  </div>
</div>)}