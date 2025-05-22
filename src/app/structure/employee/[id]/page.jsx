"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  Edit, 
  Download, 
  MessageSquare, 
  UserX, 
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Briefcase,
  Users 
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import EmployeeStatusBadge from "@/components/headcount/EmployeeStatusBadge";
import EmployeeTag from "@/components/headcount/EmployeeTag";

/**
 * Employee Detail Page
 * Displays detailed information about a specific employee
 */
export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { darkMode } = useTheme();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-colors";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
    : "bg-gray-100 hover:bg-gray-200 text-gray-700";
  const shadowClass = darkMode ? "" : "shadow-md";
  const bgAccent = darkMode ? "bg-gray-700" : "bg-gray-100";

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        
        // Mock API call delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Mock data for employees
        const mockEmployees = [
          {
            id: "HC01",
            empNo: "EJ2023",
            name: "Eric Johnson",
            firstName: "Eric",
            lastName: "Johnson",
            email: "eric.johnson@almetholding.com",
            phone: "+1 (555) 123-4567",
            joinDate: "2023-01-15",
            businessFunction: "Marketing",
            department: "BUSINESS DEVELOPMENT",
            unit: "BUSINESS DEVELOPMENT",
            jobFunction: "DEPUTY CHAIRMAN OF PRODUCT REPOSITIONING",
            jobTitle: "DEPUTY CHAIRMAN OF PRODUCT REPOSITIONING",
            positionGroup: "Executive",
            grade: "P4",
            lineManager: "Linda Campbell",
            lineManagerHcNumber: "HC00",
            status: "ACTIVE",
            address: "123 Business Ave, New York, NY 10001",
            dateOfBirth: "1985-03-22",
            emergencyContact: "Sarah Johnson: Spouse: +1 (555) 987-6543",
            expertise: [
              "Strategic Planning",
              "Brand Development",
              "Team Leadership",
            ],
            tags: [],
            directReports: 5,
            office: "Headquarters - 5th Floor",
            profileImage: null,
            documents: [
              {
                id: "doc1",
                name: "Job Contract",
                type: "application/pdf",
                size: 2400000, // 2.4 MB
                date: "2023-01-15"
              },
              {
                id: "doc2",
                name: "Resume",
                type: "application/pdf",
                size: 1800000, // 1.8 MB
                date: "2023-01-10"
              }
            ],
            activities: [
              {
                id: 1,
                type: 'performance',
                title: 'Performance Review',
                description: 'Q1 2023 - Excellent Performance',
                date: '2023-03-31'
              },
              {
                id: 2,
                type: 'training',
                title: 'Completed Training',
                description: 'Leadership Development Program',
                date: '2023-02-15'
              },
              {
                id: 3,
                type: 'joining',
                title: 'Joined Company',
                description: 'Started as Executive',
                date: '2023-01-15'
              }
            ]
          },
          {
            id: "HC02",
            empNo: "AS1023",
            name: "Aria Sanderson",
            firstName: "Aria",
            lastName: "Sanderson",
            email: "aria.sanderson@almetholding.com",
            phone: "+1 (555) 234-5678",
            joinDate: "2023-03-10",
            businessFunction: "Marketing",
            department: "BUSINESS DEVELOPMENT",
            unit: "PRODUCT MANAGEMENT",
            jobFunction: "DEPUTY CHAIRMAN OF CORPORATE ACTIVITIES",
            jobTitle: "DEPUTY CHAIRMAN OF CORPORATE ACTIVITIES",
            positionGroup: "Executive",
            grade: "P4",
            lineManager: "Eric Johnson",
            lineManagerHcNumber: "HC01",
            status: "ACTIVE",
            address: "456 Corporate Blvd, New York, NY 10001",
            dateOfBirth: "1988-07-15",
            emergencyContact: "Michael Sanderson: Brother: +1 (555) 876-5432",
            expertise: [
              "Corporate Strategy",
              "Business Analysis",
              "Market Research",
            ],
            tags: [],
            directReports: 3,
            office: "Headquarters - 5th Floor",
            profileImage: null,
            documents: [
              {
                id: "doc1",
                name: "Job Contract",
                type: "application/pdf",
                size: 2200000, // 2.2 MB
                date: "2023-03-10"
              }
            ],
            activities: [
              {
                id: 1,
                type: 'training',
                title: 'Completed Training',
                description: 'Strategic Planning Workshop',
                date: '2023-04-20'
              },
              {
                id: 2,
                type: 'joining',
                title: 'Joined Company',
                description: 'Started as Executive',
                date: '2023-03-10'
              }
            ]
          }
        ];

        // Find employee by ID
        const foundEmployee = mockEmployees.find((emp) => emp.id === id);
        
        if (foundEmployee) {
          setEmployee(foundEmployee);
        } else {
          setError("Employee not found");
        }
      } catch (err) {
        console.error("Error fetching employee:", err);
        setError("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  // Handler functions
  const handleEditEmployee = () => {
    router.push(`/structure/employee/${id}/edit`);
  };

  const handleDeleteEmployee = () => {
    if (
      confirm(
        "Are you sure you want to delete this employee? This action cannot be undone."
      )
    ) {
      // In a real app, this would be an API call
      alert("Employee deleted successfully!");
      router.push("/structure/headcount-table");
    }
  };

  const handleExportData = () => {
    // In a real app, this would generate and download an export file
    alert(`Exporting data for ${employee.name}`);
  };

  const handleMessageEmployee = () => {
    // In a real app, this would open a messaging interface
    alert(`Messaging ${employee.name}`);
  };

  const handleDownloadDocument = (document) => {
    // In a real app, this would download the document
    alert(`Downloading ${document.name}`);
  };
  
  // Generate initials from name for the avatar
  const getInitials = (name) => {
    if (!name) return "NA";
    
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0);
    
    // Get first letter of first name and first letter of last name
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`;
  };

  // Get department color for the avatar
  const getDepartmentColor = (department) => {
    if (!department) return "bg-almet-sapphire";
    
    const dept = department.toUpperCase();
    
    if (dept.includes("BUSINESS DEVELOPMENT")) return "bg-blue-500";
    if (dept.includes("FINANCE")) return "bg-green-500";
    if (dept.includes("COMPLIANCE")) return "bg-red-500";
    if (dept.includes("HR")) return "bg-purple-500";
    if (dept.includes("ADMINISTRATIVE")) return "bg-yellow-500";
    if (dept.includes("OPERATIONS")) return "bg-orange-500";
    if (dept.includes("PROJECTS MANAGEMENT")) return "bg-teal-500";
    if (dept.includes("TRADE")) return "bg-indigo-500";
    if (dept.includes("STOCK SALES")) return "bg-pink-500";
    
    return "bg-almet-sapphire";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", { 
        day: "2-digit", 
        month: "short", 
        year: "numeric" 
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 border-4 border-almet-sapphire border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className={`${textPrimary} text-lg font-medium`}>Loading employee details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !employee) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className={`${bgCard} rounded-lg border border-red-300 dark:border-red-700 p-6 shadow-md`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
                  Error Loading Employee
                </h3>
                <p className="mt-2 text-red-700 dark:text-red-400">
                  {error || "Employee not found"}
                </p>
                <div className="mt-4">
                  <Link
                    href="/structure/headcount-table"
                    className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Return to Headcount Table
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <div className="mb-4">
          <Link
            href="/structure/headcount-table"
            className={`inline-flex items-center ${textPrimary} hover:text-almet-sapphire dark:hover:text-almet-steel-blue transition-colors`}
          >
            <ChevronLeft size={18} className="mr-1" />
            <span>Back to Headcount Table</span>
          </Link>
        </div>

        {/* Employee Profile Header */}
        <div className={`${bgCard} rounded-xl ${shadowClass} overflow-hidden border border-gray-100 dark:border-gray-700 mb-6 transition-all duration-200 hover:shadow-lg`}>
          <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral text-white p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile image or initials */}
              <div className="flex-shrink-0">
                {employee.profileImage ? (
                  <img
                    src={employee.profileImage}
                    alt={employee.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                    {getInitials(employee.name)}
                  </div>
                )}
              </div>

              {/* Name, title, and status */}
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold">{employee.name}</h1>
                <p className="text-white/80 mt-1">{employee.jobTitle}</p>
                <div className="mt-3 mb-1">
                  <EmployeeStatusBadge status={employee.status} />
                  {employee.tags && employee.tags.map((tag, idx) => (
                    <span key={idx} className="ml-2">
                      <EmployeeTag tag={tag} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="md:ml-auto flex flex-wrap gap-2 justify-center md:justify-start mt-4 md:mt-0">
                <button
                  onClick={handleEditEmployee}
                  className="px-4 py-2 rounded-md flex items-center bg-white/20 hover:bg-white/30 text-white transition-colors backdrop-blur-sm"
                >
                  <Edit size={16} className="mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleExportData}
                  className="px-4 py-2 rounded-md flex items-center bg-white/20 hover:bg-white/30 text-white transition-colors backdrop-blur-sm"
                >
                  <Download size={16} className="mr-2" />
                  Export
                </button>
                <button
                  onClick={handleMessageEmployee}
                  className="px-4 py-2 rounded-md flex items-center bg-white/20 hover:bg-white/30 text-white transition-colors backdrop-blur-sm"
                >
                  <MessageSquare size={16} className="mr-2" />
                  Message
                </button>
                <button
                  onClick={handleDeleteEmployee}
                  className="px-4 py-2 rounded-md flex items-center bg-red-500/80 hover:bg-red-600/80 text-white transition-colors backdrop-blur-sm"
                >
                  <UserX size={16} className="mr-2" />
                  Delete
                </button>
              </div>
            </div>

            {/* Quick info badges */}
            <div className="flex flex-wrap gap-2 mt-6">
              {employee.empNo && (
                <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                  ID: {employee.empNo}
                </div>
              )}
              {employee.businessFunction && (
                <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                  {employee.businessFunction}
                </div>
              )}
              {employee.office && (
                <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                  {employee.office}
                </div>
              )}
              {employee.grade && (
                <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                  Grade: {employee.grade}
                </div>
              )}
              {employee.joinDate && (
                <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                  Joined: {formatDate(employee.joinDate)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information Card */}
          <div className={`${bgCard} rounded-xl ${shadowClass} overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-lg`}>
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <h2 className={`${textPrimary} text-lg font-medium`}>
                Personal Information
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex">
                <div className="w-10 h-10 rounded-full bg-almet-sapphire/10 dark:bg-almet-sapphire/20 flex items-center justify-center mr-3">
                  <Mail className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
                </div>
                <div>
                  <p className={`${textMuted} text-xs`}>Email Address</p>
                  <a 
                    href={`mailto:${employee.email}`} 
                    className={`${textPrimary} hover:text-almet-sapphire dark:hover:text-almet-steel-blue transition-colors break-all`}
                  >
                    {employee.email}
                  </a>
                </div>
              </div>

              <div className="flex">
                <div className="w-10 h-10 rounded-full bg-almet-sapphire/10 dark:bg-almet-sapphire/20 flex items-center justify-center mr-3">
                  <Phone className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
                </div>
                <div>
                  <p className={`${textMuted} text-xs`}>Phone Number</p>
                  <a 
                    href={`tel:${employee.phone}`} 
                    className={`${textPrimary} hover:text-almet-sapphire dark:hover:text-almet-steel-blue transition-colors`}
                  >
                    {employee.phone || "N/A"}
                  </a>
                </div>
              </div>

              <div className="flex">
                <div className="w-10 h-10 rounded-full bg-almet-sapphire/10 dark:bg-almet-sapphire/20 flex items-center justify-center mr-3">
                  <Calendar className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
                </div>
              <div>
  <p className={`${textMuted} text-xs`}>Date of Birth</p>
  <p className={`${textPrimary}`}>
    {formatDate(employee.dateOfBirth)}
  </p>
</div>
              </div><div className="flex">
            <div className="w-10 h-10 rounded-full bg-almet-sapphire/10 dark:bg-almet-sapphire/20 flex items-center justify-center mr-3">
              <MapPin className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
            </div>
            <div>
              <p className={`${textMuted} text-xs`}>Address</p>
              <p className={`${textPrimary}`}>
                {employee.address || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="w-10 h-10 rounded-full bg-almet-sapphire/10 dark:bg-almet-sapphire/20 flex items-center justify-center mr-3">
              <User className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
            </div>
            <div>
              <p className={`${textMuted} text-xs`}>Emergency Contact</p>
              <p className={`${textPrimary}`}>
                {employee.emergencyContact || "Not provided"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Information Card */}
      <div className={`${bgCard} rounded-xl ${shadowClass} overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-lg`}>
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className={`${textPrimary} text-lg font-medium`}>
            Job Information
          </h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex">
            <div className="w-10 h-10 rounded-full bg-almet-sapphire/10 dark:bg-almet-sapphire/20 flex items-center justify-center mr-3">
              <Briefcase className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
            </div>
            <div>
              <p className={`${textMuted} text-xs`}>Position</p>
              <p className={`${textPrimary}`}>
                {employee.positionGroup || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="w-10 h-10 rounded-full bg-almet-sapphire/10 dark:bg-almet-sapphire/20 flex items-center justify-center mr-3">
              <Building className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
            </div>
            <div>
              <p className={`${textMuted} text-xs`}>Department</p>
              <p className={`${textPrimary}`}>
                {employee.department || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="w-10 h-10 rounded-full bg-almet-sapphire/10 dark:bg-almet-sapphire/20 flex items-center justify-center mr-3">
              <Building className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
            </div>
            <div>
              <p className={`${textMuted} text-xs`}>Business Function</p>
              <p className={`${textPrimary}`}>
                {employee.businessFunction || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="w-10 h-10 rounded-full bg-almet-sapphire/10 dark:bg-almet-sapphire/20 flex items-center justify-center mr-3">
              <Building className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
            </div>
            <div>
              <p className={`${textMuted} text-xs`}>Unit</p>
              <p className={`${textPrimary}`}>
                {employee.unit || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="w-10 h-10 rounded-full bg-almet-sapphire/10 dark:bg-almet-sapphire/20 flex items-center justify-center mr-3">
              <Users className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
            </div>
            <div>
              <p className={`${textMuted} text-xs`}>Line Manager</p>
              <div>
                {employee.lineManager ? (
                  <Link
                    href={`/structure/employee/${employee.lineManagerHcNumber}`}
                    className={`${textPrimary} hover:text-almet-sapphire dark:hover:text-almet-steel-blue transition-colors`}
                  >
                    {employee.lineManager}
                  </Link>
                ) : (
                  <p className={textPrimary}>N/A</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex">
            <div className="w-10 h-10 rounded-full bg-almet-sapphire/10 dark:bg-almet-sapphire/20 flex items-center justify-center mr-3">
              <Users className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
            </div>
            <div>
              <p className={`${textMuted} text-xs`}>Direct Reports</p>
              <p className={`${textPrimary}`}>
                {employee.directReports || 0} employee(s)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills & Expertise Card */}
      <div className={`${bgCard} rounded-xl ${shadowClass} overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-lg`}>
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className={`${textPrimary} text-lg font-medium`}>
            Skills & Expertise
          </h2>
        </div>
        <div className="p-5">
          {employee.expertise && employee.expertise.length > 0 ? (
            <div className="space-y-3">
              {employee.expertise.map((skill, index) => (
                <div key={index} className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-almet-sapphire mr-3"></div>
                  <span className={textPrimary}>{skill}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={textMuted}>No skills or expertise listed</p>
          )}
        </div>
      </div>
    </div>

    {/* Second Row - Documents and Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Documents Card */}
      <div className={`${bgCard} rounded-xl ${shadowClass} overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-lg`}>
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className={`${textPrimary} text-lg font-medium`}>Documents</h2>
        </div>
        <div className="p-5">
          {employee.documents && employee.documents.length > 0 ? (
            <div className="space-y-4">
              {employee.documents.map((doc) => (
                <div 
                  key={doc.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${bgAccent} hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer`}
                  onClick={() => handleDownloadDocument(doc)}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 rounded-lg flex items-center justify-center mr-3">
                      <Download className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" />
                    </div>
                    <div>
                      <p className={`${textPrimary} font-medium`}>{doc.name}</p>
                      <p className={`${textMuted} text-xs`}>
                        {formatFileSize(doc.size)} • {formatDate(doc.date)}
                      </p>
                    </div>
                  </div>
                  <button className={`p-2 rounded-full ${btnSecondary}`}>
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={textMuted}>No documents available</p>
          )}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className={`${bgCard} rounded-xl ${shadowClass} overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-lg`}>
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className={`${textPrimary} text-lg font-medium`}>Recent Activity</h2>
        </div>
        <div className="p-5">
          {employee.activities && employee.activities.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
              
              {/* Activity items */}
              <div className="space-y-6">
                {employee.activities.map((activity) => (
                  <div key={activity.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full bg-almet-sapphire flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    </div>
                    
                    {/* Activity content */}
                    <div>
                      <h3 className={`${textPrimary} font-medium`}>{activity.title}</h3>
                      <p className={`${textSecondary} text-sm mt-1`}>{activity.description}</p>
                      <p className={`${textMuted} text-xs mt-1`}>{formatDate(activity.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className={textMuted}>No recent activity</p>
          )}
        </div>
      </div>
    </div>
  </div>
</DashboardLayout>)}