// src/components/headcount/FormSteps/FormStep1BasicInfo.jsx - Updated field names
import { useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, AlertTriangle, Upload } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";

const FormStep1BasicInfo = ({ formData, handleInputChange, handleFileUpload, validationErrors = {} }) => {
  const { darkMode } = useTheme();
  const [profileImagePreview, setProfileImagePreview] = useState(formData.profile_image || null);

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
        handleFileUpload('profile_image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Format date to YYYY-MM-DD for input[type=date]
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
        <h2 className={`text-lg font-bold ${textPrimary}`}>
          Basic Information
        </h2>
        <div className="text-xs px-2 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue rounded font-medium">
          Step 1 of 4
        </div>
      </div>

      {/* Profile Image Section */}
      <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
        <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center`}>
          <User className="mr-1.5 text-almet-sapphire" size={16} />
          Profile Picture
        </h3>
        
        <div className="flex flex-col items-center">
          <div className="mb-3 relative">
            {profileImagePreview ? (
              <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border-2 border-almet-sapphire/20 shadow-md">
                <img 
                  src={profileImagePreview} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-almet-sapphire to-almet-steel-blue flex items-center justify-center text-white text-lg font-semibold mb-2 shadow-md">
                {formData.first_name && formData.last_name 
                  ? `${formData.first_name[0]}${formData.last_name[0]}` 
                  : <User size={32} />
                }
              </div>
            )}
            <label className="flex items-center justify-center cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden outline-none" 
                onChange={handleProfileImageUpload}
              />
              <span className={`text-xs ${textPrimary} flex items-center px-2 py-1 rounded bg-almet-sapphire/10 hover:bg-almet-sapphire/20 dark:bg-almet-sapphire/20 dark:hover:bg-almet-sapphire/30 text-almet-sapphire dark:text-almet-steel-blue transition-colors duration-200 outline-none focus:ring-2 focus:ring-almet-sapphire`}>
                <Upload size={12} className="mr-1" />
                {profileImagePreview ? "Change" : "Upload"}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
        <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center`}>
          <User className="mr-1.5 text-almet-sapphire" size={16} />
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            label="Employee ID"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleInputChange}
            required={true}
            placeholder="e.g., HLD001"
            icon={<User size={14} className={textMuted} />}
            validationError={validationErrors.employee_id}
          />

          <FormField
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            required={true}
            placeholder="Enter first name"
            icon={<User size={14} className={textMuted} />}
            validationError={validationErrors.first_name}
          />

          <FormField
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            required={true}
            placeholder="Enter last name"
            icon={<User size={14} className={textMuted} />}
            validationError={validationErrors.last_name}
          />

          <FormField
            label="Email Address"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            type="email"
            required={true}
            placeholder="name@almetholding.com"
            icon={<Mail size={14} className={textMuted} />}
            validationError={validationErrors.email}
          />

          <FormField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+994 XX XXX XX XX"
            icon={<Phone size={14} className={textMuted} />}
          />

          <FormField
            label="Date of Birth"
            name="date_of_birth"
            value={formatDate(formData.date_of_birth)}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={14} className={textMuted} />}
          />

          <FormField
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            type="select"
            icon={<User size={14} className={textMuted} />}
            options={[
              { value: 'MALE', label: 'Male' },
              { value: 'FEMALE', label: 'Female' }
            ]}
          />
        </div>
      </div>

      {/* Contact Information Section */}
      <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
        <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center`}>
          <MapPin className="mr-1.5 text-almet-sapphire" size={16} />
          Contact Information
        </h3>
        
        <div className="space-y-3">
          <FormField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            type="textarea"
            placeholder="Enter full address"
            icon={<MapPin size={14} className={textMuted} />}
          />

          <FormField
            label="Emergency Contact Information"
            name="emergency_contact"
            value={formData.emergency_contact}
            onChange={handleInputChange}
            placeholder="Name: Relationship: Phone:"
            icon={<AlertTriangle size={14} className={textMuted} />}
            helpText="Format: Name: Relationship: Phone Number"
          />
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-start">
          <User className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className={`text-xs font-medium text-blue-800 dark:text-blue-300 mb-1`}>Important Information</h3>
            <p className={`text-xs text-blue-600 dark:text-blue-400`}>
              Please ensure all personal information is accurate and matches official documents. 
              This information will be used for HR records, payroll, and compliance purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStep1BasicInfo;