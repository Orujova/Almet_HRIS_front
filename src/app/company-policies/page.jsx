"use client";

import { useState, useMemo } from "react";
import {
  FolderOpen,
  Building2,
  X,
  Search,
  ChevronRight,
  FileText,
  Eye,
  Download,
  ArrowLeft,
  FolderPlus,
  Edit2,
  Trash2,
  Upload,
  File,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";

export default function CompanyFolderManager() {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("companies");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showAddPolicy, setShowAddPolicy] = useState(false);
  const [showEditPolicy, setShowEditPolicy] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newPolicyTitle, setNewPolicyTitle] = useState("");
  const [newPolicyDescription, setNewPolicyDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingPolicy, setEditingPolicy] = useState(null);

  const [companies] = useState([
    {
      id: "almet",
      name: "ALMET",
      fullName: "ALMET Technologies",
      color: "from-almet-sapphire to-almet-cloud-burst",
      folderCount: 3,
    }
  ]);

  const [foldersData, setFoldersData] = useState({
    almet: [
      {
        id: "emp-lifecycle",
        name: "Employment Lifecycle",
        description: "Hiring, onboarding, termination procedures",
        icon: "👥",
        policyCount: 4,
      },
      {
        id: "legal",
        name: "Legal & Compliance",
        description: "Contracts, NDAs, code of conduct",
        icon: "⚖️",
        policyCount: 2,
      },
      {
        id: "benefits",
        name: "Benefits & Leave",
        description: "Vacation, insurance policies",
        icon: "🎁",
        policyCount: 3,
      },
    ]
  });

  const [policiesData, setPoliciesData] = useState({
    "emp-lifecycle": [
      {
        id: 1,
        title: "Hiring Procedure",
        description: "Recruitment and workforce planning",
        updated: "2025-01",
        pdfUrl: "/pdfs/Hiring Procedure.pdf",
      },
      {
        id: 2,
        title: "Onboarding Process",
        description: "New employee integration program",
        updated: "2025-01",
        pdfUrl: "/pdfs/Onboarding Process.pdf",
      },
      {
        id: 3,
        title: "Termination Process",
        description: "Employee separation procedures",
        updated: "2025-01",
        pdfUrl: "/pdfs/Termination Process.pdf",
      },
      {
        id: 4,
        title: "Handover Procedure",
        description: "Knowledge transfer process",
        updated: "2025-01",
        pdfUrl: "/pdfs/Handover Procedure.pdf",
      },
    ],
    legal: [
      {
        id: 5,
        title: "Confidentiality & NDA",
        description: "Protection of sensitive information",
        updated: "2025-01",
        pdfUrl: "/pdfs/Confidentiality & Non-Disclosure Procedure.pdf",
      },
      {
        id: 6,
        title: "Code of Conduct",
        description: "Ethical standards and behavior",
        updated: "2025-01",
        pdfUrl: "/pdfs/Code of Conduct.pdf",
      },
    ],
    benefits: [
      {
        id: 7,
        title: "Vacation Policy",
        description: "Annual leave procedures",
        updated: "2025-01",
        pdfUrl: "/pdfs/Vacation.pdf",
      },
      {
        id: 8,
        title: "Medical Insurance",
        description: "Health coverage details",
        updated: "2025-01",
        pdfUrl: "/pdfs/Additional Medical Insurance.pdf",
      },
      {
        id: 9,
        title: "Pasha-Life Insurance",
        description: "Life insurance information",
        updated: "2025-01",
        pdfUrl: "/pdfs/Pasha-Life Insurance.pdf",
      },
    ],
  });

  const createFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      description: "New folder",
      icon: "📁",
      policyCount: 0,
    };

    setFoldersData((prev) => ({
      ...prev,
      [selectedCompany.id]: [...(prev[selectedCompany.id] || []), newFolder],
    }));

    setNewFolderName("");
    setShowCreateFolder(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Please select a PDF file");
    }
  };

  const addPolicy = () => {
    if (!newPolicyTitle.trim() || !selectedFile) return;

    const newPolicy = {
      id: Date.now(),
      title: newPolicyTitle,
      description: newPolicyDescription,
      updated: new Date().toISOString().split("T")[0],
      pdfUrl: URL.createObjectURL(selectedFile),
      fileName: selectedFile.name,
    };

    setPoliciesData((prev) => ({
      ...prev,
      [selectedFolder.id]: [...(prev[selectedFolder.id] || []), newPolicy],
    }));

    setFoldersData((prev) => ({
      ...prev,
      [selectedCompany.id]: prev[selectedCompany.id].map((f) =>
        f.id === selectedFolder.id
          ? { ...f, policyCount: f.policyCount + 1 }
          : f
      ),
    }));

    setNewPolicyTitle("");
    setNewPolicyDescription("");
    setSelectedFile(null);
    setShowAddPolicy(false);
  };

  const startEditPolicy = (policy) => {
    setEditingPolicy(policy);
    setNewPolicyTitle(policy.title);
    setNewPolicyDescription(policy.description);
    setShowEditPolicy(true);
  };

  const updatePolicy = () => {
    if (!newPolicyTitle.trim()) return;

    setPoliciesData((prev) => ({
      ...prev,
      [selectedFolder.id]: prev[selectedFolder.id].map((p) =>
        p.id === editingPolicy.id
          ? {
              ...p,
              title: newPolicyTitle,
              description: newPolicyDescription,
              updated: new Date().toISOString().split("T")[0],
              ...(selectedFile && {
                pdfUrl: URL.createObjectURL(selectedFile),
                fileName: selectedFile.name,
              }),
            }
          : p
      ),
    }));

    setNewPolicyTitle("");
    setNewPolicyDescription("");
    setSelectedFile(null);
    setEditingPolicy(null);
    setShowEditPolicy(false);
  };

  const deletePolicy = (policyId) => {
    if (!confirm("Are you sure you want to delete this policy?")) return;

    setPoliciesData((prev) => ({
      ...prev,
      [selectedFolder.id]: prev[selectedFolder.id].filter((p) => p.id !== policyId),
    }));

    setFoldersData((prev) => ({
      ...prev,
      [selectedCompany.id]: prev[selectedCompany.id].map((f) =>
        f.id === selectedFolder.id
          ? { ...f, policyCount: Math.max(0, f.policyCount - 1) }
          : f
      ),
    }));
  };

  const filteredCompanies = useMemo(
    () =>
      companies.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search, companies]
  );

  const currentFolders = selectedCompany ? foldersData[selectedCompany.id] || [] : [];
  const currentPolicies = selectedFolder ? policiesData[selectedFolder.id] || [] : [];

  const downloadPDF = (policy) => {
    const link = document.createElement("a");
    link.href = policy.pdfUrl;
    link.download = policy.fileName || `${policy.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (viewMode === "companies") {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-almet-sapphire/10' : 'bg-almet-mystic'}`}>
                <Building2 className={`w-6 h-6 ${darkMode ? 'text-almet-astral' : 'text-almet-sapphire'}`} />
              </div>
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Company Policies
              </h1>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Select a company to view their policy folders
            </p>
          </div>

          <div className="relative mb-6">
            <Search className={`absolute left-3 top-2.5 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg border ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-almet-sapphire'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire'
              } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/20 transition-all`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                onClick={() => {
                  setSelectedCompany(company);
                  setViewMode("folders");
                }}
                className={`group relative rounded-lg border p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700 hover:border-almet-sapphire/50 hover:bg-gray-800"
                    : "bg-white border-gray-200 hover:border-almet-sapphire/30 hover:shadow-lg"
                }`}
              >
                <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-almet-sapphire/5 to-transparent' 
                    : 'bg-gradient-to-br from-almet-mystic/50 to-transparent'
                }`}></div>

                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${company.color}`}>
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                      darkMode ? "text-gray-600" : "text-gray-400"
                    }`} />
                  </div>

                  <h3 className={`text-base font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {company.name}
                  </h3>
                  <p className={`text-sm mb-3 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {company.fullName}
                  </p>

                  <div className={`flex items-center gap-2 text-sm ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    <FolderOpen className="w-4 h-4" />
                    <span>{company.folderCount} folders</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (viewMode === "folders") {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setViewMode("companies")}
              className={`flex items-center gap-2 mb-4 px-3 py-1.5 text-sm rounded-lg transition-all ${
                darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Companies
            </button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedCompany.color}`}>
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedCompany.name} Folders
                  </h1>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {currentFolders.length} folders available
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateFolder(true)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg ${
                  darkMode 
                    ? 'bg-almet-sapphire text-white hover:bg-almet-cloud-burst' 
                    : 'bg-almet-sapphire text-white hover:bg-almet-cloud-burst'
                } transition-all`}
              >
                <FolderPlus className="w-4 h-4" />
                New Folder
              </button>
            </div>
          </div>

          {showCreateFolder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className={`w-full max-w-md rounded-lg p-5 ${
                darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-base font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Create New Folder
                  </h3>
                  <button
                    onClick={() => setShowCreateFolder(false)}
                    className={`p-1 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border mb-4 ${
                    darkMode
                      ? "bg-gray-900 border-gray-700 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                  autoFocus
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCreateFolder(false)}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createFolder}
                    className="flex-1 px-3 py-2 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentFolders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => {
                  setSelectedFolder(folder);
                  setViewMode("policies");
                }}
                className={`group relative rounded-lg border p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700 hover:border-almet-sapphire/50 hover:bg-gray-800"
                    : "bg-white border-gray-200 hover:border-almet-sapphire/30 hover:shadow-lg"
                }`}
              >
                <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-almet-sapphire/5 to-transparent' 
                    : 'bg-gradient-to-br from-almet-mystic/50 to-transparent'
                }`}></div>

                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{folder.icon}</div>
                    <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                      darkMode ? "text-gray-600" : "text-gray-400"
                    }`} />
                  </div>

                  <h3 className={`text-base font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {folder.name}
                  </h3>
                  <p className={`text-sm mb-3 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {folder.description}
                  </p>

                  <div className={`flex items-center gap-2 text-sm ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    <FileText className="w-4 h-4" />
                    <span>{folder.policyCount} policies</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (viewMode === "policies") {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setViewMode("folders")}
              className={`flex items-center gap-2 mb-4 px-3 py-1.5 text-sm rounded-lg transition-all ${
                darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Folders
            </button>

            <div className="flex items-center gap-2 mb-4 text-sm">
              <span className={darkMode ? "text-gray-500" : "text-gray-400"}>
                {selectedCompany.name}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className={darkMode ? "text-white" : "text-gray-900"}>
                {selectedFolder.name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{selectedFolder.icon}</div>
                <div>
                  <h1 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedFolder.name}
                  </h1>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {currentPolicies.length} policies
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddPolicy(true)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg ${
                  darkMode 
                    ? 'bg-almet-sapphire text-white hover:bg-almet-cloud-burst' 
                    : 'bg-almet-sapphire text-white hover:bg-almet-cloud-burst'
                } transition-all`}
              >
                <Upload className="w-4 h-4" />
                Add Policy
              </button>
            </div>
          </div>

          {showAddPolicy && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className={`w-full max-w-md rounded-lg p-5 ${
                darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-base font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Add New Policy
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddPolicy(false);
                      setNewPolicyTitle("");
                      setNewPolicyDescription("");
                      setSelectedFile(null);
                    }}
                    className={`p-1 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Policy title..."
                    value={newPolicyTitle}
                    onChange={(e) => setNewPolicyTitle(e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                  />

                  <textarea
                    placeholder="Policy description..."
                    value={newPolicyDescription}
                    onChange={(e) => setNewPolicyDescription(e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                  />

                  <div>
                    <label
                      className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border-2 border-dashed cursor-pointer ${
                        darkMode
                          ? "border-gray-700 hover:border-almet-sapphire/50 text-gray-400"
                          : "border-gray-300 hover:border-almet-sapphire/50 text-gray-600"
                      }`}
                    >
                      <File className="w-4 h-4" />
                      {selectedFile ? selectedFile.name : "Choose PDF file..."}
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setShowAddPolicy(false);
                      setNewPolicyTitle("");
                      setNewPolicyDescription("");
                      setSelectedFile(null);
                    }}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addPolicy}
                    disabled={!newPolicyTitle.trim() || !selectedFile}
                    className="flex-1 px-3 py-2 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Policy
                  </button>
                </div>
              </div>
            </div>
          )}

          {showEditPolicy && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className={`w-full max-w-md rounded-lg p-5 ${
                darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-base font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Edit Policy
                  </h3>
                  <button
                    onClick={() => {
                      setShowEditPolicy(false);
                      setNewPolicyTitle("");
                      setNewPolicyDescription("");
                      setSelectedFile(null);
                      setEditingPolicy(null);
                    }}
                    className={`p-1 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Policy title..."
                    value={newPolicyTitle}
                    onChange={(e) => setNewPolicyTitle(e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                    autoFocus
                  />

                  <textarea
                    placeholder="Policy description..."
                    value={newPolicyDescription}
                    onChange={(e) => setNewPolicyDescription(e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                  />

                  <div>
                    <label
                      className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border-2 border-dashed cursor-pointer ${
                        darkMode
                          ? "border-gray-700 hover:border-almet-sapphire/50 text-gray-400"
                          : "border-gray-300 hover:border-almet-sapphire/50 text-gray-600"
                      }`}
                    >
                      <File className="w-4 h-4" />
                      {selectedFile ? selectedFile.name : "Replace PDF (optional)..."}
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setShowEditPolicy(false);
                      setNewPolicyTitle("");
                      setNewPolicyDescription("");
                      setSelectedFile(null);
                      setEditingPolicy(null);
                    }}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updatePolicy}
                    disabled={!newPolicyTitle.trim()}
                    className="flex-1 px-3 py-2 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {currentPolicies.map((policy) => (
              <div
                key={policy.id}
                className={`group rounded-lg border p-4 transition-all ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700 hover:border-almet-sapphire/50"
                    : "bg-white border-gray-200 hover:border-almet-sapphire/30 hover:shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2.5 rounded-lg ${
                      darkMode ? 'bg-almet-sapphire/10 text-almet-astral' : 'bg-almet-mystic text-almet-sapphire'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-sm mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {policy.title}
                      </h3>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {policy.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setViewMode("pdf");
                      }}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg ${
                        darkMode 
                          ? 'bg-almet-sapphire text-white hover:bg-almet-cloud-burst' 
                          : 'bg-almet-sapphire text-white hover:bg-almet-cloud-burst'
                      } transition-all`}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => downloadPDF(policy)}
                      className={`p-2 rounded-lg ${
                        darkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startEditPolicy(policy)}
                      className={`p-2 rounded-lg ${
                        darkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePolicy(policy.id)}
                      className={`p-2 rounded-lg ${
                        darkMode ? "bg-red-900/20 hover:bg-red-900/30 text-red-400" : "bg-red-50 hover:bg-red-100 text-red-600"
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {currentPolicies.length === 0 && (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No policies in this folder</p>
              <button
                onClick={() => setShowAddPolicy(true)}
                className="mt-3 text-sm text-almet-sapphire hover:text-almet-cloud-burst"
              >
                Add your first policy
              </button>
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
          <div className={`flex items-center justify-between px-4 py-3 border-b ${
            darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode("policies")}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg ${
                  darkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } transition-all`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${
                  darkMode ? 'bg-almet-sapphire/10 text-almet-astral' : 'bg-almet-mystic text-almet-sapphire'
                }`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedPolicy.title}
                  </h2>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {selectedCompany.name} • {selectedFolder.name}
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
              } transition-all`}
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <iframe
              src={`${selectedPolicy.pdfUrl}#view=FitH`}
              className="w-full h-full border-0"
              title={selectedPolicy.title}
              onError={(e) => {
                console.error("PDF loading error:", e);
              }}
            />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return null;
}