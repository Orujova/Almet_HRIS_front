"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Mail, Phone, Globe, Edit, ChevronDown, Plus } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import EmployeeStatusBadge from "@/components/headcount/EmployeeStatusBadge";

// This data would normally be fetched from an API
const employeeData = {
  id: 1,
  empNo: "UN1203",
  name: "Lincoln Torff",
  jobTitle: "Junior UI/UX Designer",
  status: "active",
  department: "Designer",
  office: "Unpixel Studio",
  lineManager: "Skylar Calzoni",
  email: "lincoln@gmail.com",
  phone: "089318298493",
  timeZone: "GMT +07:00",
  employeeInfo: {
    employeeId: "UN1203",
    serviceYear: "3 Years 7 Months",
    joinDate: "20 Aug 2019",
    jobDate: "16 Feb 2020",
    lastWorkingDate: "-",
    geofencing: "30 Sep 2024",
  },
  jobTimeline: [
    {
      effectiveDate: "20 Aug 2019",
      jobTitle: "UI UX Designer",
      positionType: "-",
      employmentType: "Fulltime",
      lineManager: "@skylar",
    },
  ],
  contractTimeline: [
    {
      contractNumber: "#12345",
      contractName: "Fulltime Remote",
      contractType: "Fulltime Remote",
      startDate: "20 Aug 2019",
      endDate: "-",
    },
  ],
  personalInfo: {
    fullName: "Lincoln Torff Nelson",
    gender: "Female",
    dateOfBirth: "23 May 1997",
    nationality: "Indonesia",
    emailAddress: "lincoln@gmail.com",
    phoneNumber: "089318298493",
    healthInsurance: "Axa Insurance",
    maritalStatus: "-",
    personalTaxId: "-",
    socialInsurance: "-",
  },
  address: {
    primaryAddress: "Banyumanik Street, Central Java. Semarang Indonesia",
    country: "Indonesia",
    stateProvince: "Central Java",
    city: "Semarang",
    postCode: "03125",
  },
  emergencyContact: {
    fullName: "Albert Jhonson",
    phoneNumber: "089682900911",
  },
  documents: [
    {
      name: "CV_lincoln_v1.pdf",
      type: "personal",
    },
  ],
  payslips: [
    {
      name: "Payslips_20 Aug.pdf",
      date: "20 Aug 2023",
    },
    {
      name: "Payslips_20 Oct.pdf",
      date: "20 Oct 2023",
    },
  ],
  totalCompensation: 3729.0,
};

export default function EmployeeDetailPage() {
  const { darkMode } = useTheme();
  const params = useParams();
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);

  // Fetch employee data - in a real app this would be from an API
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      setEmployee(employeeData);
      setLoading(false);
    }, 500);
  }, [params.id]);

  // Theme-based classes
  const theme = {
    bg: darkMode ? "bg-gray-900" : "bg-gray-100",
    card: darkMode ? "bg-gray-800" : "bg-white",
    text: darkMode ? "text-white" : "text-gray-900",
    secondaryText: darkMode ? "text-gray-300" : "text-gray-700",
    mutedText: darkMode ? "text-gray-400" : "text-gray-500",
    border: darkMode ? "border-gray-700" : "border-gray-200",
    input: darkMode ? "bg-gray-700" : "bg-gray-50",
    button: darkMode
      ? "bg-gray-700 hover:bg-gray-600"
      : "bg-gray-100 hover:bg-gray-200",
    activeTab: darkMode
      ? "border-emerald-500 text-emerald-500"
      : "border-emerald-500 text-emerald-600",
    inactiveTab: darkMode
      ? "border-transparent text-gray-400"
      : "border-transparent text-gray-500",
    shadow: darkMode ? "" : "shadow-md",
  };

  // If loading, show skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="flex space-x-6">
            <div
              className={`${theme.card} rounded-lg w-1/3 h-96 ${theme.shadow}`}
            ></div>
            <div
              className={`${theme.card} rounded-lg w-2/3 h-96 ${theme.shadow}`}
            ></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If no employee found
  if (!employee) {
    return (
      <DashboardLayout>
        <div className={`${theme.card} rounded-lg p-6 ${theme.shadow}`}>
          <p className={theme.text}>Employee not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center">
        <div className="text-xl">← Detail Employee</div>
      </div>

      <div className="flex gap-6">
        {/* Employee Profile Card */}
        <div className={`${theme.card} rounded-lg p-6 ${theme.shadow} w-1/3`}>
          <div className="flex flex-col items-center">
            {/* Profile Image */}
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80"
                alt={employee.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name and Job Title */}
            <h2 className="text-xl font-bold text-center mb-1">
              {employee.name}
            </h2>
            <p className={`${theme.mutedText} text-sm mb-6`}>
              {employee.jobTitle}
            </p>

            {/* Status */}
            <div className="mb-6">
              <EmployeeStatusBadge status={employee.status} />
            </div>

            {/* Contact Information */}
            <div className="w-full space-y-4 mb-6">
              <div className="flex items-center">
                <Mail size={18} className={`${theme.mutedText} mr-3`} />
                <span className={theme.text}>{employee.email}</span>
              </div>
              <div className="flex items-center">
                <Phone size={18} className={`${theme.mutedText} mr-3`} />
                <span className={theme.text}>{employee.phone}</span>
              </div>
              <div className="flex items-center">
                <Globe size={18} className={`${theme.mutedText} mr-3`} />
                <span className={theme.text}>{employee.timeZone}</span>
              </div>
            </div>

            {/* Department Information */}
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <span className={theme.mutedText}>Department:</span>
                <span className={theme.text}>{employee.department}</span>
                <ChevronDown size={16} className={theme.mutedText} />
              </div>
              <div className="flex justify-between items-center">
                <span className={theme.mutedText}>Office:</span>
                <span className={theme.text}>{employee.office}</span>
                <ChevronDown size={16} className={theme.mutedText} />
              </div>
              <div className="flex justify-between items-center">
                <span className={theme.mutedText}>Line Manager:</span>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs mr-2">
                    {employee.lineManager[0]}
                  </div>
                  <span className={theme.text}>{employee.lineManager}</span>
                </div>
                <ChevronDown size={16} className={theme.mutedText} />
              </div>
            </div>

            {/* Action Button */}
            <div className="w-full mt-8">
              <button className="w-full py-3 px-4 rounded-md bg-gray-700 text-white flex items-center justify-center">
                Action <ChevronDown size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Employee Detail Tabs */}
        <div className={`${theme.card} rounded-lg ${theme.shadow} flex-1`}>
          {/* Tabs */}
          <div className="border-b border-gray-700">
            <div className="flex">
              <button
                className={`px-6 py-4 border-b-2 font-medium ${
                  activeTab === "general" ? theme.activeTab : theme.inactiveTab
                }`}
                onClick={() => setActiveTab("general")}
              >
                General
              </button>
              <button
                className={`px-6 py-4 border-b-2 font-medium ${
                  activeTab === "job" ? theme.activeTab : theme.inactiveTab
                }`}
                onClick={() => setActiveTab("job")}
              >
                Job
              </button>
              <button
                className={`px-6 py-4 border-b-2 font-medium ${
                  activeTab === "payroll" ? theme.activeTab : theme.inactiveTab
                }`}
                onClick={() => setActiveTab("payroll")}
              >
                Payroll
              </button>
              <button
                className={`px-6 py-4 border-b-2 font-medium ${
                  activeTab === "documents"
                    ? theme.activeTab
                    : theme.inactiveTab
                }`}
                onClick={() => setActiveTab("documents")}
              >
                Documents
              </button>
              <button
                className={`px-6 py-4 border-b-2 font-medium ${
                  activeTab === "setting" ? theme.activeTab : theme.inactiveTab
                }`}
                onClick={() => setActiveTab("setting")}
              >
                Setting
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* General Tab Content */}
            {activeTab === "general" && (
              <div className="space-y-8">
                {/* Personal Info */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Personal Info</h3>
                    <button className={`p-2 rounded-full ${theme.button}`}>
                      <Edit size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        Full Name
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.personalInfo.fullName}
                      </div>
                    </div>
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>Gender</div>
                      <div className={`${theme.text}`}>
                        {employee.personalInfo.gender}
                      </div>
                    </div>
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        Date of Birth
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.personalInfo.dateOfBirth}
                      </div>
                    </div>
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        Marital Status
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.personalInfo.maritalStatus || "-"}
                      </div>
                    </div>
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        Nationality
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.personalInfo.nationality}
                      </div>
                    </div>
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        Personal Tax ID
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.personalInfo.personalTaxId || "-"}
                      </div>
                    </div>
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        Email Address
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.personalInfo.emailAddress}
                      </div>
                    </div>
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        Social Insurance
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.personalInfo.socialInsurance || "-"}
                      </div>
                    </div>
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        Health Insurance
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.personalInfo.healthInsurance}
                      </div>
                    </div>
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        Phone Number
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.personalInfo.phoneNumber}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Address</h3>
                    <button className={`p-2 rounded-full ${theme.button}`}>
                      <Edit size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        Primary addresss
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.address.primaryAddress}
                      </div>
                    </div>
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        Country
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.address.country}
                      </div>
                    </div>
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        State/Province
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.address.stateProvince}
                      </div>
                    </div>
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>City</div>
                      <div className={`${theme.text}`}>
                        {employee.address.city}
                      </div>
                    </div>
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        Post Code
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.address.postCode}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Emergency Contact</h3>
                    <button className={`p-2 rounded-full ${theme.button}`}>
                      <Edit size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        Full Name
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.emergencyContact.fullName}
                      </div>
                    </div>
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        Phone Number
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.emergencyContact.phoneNumber}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Job Tab Content */}
            {activeTab === "job" && (
              <div className="space-y-8">
                {/* Employment Information */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                      Employment Information
                    </h3>
                    <button className={`p-2 rounded-full ${theme.button}`}>
                      <Edit size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        Employee ID
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.employeeInfo.employeeId}
                      </div>
                    </div>
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        Service Year
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.employeeInfo.serviceYear}
                      </div>
                    </div>
                    <div>
                      <div className={`${theme.mutedText} text-sm`}>
                        Join Date
                      </div>
                      <div className={`${theme.text}`}>
                        {employee.employeeInfo.joinDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Timeline */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Job Timeline</h3>
                    <button className={`p-2 rounded-full ${theme.button}`}>
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className={`${theme.border} border-b`}>
                          <th
                            className={`p-3 text-left text-xs font-medium ${theme.mutedText} uppercase tracking-wider`}
                          >
                            Effective Date
                          </th>
                          <th
                            className={`p-3 text-left text-xs font-medium ${theme.mutedText} uppercase tracking-wider`}
                          >
                            Job Title
                          </th>
                          <th
                            className={`p-3 text-left text-xs font-medium ${theme.mutedText} uppercase tracking-wider`}
                          >
                            Position Type
                          </th>
                          <th
                            className={`p-3 text-left text-xs font-medium ${theme.mutedText} uppercase tracking-wider`}
                          >
                            Employment Type
                          </th>
                          <th
                            className={`p-3 text-left text-xs font-medium ${theme.mutedText} uppercase tracking-wider`}
                          >
                            Line Manager
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {employee.jobTimeline.map((job, index) => (
                          <tr
                            key={index}
                            className={`${theme.border} border-b ${
                              index % 2 === 0
                                ? darkMode
                                  ? "bg-gray-750"
                                  : "bg-gray-50"
                                : ""
                            }`}
                          >
                            <td className="p-3 text-sm">{job.effectiveDate}</td>
                            <td className="p-3 text-sm">{job.jobTitle}</td>
                            <td className="p-3 text-sm">{job.positionType}</td>
                            <td className="p-3 text-sm">
                              {job.employmentType}
                            </td>
                            <td className="p-3 text-sm">{job.lineManager}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Contract Timeline */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Contract Timeline</h3>
                    <button className={`p-2 rounded-full ${theme.button}`}>
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className={`${theme.border} border-b`}>
                          <th
                            className={`p-3 text-left text-xs font-medium ${theme.mutedText} uppercase tracking-wider`}
                          >
                            Contract Number
                          </th>
                          <th
                            className={`p-3 text-left text-xs font-medium ${theme.mutedText} uppercase tracking-wider`}
                          >
                            Contract Name
                          </th>
                          <th
                            className={`p-3 text-left text-xs font-medium ${theme.mutedText} uppercase tracking-wider`}
                          >
                            Contract Type
                          </th>
                          <th
                            className={`p-3 text-left text-xs font-medium ${theme.mutedText} uppercase tracking-wider`}
                          >
                            Start Date
                          </th>
                          <th
                            className={`p-3 text-left text-xs font-medium ${theme.mutedText} uppercase tracking-wider`}
                          >
                            End Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {employee.contractTimeline.map((contract, index) => (
                          <tr
                            key={index}
                            className={`${theme.border} border-b ${
                              index % 2 === 0
                                ? darkMode
                                  ? "bg-gray-750"
                                  : "bg-gray-50"
                                : ""
                            }`}
                          >
                            <td className="p-3 text-sm">
                              {contract.contractNumber}
                            </td>
                            <td className="p-3 text-sm">
                              {contract.contractName}
                            </td>
                            <td className="p-3 text-sm">
                              {contract.contractType}
                            </td>
                            <td className="p-3 text-sm">
                              {contract.startDate}
                            </td>
                            <td className="p-3 text-sm">{contract.endDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Work Schedule */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Work Schedule</h3>
                    <button className={`p-2 rounded-full ${theme.button}`}>
                      <Edit size={16} />
                    </button>
                  </div>

                  {/* Work schedule content would go here */}
                  <div className={`${theme.mutedText} text-sm italic`}>
                    No work schedule defined
                  </div>
                </div>
              </div>
            )}

            {/* Payroll Tab Content */}
            {activeTab === "payroll" && (
              <div className="space-y-8">
                {/* Employee Status */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className={`${theme.mutedText} text-sm`}>
                      Employee Status
                    </div>
                    <div className="flex items-center mt-1">
                      <EmployeeStatusBadge status={employee.status} />
                    </div>
                  </div>
                  <div>
                    <div className={`${theme.mutedText} text-sm`}>
                      Job Title
                    </div>
                    <div className={theme.text}>{employee.jobTitle}</div>
                  </div>
                  <div>
                    <div className={`${theme.mutedText} text-sm`}>
                      Employment Type
                    </div>
                    <div className={theme.text}>Contractor</div>
                  </div>
                  <div>
                    <div className={`${theme.mutedText} text-sm`}>Job Date</div>
                    <div className={theme.text}>
                      {employee.employeeInfo.jobDate}
                    </div>
                  </div>
                  <div>
                    <div className={`${theme.mutedText} text-sm`}>
                      Geofencing
                    </div>
                    <div className={theme.text}>
                      {employee.employeeInfo.geofencing}
                    </div>
                  </div>
                  <div>
                    <div className={`${theme.mutedText} text-sm`}>
                      Last Working Date
                    </div>
                    <div className={theme.text}>
                      {employee.employeeInfo.lastWorkingDate}
                    </div>
                  </div>
                </div>

                {/* Total Compensation */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Total Compesation</h3>
                    <div className="text-xl font-bold">
                      ${employee.totalCompensation.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Salary Section */}
                <div>
                  <div className="p-4 rounded-md border border-gray-700">
                    <h4 className="text-lg font-medium">Salary</h4>
                    {/* Salary content would go here */}
                  </div>
                </div>

                {/* Recurring Section */}
                <div>
                  <div className="flex justify-between items-center p-4 rounded-md border border-gray-700">
                    <h4 className="text-lg font-medium">Recurring</h4>
                    <div className="flex items-center">
                      <span className="mr-2">$0</span>
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                {/* One-off Section */}
                <div>
                  <div className="flex justify-between items-center p-4 rounded-md border border-gray-700">
                    <h4 className="text-lg font-medium">One-off</h4>
                    <div className="flex items-center">
                      <span className="mr-2">$0</span>
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                {/* Offset Section */}
                <div>
                  <div className="p-4 rounded-md border border-gray-700">
                    <h4 className="text-lg font-medium">Offset</h4>
                    {/* Offset content would go here */}
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab Content */}
            {activeTab === "documents" && (
              <div className="space-y-8">
                {/* Personal Documents */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Personal Documents</h3>
                    <button className={`p-2 rounded-full ${theme.button}`}>
                      <Plus size={16} />
                    </button>
                  </div>

                  {employee.documents.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className={`${theme.border} border-b`}>
                            <th
                              className={`p-3 text-left text-xs font-medium ${theme.mutedText} uppercase tracking-wider`}
                            >
                              Document Name
                            </th>
                            <th
                              className={`p-3 text-right text-xs font-medium ${theme.mutedText} uppercase tracking-wider`}
                            >
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {employee.documents.map((doc, index) => (
                            <tr
                              key={index}
                              className={`${theme.border} border-b`}
                            >
                              <td className="p-3 text-sm">{doc.name}</td>
                              <td className="p-3 text-right">
                                <div className="flex justify-end space-x-2">
                                  <button className="p-2 rounded-full bg-blue-600 text-white">
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                      <polyline points="7 10 12 15 17 10"></polyline>
                                      <line
                                        x1="12"
                                        y1="15"
                                        x2="12"
                                        y2="3"
                                      ></line>
                                    </svg>
                                  </button>
                                  <button className="p-2 rounded-full bg-red-600 text-white">
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="3 6 5 6 21 6"></polyline>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="mb-4">
                        <img
                          src="/drag-drop.svg"
                          alt="Drag and drop"
                          className="w-32 h-32"
                        />
                      </div>
                      <h4 className="text-lg font-medium mb-2">
                        Drag & Drop here to upload
                      </h4>
                      <p className={`${theme.mutedText} mb-4`}>
                        Or select file from your computer
                      </p>
                      <button className="px-4 py-2 bg-white text-gray-800 rounded-md border border-gray-300">
                        Upload File
                      </button>
                    </div>
                  )}
                </div>

                {/* Payslips */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Payslips</h3>
                    <button className={`p-2 rounded-full ${theme.button}`}>
                      <Plus size={16} />
                    </button>
                  </div>

                  {employee.payslips.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className={`${theme.border} border-b`}>
                            <th
                              className={`p-3 text-left text-xs font-medium ${theme.mutedText} uppercase tracking-wider`}
                            >
                              Document Name
                            </th>
                            <th
                              className={`p-3 text-right text-xs font-medium ${theme.mutedText} uppercase tracking-wider`}
                            >
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {employee.payslips.map((payslip, index) => (
                            <tr
                              key={index}
                              className={`${theme.border} border-b`}
                            >
                              <td className="p-3 text-sm">{payslip.name}</td>
                              <td className="p-3 text-right">
                                <div className="flex justify-end space-x-2">
                                  <button className="p-2 rounded-full bg-blue-600 text-white">
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                      <polyline points="7 10 12 15 17 10"></polyline>
                                      <line
                                        x1="12"
                                        y1="15"
                                        x2="12"
                                        y2="3"
                                      ></line>
                                    </svg>
                                  </button>
                                  <button className="p-2 rounded-full bg-red-600 text-white">
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="3 6 5 6 21 6"></polyline>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={`${theme.mutedText} text-sm italic`}>
                      No payslips available
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Setting Tab Content */}
            {activeTab === "setting" && (
              <div className="p-4">
                <p className={theme.mutedText}>
                  Employee settings will be displayed here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
