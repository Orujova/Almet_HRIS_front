// src/components/headcount/FormSteps/FormStep1BasicInfo.jsx
import { useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, AlertTriangle, Upload } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";

/**
 * Basic information step of the employee form
 * @param {Object} props - Component props
 * @param {Object} props.formData - Current form data
 * @param {Function} props.handleInputChange - Function to handle input changes
 * @param {Function} props.handleFileUpload - Function to handle profile image upload
 * @returns {JSX.Element} - Form step component
 */
const FormStep1BasicInfo = ({ formData, handleInputChange, handleFileUpload }) => {
  const { darkMode } = useTheme();
  const [profileImagePreview, setProfileImagePreview] = useState(formData.profileImage || null);

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
        handleFileUpload('profileImage', reader.result);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className={`text-xl font-bold ${textPrimary}`}>
          Basic Information
        </h2>
        <div className="text-sm px-3 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue rounded-md font-medium">
          Step 1 of 4
        </div>
      </div>

      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 relative">
          {profileImagePreview ? (
            <div className="w-28 h-28 rounded-full overflow-hidden mb-2 border-4 border-almet-sapphire/20 shadow-md">
              <img 
                src={profileImagePreview} 
                alt="Profile Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-almet-sapphire to-almet-steel-blue flex items-center justify-center text-white text-3xl font-semibold mb-2 shadow-md">
              {formData.firstName && formData.lastName 
                ? `${formData.firstName[0]}${formData.lastName[0]}` 
                : <User size={36} />
              }
            </div>
          )}
          <label className="flex items-center justify-center cursor-pointer mt-3">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleProfileImageUpload}
            />
            <span className={`text-sm ${textPrimary} flex items-center px-3 py-1.5 rounded-md bg-almet-sapphire/10 hover:bg-almet-sapphire/20 dark:bg-almet-sapphire/20 dark:hover:bg-almet-sapphire/30 text-almet-sapphire dark:text-almet-steel-blue transition-colors duration-200`}>
              <Upload size={14} className="mr-1.5" />
              {profileImagePreview ? "Change Photo" : "Upload Photo"}
            </span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <FormField
          label="Employee ID"
          name="empNo"
          value={formData.empNo}
          onChange={handleInputChange}
          required={true}
          placeholder="e.g., EMP001"
          icon={<User size={18} className={textMuted} />}
        />

        <FormField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          required={true}
          placeholder="Enter first name"
          icon={<User size={18} className={textMuted} />}
        />

        <FormField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          required={true}
          placeholder="Enter last name"
          icon={<User size={18} className={textMuted} />}
        />

        <FormField
          label="Email Address"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          type="email"
          required={true}
          placeholder="name@almetholding.com"
          icon={<Mail size={18} className={textMuted} />}
        />

        <FormField
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+994 XX XXX XX XX"
          icon={<Phone size={18} className={textMuted} />}
        />

        <FormField
          label="Date of Birth"
          name="dateOfBirth"
          value={formatDate(formData.dateOfBirth)}
          onChange={handleInputChange}
          type="date"
          icon={<Calendar size={18} className={textMuted} />}
        />

        <div className="md:col-span-2">
          <FormField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            type="textarea"
            placeholder="Enter full address"
            icon={<MapPin size={18} className={textMuted} />}
          />
        </div>

        <div className="md:col-span-2">
          <FormField
            label="Emergency Contact Information"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleInputChange}
            placeholder="Name: Relationship: Phone:"
            icon={<AlertTriangle size={18} className={textMuted} />}
            helpText="Format: Name: Relationship: Phone Number"
          />
        </div>
      </div>
    </div>
  );
};

export default FormStep1BasicInfo;