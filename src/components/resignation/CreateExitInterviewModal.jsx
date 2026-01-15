'use client';
import React, { useState, useEffect } from 'react';
import { X, Send, Search, User, Calendar, Briefcase, TrendingUp, Building, Award, MessageSquare } from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';
import { employeeService } from "@/services/newsService"
export default function CreateExitInterviewModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Select Employee, 2: Fill Questions
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userAccess, setUserAccess] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentSection, setCurrentSection] = useState('ROLE');
  
  const [formData, setFormData] = useState({
    employee: '',
    last_working_day: '',
    resignation_request: null
  });

  const [responses, setResponses] = useState({});

  const sections = [
    { id: 'ROLE', label: 'Role & Responsibilities', icon: Briefcase },
    { id: 'MANAGEMENT', label: 'Management', icon: User },
    { id: 'COMPENSATION', label: 'Compensation', icon: TrendingUp },
    { id: 'CONDITIONS', label: 'Work Conditions', icon: Building },
    { id: 'CULTURE', label: 'Culture & Values', icon: Award },
    { id: 'FINAL', label: 'Final Comments', icon: MessageSquare },
  ];

  useEffect(() => {
    fetchUserAccess();
  }, []);

  useEffect(() => {
    if (userAccess?.is_admin) {
      loadEmployees();
    }
  }, [userAccess]);

  const fetchUserAccess = async () => {
    try {
      const accessInfo = await resignationExitService.getCurrentUser();
      setUserAccess(accessInfo);
    } catch (error) {
      console.error('Error fetching user access:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      
      const response = await employeeService.getEmployees({ 
        page_size: 1000,
        status__affects_headcount: true
      });
      setEmployees(response.results || []);
    } catch (err) {
      console.error('Error loading employees:', err);
      alert('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
  try {
    setLoadingQuestions(true);
    const data = await resignationExitService.exitInterview.getQuestions();
    
    console.log('API Response:', data); // ✅ Debug: See what API returns
    console.log('Is Array?', Array.isArray(data)); // ✅ Debug: Check if array
    
    // ✅ Handle different response formats
    let questionsArray = [];
    
    if (Array.isArray(data)) {
      questionsArray = data;
    } else if (data && Array.isArray(data.results)) {
      // If API returns paginated response: { results: [], count: X }
      questionsArray = data.results;
    } else if (data && typeof data === 'object') {
      // If API returns single object, wrap in array
      questionsArray = [data];
    }
    
    console.log('Processed Questions:', questionsArray); // ✅ Debug
    
    setQuestions(questionsArray);
    
    // Initialize responses
    const initialResponses = {};
    questionsArray.forEach(q => {
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
    setQuestions([]);
    alert('Failed to load exit interview questions');
  } finally {
    setLoadingQuestions(false);
  }
};

  const handleContinueToQuestions = async () => {
    // Validation
    if (!formData.employee) {
      alert('Please select an employee');
      return;
    }
    if (!formData.last_working_day) {
      alert('Please select last working day');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDay = new Date(formData.last_working_day);
    
    if (lastDay < today) {
      alert('Last working day cannot be in the past');
      return;
    }

    // Load questions and move to step 2
    await loadQuestions();
    setStep(2);
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

    console.log('📝 Creating exit interview with data:', {
      employee: formData.employee,
      last_working_day: formData.last_working_day,
      resignation_request: formData.resignation_request
    });

    // Step 1: Create exit interview
    const exitInterview = await resignationExitService.exitInterview.createExitInterview({
      employee: formData.employee,
      last_working_day: formData.last_working_day,
      resignation_request: formData.resignation_request
    });

    console.log('✅ Exit Interview Created:', exitInterview); // ✅ Debug
    console.log('📌 Interview ID:', exitInterview.id); // ✅ Check ID

    // ✅ Check if ID exists
    if (!exitInterview || !exitInterview.id) {
      console.error('❌ No interview ID returned from API');
      alert('Failed to create exit interview - no ID returned');
      return;
    }

    // Step 2: Submit responses
    const responsesArray = Object.values(responses);
    
    console.log('📤 Submitting responses for interview:', exitInterview.id);
    console.log('📋 Responses array:', responsesArray);

    await resignationExitService.exitInterview.submitResponses(
      exitInterview.id,
      responsesArray
    );

    console.log('✅ Exit interview completed successfully!');
    alert('Exit interview created and completed successfully!');
    onSuccess && onSuccess();
    onClose();

  } catch (err) {
    console.error('❌ Error creating exit interview:', err);
    console.error('Error details:', err.response?.data);
    alert(err.response?.data?.detail || err.message || 'Failed to create exit interview');
  } finally {
    setSubmitting(false);
  }
};

  const filteredEmployees = employees.filter(emp => 
    emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEmployee = employees.find(e => e.id === parseInt(formData.employee));
  const sectionQuestions = questions.filter(q => q.section === currentSection);

  // Question Components
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
                    ? 'bg-red-600 text-white shadow-md scale-105'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {labels[currentValue - 1]}
          </span>
        </div>
      </div>
    );
  };

  const TextQuestion = ({ question }) => (
    <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {question.question_text_en}
        {question.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={responses[question.id]?.text_value || ''}
        onChange={(e) => handleResponseChange(question.id, 'text_value', e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
        placeholder="Enter answer..."
      />
    </div>
  );

  const TextAreaQuestion = ({ question }) => (
    <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {question.question_text_en}
        {question.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={responses[question.id]?.text_value || ''}
        onChange={(e) => handleResponseChange(question.id, 'text_value', e.target.value)}
        rows={4}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
        placeholder="Enter answer..."
      />
    </div>
  );

  const ChoiceQuestion = ({ question }) => (
    <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {question.question_text_en}
        {question.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={responses[question.id]?.choice_value || ''}
        onChange={(e) => handleResponseChange(question.id, 'choice_value', e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
      >
        <option value="">Select an option...</option>
        {question.choices && question.choices.map((choice, idx) => (
          <option key={idx} value={choice}>{choice}</option>
        ))}
      </select>
    </div>
  );

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

  const currentSectionIndex = sections.findIndex(s => s.id === currentSection);
  const SectionIcon = sections[currentSectionIndex]?.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-500 to-pink-600 p-4 text-white flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold">
              {step === 1 ? 'Create Exit Interview' : 'Complete Exit Interview'}
            </h2>
            <p className="text-red-100 mt-0.5 text-xs">
              {step === 1 ? 'Select employee and last working day' : `Conducting exit interview for ${selectedEmployee?.full_name}`}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Employee Selection */}
        {step === 1 && (
          <div className="p-5 space-y-4">
            {/* Employee Search & Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Employee <span className="text-red-500">*</span>
              </label>
              
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search employee by name or ID..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-sm text-gray-500">Loading employees...</div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No employees found</div>
                ) : (
                  filteredEmployees.map(employee => (
                    <label
                      key={employee.id}
                      className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                        formData.employee === employee.id.toString() ? 'bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="employee"
                        value={employee.id}
                        checked={formData.employee === employee.id.toString()}
                        onChange={(e) => setFormData({...formData, employee: e.target.value})}
                        className="w-4 h-4 text-red-600"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {employee.full_name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {employee.employee_id} • {employee.job_title} • {employee.department?.name}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {selectedEmployee && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">Selected Employee:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-blue-600 dark:text-blue-400">Name</p>
                    <p className="font-medium text-blue-900 dark:text-blue-100">{selectedEmployee.full_name}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 dark:text-blue-400">Employee ID</p>
                    <p className="font-medium text-blue-900 dark:text-blue-100">{selectedEmployee.employee_id}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 dark:text-blue-400">Position</p>
                    <p className="font-medium text-blue-900 dark:text-blue-100">{selectedEmployee.job_title}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 dark:text-blue-400">Department</p>
                    <p className="font-medium text-blue-900 dark:text-blue-100">{selectedEmployee.department?.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Last Working Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Working Day <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="date"
                  value={formData.last_working_day}
                  onChange={(e) => setFormData({...formData, last_working_day: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Questions */}
        {step === 2 && (
          <>
            {loadingQuestions ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading questions...</p>
              </div>
            ) : (
              <>
                {/* Section Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 ">
                  <div className="flex overflow-x-auto">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setCurrentSection(section.id)}
                          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                            currentSection === section.id
                              ? 'border-red-500 text-red-600 dark:text-red-400 bg-white dark:bg-gray-800'
                              : 'border-transparent text-gray-600 dark:text-gray-400'
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
                      <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                        <SectionIcon className="text-red-600" size={20} />
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                        {sections[currentSectionIndex]?.label}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
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
                    {currentSectionIndex > 0 && (
                      <button
                        onClick={() => setCurrentSection(sections[currentSectionIndex - 1].id)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 text-xs font-medium"
                      >
                        Previous
                      </button>
                    )}
                    
                    {currentSectionIndex < sections.length - 1 ? (
                      <button
                        onClick={() => setCurrentSection(sections[currentSectionIndex + 1].id)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium"
                      >
                        Next Section
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send size={14} />
                            Complete Exit Interview
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-5 py-3 flex gap-3 justify-end border-t border-gray-200 dark:border-gray-600">
          {step === 1 && (
            <>
              <button 
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleContinueToQuestions}
                disabled={!formData.employee || !formData.last_working_day}
                className="px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Continue to Questions
                <Send size={14} />
              </button>
            </>
          )}
          {step === 2 && (
            <button 
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300"
            >
              Back to Employee Selection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}