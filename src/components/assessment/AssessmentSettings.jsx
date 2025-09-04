'use client';
import React, { useState, useEffect } from 'react';
import { 
  Settings, ArrowLeft, Plus, Edit, Trash2, Save, X, 
  Target, Users, Award, Scale,
  Loader2
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import { assessmentApi } from '@/services/assessmentApi';
import SuccessToast from './SuccessToast';
import ErrorToast from './ErrorToast';

// Ortak Bileşenler
const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', loading = false, disabled = false, size = 'sm' }) => {
  const variants = {
    primary: 'bg-almet-sapphire hover:bg-almet-astral text-white',
    secondary: 'bg-almet-bali-hai hover:bg-almet-waterloo text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    outline: 'border border-almet-sapphire text-almet-sapphire hover:bg-almet-sapphire hover:text-white'
  };

  const sizes = {
    xs: 'p-1.5',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-1.5 rounded-md font-medium
        transition-colors ${variants[variant]} ${sizes[size]}
        ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={12} />}
      {label && <span>{label}</span>}
    </button>
  );
};

const StatusBadge = ({ isActive }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
    isActive 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700'
  }`}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
);



// Ana Tablo Bileşeni
const AssessmentTable = ({ data, type, onEdit, onDelete }) => {
  const getColumns = () => {
    const baseColumns = [
      { 
        key: 'scale', 
        label: 'Scale', 
        render: (item) => (
          <div className="flex items-center">
            <span className="bg-almet-sapphire text-white px-2 py-1 rounded-full text-xs font-semibold">
              {item.scale}
            </span>
          </div>
        )
      },
      { 
        key: 'description', 
        label: 'Description', 
        render: (item) => <span className="text-almet-cloud-burst text-sm">{item.description}</span> 
      },
      { 
        key: 'status', 
        label: 'Status', 
        render: (item) => <StatusBadge isActive={item.is_active} /> 
      },
      { 
        key: 'created_at', 
        label: 'Created', 
        render: (item) => (
          <span className="text-xs text-almet-bali-hai">
            {new Date(item.created_at).toLocaleDateString()}
          </span>
        )
      }
    ];

    if (type === 'letter') {
      baseColumns[0] = { 
        key: 'grade', 
        label: 'Grade', 
        render: (item) => (
          <div className="flex items-center">
            <span className="bg-almet-sapphire text-white px-2 py-1 rounded-full text-sm font-semibold">
              {item.letter_grade}
            </span>
          </div>
        )
      };
      baseColumns[1] = { 
        key: 'range', 
        label: 'Range', 
        render: (item) => (
          <span className="font-medium text-almet-cloud-burst text-sm">
            {item.min_percentage}% - {item.max_percentage}%
          </span>
        )
      };
    }

    return baseColumns;
  };

  const columns = getColumns();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-almet-mystic bg-gray-50">
            {columns.map((col, idx) => (
              <th key={idx} className="text-left py-3 px-4 font-medium text-almet-cloud-burst text-xs uppercase tracking-wide">
                {col.label}
              </th>
            ))}
            <th className="text-center py-3 px-4 font-medium text-almet-cloud-burst text-xs uppercase tracking-wide w-20">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className="py-3 px-4">
                    {col.render(item)}
                  </td>
                ))}
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <ActionButton
                      onClick={() => onEdit(item, type)}
                      icon={Edit}
                      variant="outline"
                      size="xs"
                    />
                    <ActionButton
                      onClick={() => onDelete(item.id, type)}
                      icon={Trash2}
                      variant="danger"
                      size="xs"
                    />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="text-center py-8">
                <Scale className="w-10 h-10 mx-auto mb-2 text-almet-bali-hai opacity-50" />
                <p className="text-almet-bali-hai font-medium text-sm">No {type} scales found</p>
                <p className="text-almet-bali-hai text-xs mt-0.5">Create your first {type} scale</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Form Modal Bileşeni
const FormModal = ({ show, onClose, title, icon: Icon, children, onSubmit, submitLabel, isSubmitting, canSubmit }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-5 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-almet-cloud-burst flex items-center gap-2">
            <Icon className="w-4 h-4 text-almet-sapphire" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-almet-bali-hai hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="space-y-3">
          {children}
        </div>
        
        <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-gray-200">
          <ActionButton
            onClick={onClose}
            icon={X}
            label="Cancel"
            disabled={isSubmitting}
            variant="outline"
            size="sm"
          />
          <ActionButton
            onClick={onSubmit}
            icon={Save}
            label={submitLabel}
            disabled={!canSubmit}
            loading={isSubmitting}
            variant="primary"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
};

// Form Giriş Bileşeni
const FormInput = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-medium text-almet-cloud-burst mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

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
  const textPrimary = darkMode ? 'text-white' : 'text-almet-cloud-burst';
  const textSecondary = darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo';

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

  return (
    <div className="min-h-screen">
      <div className="mx-auto py-4">
        {/* Header */}
        <div className={`${bgCard} rounded-lg mb-4 p-4 shadow-sm border`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ActionButton
                onClick={onBack}
                icon={ArrowLeft}
                label="Back"
                variant="outline"
                size="sm"
              />
              <div>
                <h1 className={`text-lg font-semibold ${textPrimary} flex items-center gap-2`}>
                  <Settings className="w-5 h-5 text-almet-sapphire" />
                  Assessment Settings
                </h1>
                <p className={`text-xs ${textSecondary} mt-0.5`}>
                  Configure assessment scales and grading systems
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className={`${bgCard} rounded-lg p-3 mb-4 shadow-sm border`}>
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveSection('behavioral')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'behavioral'
                  ? 'bg-almet-sapphire text-white'
                  : 'text-almet-cloud-burst hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Users size={14} />
                Behavioral Settings
              </div>
            </button>
            
            <button
              onClick={() => setActiveSection('core')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'core'
                  ? 'bg-almet-sapphire text-white'
                  : 'text-almet-cloud-burst hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Target size={14} />
                Core Settings
              </div>
            </button>
            
            <button
              onClick={() => setActiveSection('grading')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'grading'
                  ? 'bg-almet-sapphire text-white'
                  : 'text-almet-cloud-burst hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Award size={14} />
                Letter Grading
              </div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className={`${bgCard} rounded-lg p-6 text-center border shadow-sm`}>
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-almet-sapphire" />
            <p className={`${textSecondary} text-sm`}>Loading settings...</p>
          </div>
        ) : (
          <div className={`${bgCard} rounded-lg shadow-sm border overflow-hidden`}>
            {/* Header with Add Button */}
            <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
              <h3 className={`text-base font-semibold ${textPrimary} flex items-center gap-2`}>
                {activeSection === 'behavioral' && <><Users size={16} />Behavioral Competency Scales</>}
                {activeSection === 'core' && <><Target size={16} />Core Competency Scales</>}
                {activeSection === 'grading' && <><Award size={16} />Letter Grade Mapping</>}
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
                size="sm"
              />
            </div>

            {/* Content */}
            <div className="p-3">
              {activeSection === 'behavioral' && (
                <AssessmentTable 
                  data={behavioralScales}
                  type="behavioral"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}

              {activeSection === 'core' && (
                <AssessmentTable 
                  data={coreScales}
                  type="core"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}

              {activeSection === 'grading' && (
                <AssessmentTable 
                  data={letterGrades}
                  type="letter"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        )}

        {/* Behavioral Scale Modal */}
        <FormModal
          show={showBehavioralModal}
          onClose={() => {
            setShowBehavioralModal(false);
            setBehavioralFormData({ scale: '', description: '', is_active: true });
            setEditingItem(null);
          }}
          title={editingItem ? 'Edit Behavioral Scale' : 'Create Behavioral Scale'}
          icon={Users}
          onSubmit={handleCreateBehavioral}
          submitLabel={editingItem ? 'Update' : 'Create'}
          isSubmitting={isSubmitting}
          canSubmit={behavioralFormData.scale && behavioralFormData.description}
        >
          <FormInput label="Scale Number" required>
            <input
              type="number"
              value={behavioralFormData.scale}
              onChange={(e) => setBehavioralFormData({...behavioralFormData, scale: parseInt(e.target.value) || ''})}
              placeholder="Enter scale number (e.g., 1, 2, 3...)"
              className="w-full px-3 py-2 border border-gray-300 outline-0 rounded-md text-xs focus:ring-almet-sapphire focus:border-almet-sapphire"
            />
          </FormInput>
          
          <FormInput label="Description" required>
            <textarea
              value={behavioralFormData.description}
              onChange={(e) => setBehavioralFormData({...behavioralFormData, description: e.target.value})}
              placeholder="Enter scale description..."
              rows="3"
              className="w-full px-3 py-2 border outline-0 border-gray-300 rounded-md text-xs resize-none focus:ring-almet-sapphire focus:border-almet-sapphire"
            />
          </FormInput>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="behavioral-active"
              checked={behavioralFormData.is_active}
              onChange={(e) => setBehavioralFormData({...behavioralFormData, is_active: e.target.checked})}
              className="h-3 w-3 text-almet-sapphire outline-0 focus:ring-almet-sapphire border-gray-300 rounded"
            />
            <label htmlFor="behavioral-active" className="ml-2 text-xs text-almet-cloud-burst">
              Active
            </label>
          </div>
        </FormModal>

        {/* Core Scale Modal */}
        <FormModal
          show={showCoreModal}
          onClose={() => {
            setShowCoreModal(false);
            setCoreFormData({ scale: '', description: '', is_active: true });
            setEditingItem(null);
          }}
          title={editingItem ? 'Edit Core Scale' : 'Create Core Scale'}
          icon={Target}
          onSubmit={handleCreateCore}
          submitLabel={editingItem ? 'Update' : 'Create'}
          isSubmitting={isSubmitting}
          canSubmit={coreFormData.scale && coreFormData.description}
        >
          <FormInput label="Scale Number" required>
            <input
              type="number"
              value={coreFormData.scale}
              onChange={(e) => setCoreFormData({...coreFormData, scale: parseInt(e.target.value) || ''})}
              placeholder="Enter scale number (e.g., 0, 1, 2, 3...)"
              className="w-full px-3 py-2 border outline-0 border-gray-300 rounded-md text-xs focus:ring-almet-sapphire focus:border-almet-sapphire"
            />
          </FormInput>
          
          <FormInput label="Description" required>
            <textarea
              value={coreFormData.description}
              onChange={(e) => setCoreFormData({...coreFormData, description: e.target.value})}
              placeholder="Enter scale description..."
              rows="3"
              className="w-full px-3 py-2 border outline-0 border-gray-300 rounded-md text-xs resize-none focus:ring-almet-sapphire focus:border-almet-sapphire"
            />
          </FormInput>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="core-active"
              checked={coreFormData.is_active}
              onChange={(e) => setCoreFormData({...coreFormData, is_active: e.target.checked})}
              className="h-3 w-3 text-almet-sapphire outline-0 focus:ring-almet-sapphire border-gray-300 rounded"
            />
            <label htmlFor="core-active" className="ml-2 text-xs text-almet-cloud-burst">
              Active
            </label>
          </div>
        </FormModal>

        {/* Letter Grade Modal */}
        <FormModal
          show={showLetterGradeModal}
          onClose={() => {
            setShowLetterGradeModal(false);
            setLetterGradeFormData({ letter_grade: '', min_percentage: '', max_percentage: '', description: '', is_active: true });
            setEditingItem(null);
          }}
          title={editingItem ? 'Edit Letter Grade' : 'Create Letter Grade'}
          icon={Award}
          onSubmit={handleCreateLetterGrade}
          submitLabel={editingItem ? 'Update' : 'Create'}
          isSubmitting={isSubmitting}
          canSubmit={letterGradeFormData.letter_grade && letterGradeFormData.min_percentage && letterGradeFormData.max_percentage}
        >
          <FormInput label="Letter Grade" required>
            <input
              type="text"
              value={letterGradeFormData.letter_grade}
              onChange={(e) => setLetterGradeFormData({...letterGradeFormData, letter_grade: e.target.value.toUpperCase()})}
              placeholder="Enter grade letter (A, B, C, D, E, F)"
              className="w-full px-3 py-2 border outline-0 border-gray-300 rounded-md text-xs focus:ring-almet-sapphire focus:border-almet-sapphire"
            />
          </FormInput>
          
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Min %" required>
              <input
                type="number"
                value={letterGradeFormData.min_percentage}
                onChange={(e) => setLetterGradeFormData({...letterGradeFormData, min_percentage: e.target.value})}
                placeholder="0"
                min="0"
                max="100"
                className="w-full px-3 py-2 border outline-0 border-gray-300 rounded-md text-xs focus:ring-almet-sapphire focus:border-almet-sapphire"
              />
            </FormInput>
            
            <FormInput label="Max %" required>
              <input
                type="number"
                value={letterGradeFormData.max_percentage}
                onChange={(e) => setLetterGradeFormData({...letterGradeFormData, max_percentage: e.target.value})}
                placeholder="100"
                min="0"
                max="100"
                className="w-full px-3 py-2 border outline-0 border-gray-300 rounded-md text-xs focus:ring-almet-sapphire focus:border-almet-sapphire"
              />
            </FormInput>
          </div>
          
          <FormInput label="Description">
            <textarea
              value={letterGradeFormData.description}
              onChange={(e) => setLetterGradeFormData({...letterGradeFormData, description: e.target.value})}
              placeholder="Enter grade description..."
              rows="3"
              className="w-full px-3 py-2 border outline-0 border-gray-300 rounded-md text-xs resize-none focus:ring-almet-sapphire focus:border-almet-sapphire"
            />
          </FormInput>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="letter-active"
              checked={letterGradeFormData.is_active}
              onChange={(e) => setLetterGradeFormData({...letterGradeFormData, is_active: e.target.checked})}
              className="h-3 w-3 text-almet-sapphire outline-0 focus:ring-almet-sapphire border-gray-300 rounded"
            />
            <label htmlFor="letter-active" className="ml-2 text-xs text-almet-cloud-burst">
              Active
            </label>
          </div>
        </FormModal>

        {/* Success Toast */}
        {successMessage && (
          <SuccessToast 
            message={successMessage} 
            onClose={() => setSuccessMessage('')} 
          />
        )}

        {/* Error Toast */}
        {error && (
          <ErrorToast 
            error={error} 
            onClose={() => setError(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default AssessmentSettings;