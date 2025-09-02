'use client';
import React, { useState, useEffect } from 'react';
import { 
  Settings, ArrowLeft, Plus, Edit, Trash2, Save, X, 
  Target, Users, Award, Scale, AlertCircle, CheckCircle,
  Loader2, ChevronRight, Hash
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import { assessmentApi } from '@/services/assessmentApi';

const AssessmentSettings = ({ onBack }) => {
  const { darkMode } = useTheme();
  
  // States
  const [activeSection, setActiveSection] = useState('behavioral');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data states
  const [behavioralScales, setBehavioralScales] = useState([]);
  const [coreScales, setCoreScales] = useState([]);
  const [letterGrades, setLetterGrades] = useState([]);
  
  // Modal states
  const [showBehavioralModal, setShowBehavioralModal] = useState(false);
  const [showCoreModal, setShowCoreModal] = useState(false);
  const [showLetterGradeModal, setShowLetterGradeModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form states
  const [behavioralFormData, setBehavioralFormData] = useState({
    scale: '',
    description: '',
    is_active: true
  });
  
  const [coreFormData, setCoreFormData] = useState({
    scale: '',
    description: '',
    is_active: true
  });
  
  const [letterGradeFormData, setLetterGradeFormData] = useState({
    letter_grade: '',
    min_percentage: '',
    max_percentage: '',
    description: '',
    is_active: true
  });
  
  // Theme classes
  const bgCard = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const bgCardHover = darkMode ? 'bg-almet-san-juan' : 'bg-gray-50';
  const textPrimary = darkMode ? 'text-white' : 'text-almet-cloud-burst';
  const textSecondary = darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo';
  const borderColor = darkMode ? 'border-almet-comet' : 'border-gray-200';
  const bgAccent = darkMode ? 'bg-almet-comet' : 'bg-almet-mystic';

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [behavioralRes, coreRes, letterGradesRes] = await Promise.all([
        assessmentApi.behavioralScales.getAll(),
        assessmentApi.coreScales.getAll(),
        assessmentApi.letterGrades.getAll()
      ]);
      
      setBehavioralScales(behavioralRes.results || []);
      setCoreScales(coreRes.results || []);
      setLetterGrades(letterGradesRes.results || []);
      
    } catch (err) {
      console.error('Error fetching settings data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper components
  const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', loading = false, disabled = false, size = 'sm' }) => {
    const variants = {
      primary: 'bg-almet-sapphire hover:bg-almet-astral text-white',
      secondary: 'bg-almet-bali-hai hover:bg-almet-waterloo text-white',
      success: 'bg-green-500 hover:bg-green-600 text-white',
      danger: 'bg-red-500 hover:bg-red-600 text-white',
      outline: 'border-2 border-almet-sapphire text-almet-sapphire hover:bg-almet-sapphire hover:text-white'
    };

    const sizes = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm'
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          flex items-center gap-2 rounded-lg font-medium
          transition-all duration-200 hover:shadow-md ${variants[variant]} ${sizes[size]}
          ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
        {label}
      </button>
    );
  };

  const StatusBadge = ({ isActive }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
      isActive 
        ? 'bg-green-100 text-green-800 border-green-200' 
        : 'bg-red-100 text-red-800 border-red-200'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  // Handle CRUD operations
  const handleCreateBehavioral = async () => {
    if (!behavioralFormData.scale || !behavioralFormData.description) {
      setError({ message: 'Please fill all required fields' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await assessmentApi.behavioralScales.update(editingItem.id, behavioralFormData);
        setSuccessMessage('Behavioral scale updated successfully');
      } else {
        await assessmentApi.behavioralScales.create(behavioralFormData);
        setSuccessMessage('Behavioral scale created successfully');
      }
      
      await fetchData();
      setShowBehavioralModal(false);
      setBehavioralFormData({ scale: '', description: '', is_active: true });
      setEditingItem(null);
    } catch (err) {
      console.error('Error with behavioral scale:', err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCore = async () => {
    if (!coreFormData.scale || !coreFormData.description) {
      setError({ message: 'Please fill all required fields' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await assessmentApi.coreScales.update(editingItem.id, coreFormData);
        setSuccessMessage('Core scale updated successfully');
      } else {
        await assessmentApi.coreScales.create(coreFormData);
        setSuccessMessage('Core scale created successfully');
      }
      
      await fetchData();
      setShowCoreModal(false);
      setCoreFormData({ scale: '', description: '', is_active: true });
      setEditingItem(null);
    } catch (err) {
      console.error('Error with core scale:', err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLetterGrade = async () => {
    if (!letterGradeFormData.letter_grade || !letterGradeFormData.min_percentage || !letterGradeFormData.max_percentage) {
      setError({ message: 'Please fill all required fields' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await assessmentApi.letterGrades.update(editingItem.id, letterGradeFormData);
        setSuccessMessage('Letter grade updated successfully');
      } else {
        await assessmentApi.letterGrades.create(letterGradeFormData);
        setSuccessMessage('Letter grade created successfully');
      }
      
      await fetchData();
      setShowLetterGradeModal(false);
      setLetterGradeFormData({ letter_grade: '', min_percentage: '', max_percentage: '', description: '', is_active: true });
      setEditingItem(null);
    } catch (err) {
      console.error('Error with letter grade:', err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      if (type === 'behavioral') {
        await assessmentApi.behavioralScales.delete(id);
      } else if (type === 'core') {
        await assessmentApi.coreScales.delete(id);
      } else if (type === 'letter') {
        await assessmentApi.letterGrades.delete(id);
      }
      
      await fetchData();
      setSuccessMessage('Item deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      setError(err);
    }
  };

  const handleEdit = (item, type) => {
    setEditingItem(item);
    if (type === 'behavioral') {
      setBehavioralFormData({
        scale: item.scale,
        description: item.description,
        is_active: item.is_active
      });
      setShowBehavioralModal(true);
    } else if (type === 'core') {
      setCoreFormData({
        scale: item.scale,
        description: item.description,
        is_active: item.is_active
      });
      setShowCoreModal(true);
    } else if (type === 'letter') {
      setLetterGradeFormData({
        letter_grade: item.letter_grade,
        min_percentage: item.min_percentage,
        max_percentage: item.max_percentage,
        description: item.description,
        is_active: item.is_active
      });
      setShowLetterGradeModal(true);
    }
  };

  // Success Toast
  const SuccessToast = ({ message, onClose }) => {
    useEffect(() => {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }, [onClose]);

    return (
      <div className="fixed bottom-6 right-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 shadow-2xl z-50 max-w-sm">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-green-800 font-bold text-sm">Success!</h4>
            <p className="text-green-700 text-sm mt-1">{message}</p>
          </div>
          <button onClick={onClose} className="text-green-600 hover:text-green-800">
            <X size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${bgCard} rounded-xl p-6 shadow-lg border-2 ${borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ActionButton
              onClick={onBack}
              icon={ArrowLeft}
              label="Back"
              variant="outline"
              size="md"
            />
            <div>
              <h1 className={`text-2xl font-bold ${textPrimary} flex items-center gap-3`}>
                <div className="p-2 bg-almet-sapphire bg-opacity-10 rounded-lg">
                  <Settings className="w-6 h-6 text-almet-sapphire" />
                </div>
                Assessment Settings
              </h1>
              <p className={`text-sm ${textSecondary} mt-1`}>
                Configure assessment scales and grading systems
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className={`${bgCard} rounded-xl p-2 shadow-lg border-2 ${borderColor}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <button
            onClick={() => setActiveSection('behavioral')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeSection === 'behavioral'
                ? 'bg-almet-sapphire text-white shadow-md'
                : `${textSecondary} hover:${textPrimary} hover:bg-almet-mystic`
            }`}
          >
            <Users size={16} />
            <div className="text-left">
              <div className="text-sm font-semibold">Behavioral Settings</div>
              <div className="text-xs opacity-75">Behavioral competency scales</div>
            </div>
            <ChevronRight size={16} className={activeSection === 'behavioral' ? 'rotate-90' : ''} />
          </button>
          
          <button
            onClick={() => setActiveSection('core')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeSection === 'core'
                ? 'bg-almet-sapphire text-white shadow-md'
                : `${textSecondary} hover:${textPrimary} hover:bg-almet-mystic`
            }`}
          >
            <Target size={16} />
            <div className="text-left">
              <div className="text-sm font-semibold">Core Settings</div>
              <div className="text-xs opacity-75">Core competency scales</div>
            </div>
            <ChevronRight size={16} className={activeSection === 'core' ? 'rotate-90' : ''} />
          </button>
          
          <button
            onClick={() => setActiveSection('grading')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeSection === 'grading'
                ? 'bg-almet-sapphire text-white shadow-md'
                : `${textSecondary} hover:${textPrimary} hover:bg-almet-mystic`
            }`}
          >
            <Award size={16} />
            <div className="text-left">
              <div className="text-sm font-semibold">Letter Grading</div>
              <div className="text-xs opacity-75">Grade mapping settings</div>
            </div>
            <ChevronRight size={16} className={activeSection === 'grading' ? 'rotate-90' : ''} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className={`${bgCard} rounded-xl p-8 text-center border-2 ${borderColor}`}>
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-almet-sapphire" />
          <p className={textSecondary}>Loading settings...</p>
        </div>
      ) : (
        <div className={`${bgCard} rounded-xl shadow-lg border-2 ${borderColor}`}>
          {/* Header with Add Button */}
          <div className={`${bgAccent} px-6 py-4 border-b-2 ${borderColor} flex items-center justify-between`}>
            <h3 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
              {activeSection === 'behavioral' && <><Users size={18} />Behavioral Competency Scales</>}
              {activeSection === 'core' && <><Target size={18} />Core Competency Scales</>}
              {activeSection === 'grading' && <><Award size={18} />Letter Grade Mapping</>}
            </h3>
            <ActionButton
              onClick={() => {
                if (activeSection === 'behavioral') setShowBehavioralModal(true);
                else if (activeSection === 'core') setShowCoreModal(true);
                else if (activeSection === 'grading') setShowLetterGradeModal(true);
              }}
              icon={Plus}
              label="Add New"
              variant="primary"
            />
          </div>

          {/* Content */}
          <div className="p-6">
            {activeSection === 'behavioral' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b-2 ${borderColor}`}>
                      <th className={`text-left py-3 font-semibold ${textPrimary}`}>Scale</th>
                      <th className={`text-left py-3 font-semibold ${textPrimary}`}>Description</th>
                      <th className={`text-left py-3 font-semibold ${textPrimary}`}>Status</th>
                      <th className={`text-left py-3 font-semibold ${textPrimary}`}>Created</th>
                      <th className={`text-center py-3 font-semibold ${textPrimary}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {behavioralScales.length > 0 ? (
                      behavioralScales.map((scale) => (
                        <tr key={scale.id} className={`border-b ${borderColor} hover:${bgCardHover} transition-colors`}>
                          <td className={`py-4 ${textPrimary} font-bold text-lg`}>{scale.scale}</td>
                          <td className={`py-4 ${textPrimary}`}>{scale.description}</td>
                          <td className="py-4">
                            <StatusBadge isActive={scale.is_active} />
                          </td>
                          <td className={`py-4 ${textSecondary} text-sm`}>
                            {new Date(scale.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <ActionButton
                                onClick={() => handleEdit(scale, 'behavioral')}
                                icon={Edit}
                                label="Edit"
                                variant="outline"
                                size="xs"
                              />
                              <ActionButton
                                onClick={() => handleDelete(scale.id, 'behavioral')}
                                icon={Trash2}
                                label="Delete"
                                variant="danger"
                                size="xs"
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-12">
                          <Scale className={`w-12 h-12 mx-auto mb-4 ${textSecondary} opacity-50`} />
                          <p className={`${textSecondary} font-medium`}>No behavioral scales found</p>
                          <p className={`${textSecondary} text-sm mt-2`}>Create your first behavioral scale</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeSection === 'core' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b-2 ${borderColor}`}>
                      <th className={`text-left py-3 font-semibold ${textPrimary}`}>Scale</th>
                      <th className={`text-left py-3 font-semibold ${textPrimary}`}>Description</th>
                      <th className={`text-left py-3 font-semibold ${textPrimary}`}>Status</th>
                      <th className={`text-left py-3 font-semibold ${textPrimary}`}>Created</th>
                      <th className={`text-center py-3 font-semibold ${textPrimary}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coreScales.length > 0 ? (
                      coreScales.map((scale) => (
                        <tr key={scale.id} className={`border-b ${borderColor} hover:${bgCardHover} transition-colors`}>
                          <td className={`py-4 ${textPrimary} font-bold text-lg`}>{scale.scale}</td>
                          <td className={`py-4 ${textPrimary}`}>{scale.description}</td>
                          <td className="py-4">
                            <StatusBadge isActive={scale.is_active} />
                          </td>
                          <td className={`py-4 ${textSecondary} text-sm`}>
                            {new Date(scale.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <ActionButton
                                onClick={() => handleEdit(scale, 'core')}
                                icon={Edit}
                                label="Edit"
                                variant="outline"
                                size="xs"
                              />
                              <ActionButton
                                onClick={() => handleDelete(scale.id, 'core')}
                                icon={Trash2}
                                label="Delete"
                                variant="danger"
                                size="xs"
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-12">
                          <Target className={`w-12 h-12 mx-auto mb-4 ${textSecondary} opacity-50`} />
                          <p className={`${textSecondary} font-medium`}>No core scales found</p>
                          <p className={`${textSecondary} text-sm mt-2`}>Create your first core scale</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeSection === 'grading' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b-2 ${borderColor}`}>
                      <th className={`text-left py-3 font-semibold ${textPrimary}`}>Grade</th>
                      <th className={`text-left py-3 font-semibold ${textPrimary}`}>Range</th>
                      <th className={`text-left py-3 font-semibold ${textPrimary}`}>Description</th>
                      <th className={`text-left py-3 font-semibold ${textPrimary}`}>Status</th>
                      <th className={`text-center py-3 font-semibold ${textPrimary}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {letterGrades.length > 0 ? (
                      letterGrades.map((grade) => (
                        <tr key={grade.id} className={`border-b ${borderColor} hover:${bgCardHover} transition-colors`}>
                          <td className={`py-4 ${textPrimary} font-bold text-xl`}>{grade.letter_grade}</td>
                          <td className={`py-4 ${textPrimary}`}>
                            {grade.min_percentage}% - {grade.max_percentage}%
                          </td>
                          <td className={`py-4 ${textPrimary}`}>{grade.description}</td>
                          <td className="py-4">
                            <StatusBadge isActive={grade.is_active} />
                          </td>
                          <td className="py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <ActionButton
                                onClick={() => handleEdit(grade, 'letter')}
                                icon={Edit}
                                label="Edit"
                                variant="outline"
                                size="xs"
                              />
                              <ActionButton
                                onClick={() => handleDelete(grade.id, 'letter')}
                                icon={Trash2}
                                label="Delete"
                                variant="danger"
                                size="xs"
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-12">
                          <Award className={`w-12 h-12 mx-auto mb-4 ${textSecondary} opacity-50`} />
                          <p className={`${textSecondary} font-medium`}>No letter grades found</p>
                          <p className={`${textSecondary} text-sm mt-2`}>Create your first letter grade</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Behavioral Scale Modal */}
      {showBehavioralModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${bgCard} rounded-xl p-6 w-full max-w-md border-2 ${borderColor} shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${textPrimary} flex items-center gap-3`}>
                <Users className="w-5 h-5 text-almet-sapphire" />
                {editingItem ? 'Edit' : 'Create'} Behavioral Scale
              </h3>
              <button
                onClick={() => {
                  setShowBehavioralModal(false);
                  setBehavioralFormData({ scale: '', description: '', is_active: true });
                  setEditingItem(null);
                }}
                className={`p-2 rounded-lg ${textSecondary} hover:${bgCardHover} transition-colors`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Scale Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={behavioralFormData.scale}
                  placeholder="Enter scale number (e.g., 1, 2, 3...)"
                  className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm ${
                    darkMode ? 'bg-almet-cloud-burst text-white' : 'bg-white text-almet-cloud-burst'
                  } focus:border-almet-sapphire focus:outline-none`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={behavioralFormData.description}
                  onChange={(e) => setBehavioralFormData({...behavioralFormData, description: e.target.value})}
                  placeholder="Enter scale description..."
                  rows="3"
                  className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm resize-none ${
                    darkMode ? 'bg-almet-cloud-burst text-white' : 'bg-white text-almet-cloud-burst'
                  } focus:border-almet-sapphire focus:outline-none`}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="behavioral-active"
                  checked={behavioralFormData.is_active}
                  onChange={(e) => setBehavioralFormData({...behavioralFormData, is_active: e.target.checked})}
                  className="w-4 h-4 text-almet-sapphire border-2 border-gray-300 rounded focus:ring-almet-sapphire"
                />
                <label htmlFor="behavioral-active" className={`ml-2 text-sm ${textPrimary}`}>
                  Active
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t-2 border-gray-200">
              <ActionButton
                onClick={() => {
                  setShowBehavioralModal(false);
                  setBehavioralFormData({ scale: '', description: '', is_active: true });
                  setEditingItem(null);
                }}
                icon={X}
                label="Cancel"
                disabled={isSubmitting}
                variant="outline"
              />
              <ActionButton
                onClick={handleCreateBehavioral}
                icon={editingItem ? Save : Plus}
                label={editingItem ? 'Update' : 'Create'}
                disabled={!behavioralFormData.scale || !behavioralFormData.description}
                loading={isSubmitting}
                variant="primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Core Scale Modal */}
      {showCoreModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${bgCard} rounded-xl p-6 w-full max-w-md border-2 ${borderColor} shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${textPrimary} flex items-center gap-3`}>
                <Target className="w-5 h-5 text-almet-sapphire" />
                {editingItem ? 'Edit' : 'Create'} Core Scale
              </h3>
              <button
                onClick={() => {
                  setShowCoreModal(false);
                  setCoreFormData({ scale: '', description: '', is_active: true });
                  setEditingItem(null);
                }}
                className={`p-2 rounded-lg ${textSecondary} hover:${bgCardHover} transition-colors`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Scale Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={coreFormData.scale}
                  onChange={(e) => setCoreFormData({...coreFormData, scale: parseInt(e.target.value)})}
                  placeholder="Enter scale number (e.g., 0, 1, 2, 3...)"
                  className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm ${
                    darkMode ? 'bg-almet-cloud-burst text-white' : 'bg-white text-almet-cloud-burst'
                  } focus:border-almet-sapphire focus:outline-none`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={coreFormData.description}
                  onChange={(e) => setCoreFormData({...coreFormData, description: e.target.value})}
                  placeholder="Enter scale description..."
                  rows="3"
                  className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm resize-none ${
                    darkMode ? 'bg-almet-cloud-burst text-white' : 'bg-white text-almet-cloud-burst'
                  } focus:border-almet-sapphire focus:outline-none`}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="core-active"
                  checked={coreFormData.is_active}
                  onChange={(e) => setCoreFormData({...coreFormData, is_active: e.target.checked})}
                  className="w-4 h-4 text-almet-sapphire border-2 border-gray-300 rounded focus:ring-almet-sapphire"
                />
                <label htmlFor="core-active" className={`ml-2 text-sm ${textPrimary}`}>
                  Active
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t-2 border-gray-200">
              <ActionButton
                onClick={() => {
                  setShowCoreModal(false);
                  setCoreFormData({ scale: '', description: '', is_active: true });
                  setEditingItem(null);
                }}
                icon={X}
                label="Cancel"
                disabled={isSubmitting}
                variant="outline"
              />
              <ActionButton
                onClick={handleCreateCore}
                icon={editingItem ? Save : Plus}
                label={editingItem ? 'Update' : 'Create'}
                disabled={!coreFormData.scale || !coreFormData.description}
                loading={isSubmitting}
                variant="primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Letter Grade Modal */}
      {showLetterGradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${bgCard} rounded-xl p-6 w-full max-w-md border-2 ${borderColor} shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${textPrimary} flex items-center gap-3`}>
                <Award className="w-5 h-5 text-almet-sapphire" />
                {editingItem ? 'Edit' : 'Create'} Letter Grade
              </h3>
              <button
                onClick={() => {
                  setShowLetterGradeModal(false);
                  setLetterGradeFormData({ letter_grade: '', min_percentage: '', max_percentage: '', description: '', is_active: true });
                  setEditingItem(null);
                }}
                className={`p-2 rounded-lg ${textSecondary} hover:${bgCardHover} transition-colors`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Letter Grade <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={letterGradeFormData.letter_grade}
                  onChange={(e) => setLetterGradeFormData({...letterGradeFormData, letter_grade: e.target.value.toUpperCase()})}
                  placeholder="Enter grade letter (A, B, C, D, E, F)"
                  maxLength="1"
                  className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm ${
                    darkMode ? 'bg-almet-cloud-burst text-white' : 'bg-white text-almet-cloud-burst'
                  } focus:border-almet-sapphire focus:outline-none`}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    Min % <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={letterGradeFormData.min_percentage}
                    onChange={(e) => setLetterGradeFormData({...letterGradeFormData, min_percentage: parseFloat(e.target.value)})}
                    placeholder="0"
                    min="0"
                    max="100"
                    className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm ${
                      darkMode ? 'bg-almet-cloud-burst text-white' : 'bg-white text-almet-cloud-burst'
                    } focus:border-almet-sapphire focus:outline-none`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    Max % <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={letterGradeFormData.max_percentage}
                    onChange={(e) => setLetterGradeFormData({...letterGradeFormData, max_percentage: parseFloat(e.target.value)})}
                    placeholder="100"
                    min="0"
                    max="100"
                    className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm ${
                      darkMode ? 'bg-almet-cloud-burst text-white' : 'bg-white text-almet-cloud-burst'
                    } focus:border-almet-sapphire focus:outline-none`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Description
                </label>
                <textarea
                  value={letterGradeFormData.description}
                  onChange={(e) => setLetterGradeFormData({...letterGradeFormData, description: e.target.value})}
                  placeholder="Enter grade description..."
                  rows="3"
                  className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm resize-none ${
                    darkMode ? 'bg-almet-cloud-burst text-white' : 'bg-white text-almet-cloud-burst'
                  } focus:border-almet-sapphire focus:outline-none`}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="letter-active"
                  checked={letterGradeFormData.is_active}
                  onChange={(e) => setLetterGradeFormData({...letterGradeFormData, is_active: e.target.checked})}
                  className="w-4 h-4 text-almet-sapphire border-2 border-gray-300 rounded focus:ring-almet-sapphire"
                />
                <label htmlFor="letter-active" className={`ml-2 text-sm ${textPrimary}`}>
                  Active
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t-2 border-gray-200">
              <ActionButton
                onClick={() => {
                  setShowLetterGradeModal(false);
                  setLetterGradeFormData({ letter_grade: '', min_percentage: '', max_percentage: '', description: '', is_active: true });
                  setEditingItem(null);
                }}
                icon={X}
                label="Cancel"
                disabled={isSubmitting}
                variant="outline"
              />
              <ActionButton
                onClick={handleCreateLetterGrade}
                icon={editingItem ? Save : Plus}
                label={editingItem ? 'Update' : 'Create'}
                disabled={!letterGradeFormData.letter_grade || !letterGradeFormData.min_percentage || !letterGradeFormData.max_percentage}
                loading={isSubmitting}
                variant="primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successMessage && (
        <SuccessToast 
          message={successMessage} 
          onClose={() => setSuccessMessage('')} 
        />
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-2xl z-50 max-w-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-red-800 font-bold text-sm">Error</h4>
              <p className="text-red-700 text-sm mt-1">{error.message}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentSettings;