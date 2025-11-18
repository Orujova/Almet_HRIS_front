"use client";

import { useState, useEffect, useMemo } from "react";
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
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import {
  getBusinessFunctionsWithPolicies,
  getFoldersByBusinessFunction,
  getPoliciesByFolder,
  createFolder,
  createPolicy,
  updatePolicy,
  partialUpdatePolicy,
  deletePolicy,
  trackPolicyView,
  trackPolicyDownload,
  acknowledgePolicy,

  getFolderStatistics,
  getPolicyStatisticsOverview,
  validatePDFFile,
  getAuthenticatedPDFUrl,
} from "@/services/policyService";

export default function CompanyPoliciesPage() {
  const { darkMode } = useTheme();
  
  // Navigation state
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("companies");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
     const [activeTab, setActiveTab] = useState("document");
  // Data state
  const [companies, setCompanies] = useState([]);
  const [folders, setFolders] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [statistics, setStatistics] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Modal states
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showAddPolicy, setShowAddPolicy] = useState(false);
  const [showEditPolicy, setShowEditPolicy] = useState(false);
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);

  
  // Form states - Folder
  const [folderForm, setFolderForm] = useState({
    name: "",
    description: "",
    icon: "📁"
  });
  
  // Form states - Policy
  const [policyForm, setPolicyForm] = useState({
    title: "",
    description: "",

    requires_acknowledgment: false,
   
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingPolicy, setEditingPolicy] = useState(null);
  
  // Acknowledgment
  const [acknowledgeNotes, setAcknowledgeNotes] = useState("");
  


  // Load business functions on mount
  useEffect(() => {
    loadBusinessFunctions();
    loadOverallStatistics();
  }, []);

  const loadBusinessFunctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBusinessFunctionsWithPolicies();
      setCompanies(data.results || data || []);
    } catch (err) {
      setError(err.message || "Failed to load business functions");
      console.error('Error loading business functions:', err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOverallStatistics = async () => {
    try {
      const data = await getPolicyStatisticsOverview();
      setStatistics(data);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  // Load folders when company is selected
  useEffect(() => {
    if (selectedCompany && viewMode === "folders") {
      loadFolders(selectedCompany.id);
    }
  }, [selectedCompany, viewMode]);

  const loadFolders = async (bfId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFoldersByBusinessFunction(bfId);
      setFolders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load folders");
      console.error('Error loading folders:', err);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  // Load policies when folder is selected
  useEffect(() => {
    if (selectedFolder && viewMode === "policies") {
      loadPolicies(selectedFolder.id);
    }
  }, [selectedFolder, viewMode]);

  const loadPolicies = async (folderId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPoliciesByFolder(folderId);
      setPolicies(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load policies");
      console.error('Error loading policies:', err);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  // Create folder
  const handleCreateFolder = async () => {
    if (!folderForm.name.trim()) {
      alert("Please enter folder name");
      return;
    }

    setSubmitting(true);
    try {
      const folderData = {
        business_function: selectedCompany.id,
        name: folderForm.name,
        description: folderForm.description,
        icon: folderForm.icon,
     
        is_active: true,
      };

      await createFolder(folderData);
      await loadFolders(selectedCompany.id);

      setFolderForm({ name: "", description: "", icon: "📁"});
      setShowCreateFolder(false);
    } catch (err) {
      alert(`Error: ${err.message || "Failed to create folder"}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Add policy
  const handleAddPolicy = async () => {
    if (!policyForm.title.trim() || !selectedFile) {
      alert("Please provide title and PDF file");
      return;
    }

    const validation = validatePDFFile(selectedFile);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setSubmitting(true);
    try {
      const policyData = {
        folder: selectedFolder.id,
        title: policyForm.title,
        description: policyForm.description,
        policy_file: selectedFile,
   
        requires_acknowledgment: policyForm.requires_acknowledgment,
     
        is_active: true,
      };

      await createPolicy(policyData);
      await loadPolicies(selectedFolder.id);

      setPolicyForm({
        title: "",
        description: "",
      
        requires_acknowledgment: false,
       
      });
      setSelectedFile(null);
      setShowAddPolicy(false);
    } catch (err) {
      console.error('Create policy error:', err);
      alert(`Error: ${err.error || err.message || "Failed to create policy"}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Update policy
  const handleUpdatePolicy = async () => {
    if (!policyForm.title.trim()) {
      alert("Please provide title");
      return;
    }

    if (selectedFile) {
      const validation = validatePDFFile(selectedFile);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
    }

    setSubmitting(true);
    try {
      const policyData = {
        folder: selectedFolder.id,
        title: policyForm.title,
        description: policyForm.description,
      
        requires_acknowledgment: policyForm.requires_acknowledgment,
       
      };

      if (selectedFile) {
        policyData.policy_file = selectedFile;
      }

      await partialUpdatePolicy(editingPolicy.id, policyData);
      await loadPolicies(selectedFolder.id);

      setPolicyForm({
        title: "",
        description: "",
     
        requires_acknowledgment: false,
        
      });
      setSelectedFile(null);
      setEditingPolicy(null);
      setShowEditPolicy(false);
    } catch (err) {
      alert(`Error: ${err.message || "Failed to update policy"}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete policy
  const handleDeletePolicy = async (policyId) => {
    if (!confirm("Are you sure you want to delete this policy?")) return;

    try {
      await deletePolicy(policyId);
      await loadPolicies(selectedFolder.id);
    } catch (err) {
      alert(`Error: ${err.message || "Failed to delete policy"}`);
    }
  };

  // File selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validatePDFFile(file);
      if (validation.valid) {
        setSelectedFile(file);
      } else {
        alert(validation.error);
        e.target.value = null;
      }
    }
  };

  // Start edit
  const startEditPolicy = (policy) => {
    setEditingPolicy(policy);
    setPolicyForm({
      title: policy.title,
      description: policy.description || "",
   
      requires_acknowledgment: policy.requires_acknowledgment || false,
     
    });
    setShowEditPolicy(true);
  };

  // View PDF
  const handleViewPDF = async (policy) => {
    try {
      await trackPolicyView(policy.id);
      setSelectedPolicy(policy);
      setViewMode("pdf");
    } catch (err) {
      console.error('Error tracking view:', err);
      setSelectedPolicy(policy);
      setViewMode("pdf");
    }
  };

  // Download PDF
  const handleDownloadPDF = async (policy) => {
    try {
      await trackPolicyDownload(policy.id);
      
      const link = document.createElement("a");
      link.href = policy.policy_url || policy.policy_file;
      link.download = `${policy.title}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Reload policies to update download count
      if (selectedFolder) {
        await loadPolicies(selectedFolder.id);
      }
    } catch (err) {
      console.error('Error downloading:', err);
    }
  };

  // Acknowledge policy
  const handleAcknowledge = async () => {
    if (!selectedPolicy) return;

    setSubmitting(true);
    try {
      await acknowledgePolicy(selectedPolicy.id, acknowledgeNotes);
      alert("Policy acknowledged successfully!");
      setAcknowledgeNotes("");
      setShowAcknowledgeModal(false);
      await loadPolicies(selectedFolder.id);
    } catch (err) {
      alert(`Error: ${err.message || "Failed to acknowledge policy"}`);
    } finally {
      setSubmitting(false);
    }
  };



  // Filter companies
  const filteredCompanies = useMemo(
    () => companies.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    ),
    [search, companies]
  );



  // Reset modal
  const resetFolderModal = () => {
    setFolderForm({ name: "", description: "", icon: "📁" });
    setShowCreateFolder(false);
  };

  const resetPolicyModal = () => {
    setPolicyForm({
      title: "",
      description: "",
 
      requires_acknowledgment: false,
    
    });
    setSelectedFile(null);
    setEditingPolicy(null);
    setShowAddPolicy(false);
    setShowEditPolicy(false);
  };

  // Loading spinner
  if (loading && companies.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${
              darkMode ? 'text-almet-astral' : 'text-almet-sapphire'
            }`} />
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading policies...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ==================== COMPANIES VIEW ====================
  if (viewMode === "companies") {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-lg bg-gradient-to-br from-almet-sapphire to-almet-cloud-burst`}>
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Company Policies
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage company policies across all business functions
                </p>
              </div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className={`rounded-lg p-4 ${
                  darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Policies
                      </p>
                      <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {statistics.total_policies}
                      </p>
                    </div>
                    <FileText className={`w-8 h-8 ${darkMode ? 'text-almet-astral' : 'text-almet-sapphire'}`} />
                  </div>
                </div>

                <div className={`rounded-lg p-4 ${
                  darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Views
                      </p>
                      <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {statistics.total_views}
                      </p>
                    </div>
                    <Eye className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                </div>

                <div className={`rounded-lg p-4 ${
                  darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Downloads
                      </p>
                      <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {statistics.total_downloads}
                      </p>
                    </div>
                    <Download className={`w-8 h-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                </div>

                <div className={`rounded-lg p-4 ${
                  darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Folders
                      </p>
                      <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {statistics.total_folders}
                      </p>
                    </div>
                    <FolderOpen className={`w-8 h-8 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
              darkMode ? 'bg-red-900/20 border border-red-800 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Search */}
          <div className="relative mb-6">
            <Search className={`absolute left-3 top-2.5 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search business functions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg border ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-almet-sapphire'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-almet-sapphire'
              } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/20 transition-all`}
            />
          </div>

          {/* Companies Grid */}
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
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-almet-sapphire to-almet-cloud-burst">
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
                    {company.code}
                  </p>

                  <div className="flex items-center gap-4 text-xs">
                    <div className={`flex items-center gap-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>{company.folder_count || 0} folders</span>
                    </div>
                    <div className={`flex items-center gap-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                      <FileText className="w-3.5 h-3.5" />
                      <span>{company.total_policy_count || 0} policies</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCompanies.length === 0 && (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No business functions found</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ==================== FOLDERS VIEW ====================
  if (viewMode === "folders") {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => {
                setViewMode("companies");
                setSelectedCompany(null);
              }}
              className={`flex items-center gap-2 mb-4 px-3 py-1.5 text-sm rounded-lg transition-all ${
                darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Business Functions
            </button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-almet-sapphire to-almet-cloud-burst">
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedCompany.name} - Policy Folders
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {folders.length} folders available
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateFolder(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-almet-sapphire text-white hover:bg-almet-cloud-burst transition-all"
              >
                <FolderPlus className="w-4 h-4" />
                New Folder
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-almet-astral' : 'text-almet-sapphire'}`} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map((folder) => (
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
                      <div className="text-3xl">{folder.icon || "📁"}</div>
                      <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                        darkMode ? "text-gray-600" : "text-gray-400"
                      }`} />
                    </div>

                    <h3 className={`text-base font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {folder.name}
                    </h3>
                    <p className={`text-sm mb-3 line-clamp-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {folder.description || "No description"}
                    </p>

                    <div className="flex items-center gap-4 text-xs">
                      <div className={`flex items-center gap-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                        <FileText className="w-3.5 h-3.5" />
                        <span>{folder.policy_count || 0} policies</span>
                      </div>
                   
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {folders.length === 0 && !loading && (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm mb-2">No folders in this business function</p>
              <button
                onClick={() => setShowCreateFolder(true)}
                className="text-sm text-almet-sapphire hover:text-almet-cloud-burst"
              >
                Create your first folder
              </button>
            </div>
          )}

          {/* Create Folder Modal */}
          {showCreateFolder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className={`w-full max-w-md rounded-lg p-6 ${
                darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Create New Folder
                  </h3>
                  <button
                    onClick={resetFolderModal}
                    className={`p-1 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Folder Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Employment Lifecycle"
                      value={folderForm.name}
                      onChange={(e) => setFolderForm({...folderForm, name: e.target.value})}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        darkMode
                          ? "bg-gray-900 border-gray-700 text-white"
                          : "bg-gray-50 border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Description
                    </label>
                    <textarea
                      placeholder="Brief description of folder contents..."
                      value={folderForm.description}
                      onChange={(e) => setFolderForm({...folderForm, description: e.target.value})}
                      rows={3}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        darkMode
                          ? "bg-gray-900 border-gray-700 text-white"
                          : "bg-gray-50 border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Icon 
                    </label>
                    <input
                      type="text"
                      placeholder="📁"
                      value={folderForm.icon}
                      onChange={(e) => setFolderForm({...folderForm, icon: e.target.value})}
                      maxLength={2}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        darkMode
                          ? "bg-gray-900 border-gray-700 text-white"
                          : "bg-gray-50 border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                    />
                  </div>

                  
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={resetFolderModal}
                    disabled={submitting}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    } disabled:opacity-50 transition-all`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFolder}
                    disabled={submitting || !folderForm.name.trim()}
                    className="flex-1 px-4 py-2 text-sm font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Folder
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ==================== POLICIES VIEW ====================
if (viewMode === "policies") {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => {
              setViewMode("folders");
              setSelectedFolder(null);
            }}
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
              <div className="text-3xl">{selectedFolder.icon || "📁"}</div>
              <div>
                <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedFolder.name}
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {policies.length} policies
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddPolicy(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-almet-sapphire text-white hover:bg-almet-cloud-burst transition-all"
            >
              <Upload className="w-4 h-4" />
              Add Policy
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-almet-astral' : 'text-almet-sapphire'}`} />
          </div>
        ) : policies.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm mb-2">No policies in this folder</p>
            <button
              onClick={() => setShowAddPolicy(true)}
              className="text-sm text-almet-sapphire hover:text-almet-cloud-burst"
            >
              Add your first policy
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className={`group rounded-lg border p-4 transition-all ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700 hover:border-almet-sapphire/50"
                    : "bg-white border-gray-200 hover:border-almet-sapphire/30 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                      darkMode ? 'bg-almet-sapphire/10 text-almet-astral' : 'bg-almet-mystic text-almet-sapphire'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {policy.title}
                        </h3>
                   
                    
                      </div>
                      <p className={`text-sm mb-2 line-clamp-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {policy.description || "No description"}
                      </p>
                      <div className={`flex items-center gap-4 text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                        <span>{policy.file_size_display}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{policy.view_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          <span>{policy.download_count || 0}</span>
                        </div>
                       {policy.requires_acknowledgment && (
    <div className={`flex items-center gap-1 ${
      policy.acknowledgment_percentage >= 80 
        ? 'text-green-500' 
        : policy.acknowledgment_percentage >= 50 
          ? 'text-yellow-500' 
          : 'text-red-500'
    }`}>
      <CheckCircle className="w-3 h-3" />
      <span>{policy.acknowledgment_count || 0} acked</span>
      {policy.acknowledgment_percentage !== null && (
        <span className="text-xs">({policy.acknowledgment_percentage}%)</span>
      )}
    </div>
  )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleViewPDF(policy)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-almet-sapphire text-white hover:bg-almet-cloud-burst transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(policy)}
                      className={`p-2 rounded-lg ${
                        darkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"
                      } transition-all`}
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startEditPolicy(policy)}
                      className={`p-2 rounded-lg ${
                        darkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"
                      } transition-all`}
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePolicy(policy.id)}
                      className={`p-2 rounded-lg ${
                        darkMode ? "bg-red-900/20 hover:bg-red-900/30 text-red-400" : "bg-red-50 hover:bg-red-100 text-red-600"
                      } transition-all`}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Policy Modal */}
        {showAddPolicy && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className={`w-full max-w-2xl rounded-lg p-6 my-8 ${
              darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Add New Policy
                </h3>
                <button
                  onClick={resetPolicyModal}
                  className={`p-1 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Policy Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Hiring Procedure"
                    value={policyForm.title}
                    onChange={(e) => setPolicyForm({...policyForm, title: e.target.value})}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    placeholder="Brief description of the policy..."
                    value={policyForm.description}
                    onChange={(e) => setPolicyForm({...policyForm, description: e.target.value})}
                    rows={3}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                  />
                </div>


             

                <div className="space-y-2">
                 

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyForm.requires_acknowledgment}
                      onChange={(e) => setPolicyForm({...policyForm, requires_acknowledgment: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-almet-sapphire focus:ring-almet-sapphire"
                    />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Requires employee acknowledgment
                    </span>
                  </label>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Policy File (PDF) *
                  </label>
                  <label className={`flex flex-col items-center justify-center gap-2 px-4 py-6 text-sm rounded-lg border-2 border-dashed cursor-pointer ${
                    darkMode
                      ? "border-gray-700 hover:border-almet-sapphire/50 text-gray-400 hover:bg-gray-900/50"
                      : "border-gray-300 hover:border-almet-sapphire/50 text-gray-600 hover:bg-gray-50"
                  } transition-all`}>
                    <File className="w-8 h-8" />
                    <div className="text-center">
                      <p className="font-medium">{selectedFile ? selectedFile.name : "Choose PDF file"}</p>
                      <p className="text-xs mt-1">Maximum file size: 10MB</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  {selectedFile && (
                    <p className={`text-xs mt-2 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                      File size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>

              <div className={`flex gap-2 mt-6 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={resetPolicyModal}
                  disabled={submitting}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg ${
                    darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } disabled:opacity-50 transition-all`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPolicy}
                  disabled={submitting || !policyForm.title.trim() || !selectedFile}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Policy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Policy Modal */}
        {showEditPolicy && editingPolicy && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className={`w-full max-w-2xl rounded-lg p-6 my-8 ${
              darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Edit Policy
                </h3>
                <button
                  onClick={resetPolicyModal}
                  className={`p-1 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Policy Title *
                  </label>
                  <input
                    type="text"
                    value={policyForm.title}
                    onChange={(e) => setPolicyForm({...policyForm, title: e.target.value})}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={policyForm.description}
                    onChange={(e) => setPolicyForm({...policyForm, description: e.target.value})}
                    rows={3}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                  />
                </div>

             

   

                <div className="space-y-2">
                 
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyForm.requires_acknowledgment}
                      onChange={(e) => setPolicyForm({...policyForm, requires_acknowledgment: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-almet-sapphire focus:ring-almet-sapphire"
                    />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Requires employee acknowledgment
                    </span>
                  </label>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Replace Policy File (Optional)
                  </label>
                  <label className={`flex flex-col items-center justify-center gap-2 px-4 py-6 text-sm rounded-lg border-2 border-dashed cursor-pointer ${
                    darkMode
                      ? "border-gray-700 hover:border-almet-sapphire/50 text-gray-400 hover:bg-gray-900/50"
                      : "border-gray-300 hover:border-almet-sapphire/50 text-gray-600 hover:bg-gray-50"
                  } transition-all`}>
                    <File className="w-8 h-8" />
                    <div className="text-center">
                      <p className="font-medium">{selectedFile ? selectedFile.name : "Choose new PDF file (optional)"}</p>
                      <p className="text-xs mt-1">Leave empty to keep current file</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  {selectedFile && (
                    <p className={`text-xs mt-2 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                      New file size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>

              <div className={`flex gap-2 mt-6 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={resetPolicyModal}
                  disabled={submitting}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg ${
                    darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } disabled:opacity-50 transition-all`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePolicy}
                  disabled={submitting || !policyForm.title.trim()}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update Policy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

  // ==================== PDF VIEWER ====================
  // ==================== PDF VIEWER ====================
if (viewMode === "pdf" && selectedPolicy) {

  const getPDFUrl = () => {
    const url = selectedPolicy.policy_url || selectedPolicy.policy_file;
    if (!url) return null;
    
    // Əgər Google Drive linki varsa, &output=embed əlavə et
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      return url.includes('?') ? `${url}&output=embed` : `${url}?output=embed`;
    }
    
    return url;
  };

  const pdfUrl = getPDFUrl();
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setViewMode("policies");
                setSelectedPolicy(null);
              }}
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

          <div className="flex items-center gap-2">
            
              <div className={`flex border-b ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <button
            onClick={() => setActiveTab("document")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "document"
                ? darkMode
                  ? 'border-almet-sapphire text-white'
                  : 'border-almet-sapphire text-almet-sapphire'
                : darkMode
                  ? 'border-transparent text-gray-400 hover:text-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Document
          </button>
          
          {selectedPolicy.requires_acknowledgment && (
            <button
              onClick={() => setActiveTab("acknowledgments")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "acknowledgments"
                  ? darkMode
                    ? 'border-almet-sapphire text-white'
                    : 'border-almet-sapphire text-almet-sapphire'
                  : darkMode
                    ? 'border-transparent text-gray-400 hover:text-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Acknowledgments
            </button>
          )}
        </div>
            <div className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs ${
              darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'
            }`}>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{selectedPolicy.view_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>{selectedPolicy.download_count || 0}</span>
              </div>
            </div>

            {selectedPolicy.requires_acknowledgment && (
              <button
                onClick={() => setShowAcknowledgeModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                Acknowledge
              </button>
            )}

            <button
              onClick={() => handleDownloadPDF(selectedPolicy)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-almet-sapphire text-white hover:bg-almet-cloud-burst transition-all"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        {/* PDF Viewer - Iframe */}
         <div className={`flex-1 overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={selectedPolicy.title}
              style={{ border: 'none' }}
              loading="lazy"
            />
          ) : (
                <div className={`h-full overflow-y-auto p-4 ${
              darkMode ? 'bg-gray-900' : 'bg-gray-100'
            }`}>
              <PolicyAcknowledgmentsList 
                policyId={selectedPolicy.id} 
                darkMode={darkMode} 
              />
            </div>
          )}
        </div>

        {/* Acknowledge Modal */}
        {showAcknowledgeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md rounded-lg p-6 ${
              darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Acknowledge Policy
                </h3>
                <button
                  onClick={() => {
                    setShowAcknowledgeModal(false);
                    setAcknowledgeNotes("");
                  }}
                  className={`p-1 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  By acknowledging this policy, you confirm that you have read and understood its contents.
                </p>

                <div className={`p-3 rounded-lg mb-4 ${
                  darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                    {selectedPolicy.title}
                  </p>
                </div>

                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="Add any comments or questions..."
                  value={acknowledgeNotes}
                  onChange={(e) => setAcknowledgeNotes(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    darkMode
                      ? "bg-gray-900 border-gray-700 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAcknowledgeModal(false);
                    setAcknowledgeNotes("");
                  }}
                  disabled={submitting}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg ${
                    darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } disabled:opacity-50 transition-all`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcknowledge}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <CheckCircle className="w-4 h-4" />
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

return null;
}



