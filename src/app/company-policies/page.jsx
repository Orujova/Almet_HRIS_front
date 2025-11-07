"use client";

import { useState, useMemo } from "react";
import {
  ShieldCheck,
  BriefcaseBusiness,
  FileText,
  Search,
  Download,
  Eye,
  ArrowLeft,
  Plane,
  Lock,
  Mail,
  FileCheck,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";

export default function CompanyPoliciesPage() {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  const policies = [
    {
      id: "termination",
      title: "Termination Process",
      category: "Employment Lifecycle",
      icon: <ShieldCheck className="w-5 h-5" />,
      description: "Employee separation with clearance procedures",
      updated: "2025",
      pdfUrl: "/pdfs/Termination Process.pdf",
    },
    {
      id: "hiring",
      title: "Hiring Procedure",
      category: "Employment Lifecycle",
      icon: <BriefcaseBusiness className="w-5 h-5" />,
      description: "Recruitment and workforce planning",
      updated: "2025",
      pdfUrl: "/pdfs/Hiring Procedure.pdf",
    },
    {
      id: "onboarding",
      title: "Onboarding Process",
      category: "Employment Lifecycle",
      icon: <FileText className="w-5 h-5" />,
      description: "New employee integration program",
      updated: "2025",
      pdfUrl: "/pdfs/Onboarding Process.pdf",
    },
    {
      id: "handover",
      title: "Handover Procedure",
      category: "Employment Lifecycle",
      icon: <FileText className="w-5 h-5" />,
      description: "Transition and knowledge transfer process",
      updated: "2025",
      pdfUrl: "/pdfs/Handover Procedure.pdf",
    },
    {
      id: "confidentiality",
      title: "Confidentiality & NDA",
      category: "Legal & Compliance",
      icon: <Lock className="w-5 h-5" />,
      description: "Protection of sensitive information",
      updated: "2025",
      pdfUrl: "/pdfs/Confidentiality & Non-Disclosure Procedure.pdf",
    },
    {
      id: "code-of-conduct",
      title: "Code of Conduct",
      category: "Legal & Compliance",
      icon: <ShieldCheck className="w-5 h-5" />,
      description: "Ethical standards and professional behavior",
      updated: "2025",
      pdfUrl: "/pdfs/Code of Conduct.pdf",
    },
    {
      id: "signatures",
      title: "Email Signatures",
      category: "Corporate Standards",
      icon: <Mail className="w-5 h-5" />,
      description: "Official email signature templates",
      updated: "2025",
      pdfUrl: "/pdfs/Corporate signature templates.pdf",
    },
    {
      id: "vacation",
      title: "Vacation Policy",
      category: "Benefits & Leave",
      icon: <Plane className="w-5 h-5" />,
      description: "Annual leave and time-off procedures",
      updated: "2025",
      pdfUrl: "/pdfs/Vacation.pdf",
    },
    {
      id: "business-trip",
      title: "Business Trip Policy",
      category: "Travel & Expenses",
      icon: <Plane className="w-5 h-5" />,
      description: "Corporate travel guidelines and procedures",
      updated: "2025",
      pdfUrl: "/pdfs/Business Trip.pdf",
    },
    {
      id: "taxi",
      title: "Company Taxi Usage",
      category: "Travel & Expenses",
      icon: <BriefcaseBusiness className="w-5 h-5" />,
      description: "Corporate transportation policy",
      updated: "2025",
      pdfUrl: "/pdfs/Company Taxi usage .pdf",
    },
    {
      id: "medical-insurance",
      title: "Additional Medical Insurance",
      category: "Benefits & Leave",
      icon: <ShieldCheck className="w-5 h-5" />,
      description: "Supplementary health coverage details",
      updated: "2025",
      pdfUrl: "/pdfs/Additional Medical Insurance .pdf",
    },
    {
      id: "pasha-life",
      title: "Pasha-Life Insurance",
      category: "Benefits & Leave",
      icon: <ShieldCheck className="w-5 h-5" />,
      description: "Life insurance coverage information",
      updated: "2025",
      pdfUrl: "/pdfs/Pasha-Life Insurance .pdf",
    },
  ];

  const filteredPolicies = useMemo(
    () =>
      policies.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const downloadPDF = (policy) => {
    const link = document.createElement('a');
    link.href = policy.pdfUrl;
    link.download = `${policy.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewPDF = (policy) => {
    setSelectedPolicy(policy);
    setViewMode("pdf");
  };

  const backToList = () => {
    setViewMode("list");
    setSelectedPolicy(null);
  };

  if (viewMode === "list") {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {/* Professional Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-almet-sapphire/10' : 'bg-almet-mystic'}`}>
                <FileCheck className={`w-6 h-6 ${darkMode ? 'text-almet-astral' : 'text-almet-sapphire'}`} />
              </div>
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Company Policies & Procedures
              </h1>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Access and review official company documentation
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className={`absolute left-3 top-2.5 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search policies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg border ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-almet-sapphire' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire'
              } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/20 transition-all`}
            />
          </div>

          {/* Cards Grid with Enhanced Hover */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPolicies.map((policy) => (
              <div
                key={policy.id}
                className={`group relative rounded-lg border p-4 ${
                  darkMode 
                    ? 'bg-gray-800/50 border-gray-700 hover:border-almet-sapphire/50 hover:bg-gray-800' 
                    : 'bg-white border-gray-200 hover:border-almet-sapphire/30 hover:shadow-lg'
                } transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
              >
                {/* Subtle gradient overlay on hover */}
                <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-almet-sapphire/5 to-transparent' 
                    : 'bg-gradient-to-br from-almet-mystic/50 to-transparent'
                }`}></div>

                <div className="relative">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2.5 rounded-lg ${
                      darkMode ? 'bg-almet-sapphire/10 text-almet-astral' : 'bg-almet-mystic text-almet-sapphire'
                    } group-hover:scale-110 transition-transform duration-300`}>
                      {policy.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-almet-sapphire transition-colors`}>
                        {policy.title}
                      </h3>
                      <p className={`text-xs leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {policy.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs px-2.5 py-1 rounded-md ${
                      darkMode 
                        ? 'bg-gray-700/50 text-gray-300' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {policy.category}
                    </span>
                  
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => viewPDF(policy)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg ${
                        darkMode 
                          ? 'bg-almet-sapphire text-white hover:bg-almet-cloud-burst' 
                          : 'bg-almet-sapphire text-white hover:bg-almet-cloud-burst'
                      } transition-all duration-200 transform hover:scale-105`}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => downloadPDF(policy)}
                      className={`flex items-center justify-center px-3 py-2 rounded-lg ${
                        darkMode 
                          ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } transition-all duration-200 transform hover:scale-105`}
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPolicies.length === 0 && (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <p className="text-sm">No policies found</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  if (viewMode === "pdf" && selectedPolicy) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-4rem)] flex flex-col">
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <button
                onClick={backToList}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg ${
                  darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-all duration-200 hover:scale-105`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${
                  darkMode ? 'bg-almet-sapphire/10 text-almet-astral' : 'bg-almet-mystic text-almet-sapphire'
                }`}>
                  {selectedPolicy.icon}
                </div>
                <div>
                  <h2 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedPolicy.title}
                  </h2>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedPolicy.category}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => downloadPDF(selectedPolicy)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg ${
                darkMode 
                  ? 'bg-almet-sapphire text-white hover:bg-almet-cloud-burst' 
                  : 'bg-almet-sapphire text-white hover:bg-almet-cloud-burst'
              } transition-all duration-200 hover:scale-105`}
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 overflow-hidden relative">
            <iframe
              src={`${selectedPolicy.pdfUrl}#view=FitH`}
              className="w-full h-full border-0"
              title={selectedPolicy.title}
              onError={(e) => {
                console.error('PDF loading error:', e);
              }}
            />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return null;
}