"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useToast } from "@/components/common/Toast";
import ConfirmationModal from "@/components/common/ConfirmationModal";

// Import view components
import CompaniesView from "@/components/policy/CompaniesView";
import FoldersView from "@/components/policy/FoldersView";
import PoliciesView from "@/components/policy/PoliciesView";
import PDFViewer from "@/components/policy/PDFViewer";

// Import services
import {
  getBusinessFunctionsWithPolicies,
  getPolicyStatisticsOverview,
} from "@/services/policyService";

export default function CompanyPoliciesPage() {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();
  
  // Navigation state
  const [viewMode, setViewMode] = useState("companies");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  
  // Data state
  const [companies, setCompanies] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "danger",
    onConfirm: () => {},
  });

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
      showError("Failed to load business functions");
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

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setViewMode("folders");
  };

  const handleSelectFolder = (folder) => {
    setSelectedFolder(folder);
    setViewMode("policies");
  };

  const handleViewPolicy = (policy) => {
    setSelectedPolicy(policy);
    setViewMode("pdf");
  };

  const handleBackToCompanies = () => {
    setViewMode("companies");
    setSelectedCompany(null);
    setSelectedFolder(null);
    setSelectedPolicy(null);
  };

  const handleBackToFolders = () => {
    setViewMode("folders");
    setSelectedFolder(null);
    setSelectedPolicy(null);
  };

  const handleBackToPolicies = () => {
    setViewMode("policies");
    setSelectedPolicy(null);
  };

  return (
    <DashboardLayout>
      {viewMode === "companies" && (
        <CompaniesView
          companies={companies}
          statistics={statistics}
          loading={loading}
          error={error}
          darkMode={darkMode}
          onSelectCompany={handleSelectCompany}
          onReload={loadBusinessFunctions}
        />
      )}

      {viewMode === "folders" && selectedCompany && (
        <FoldersView
          selectedCompany={selectedCompany}
          darkMode={darkMode}
          onBack={handleBackToCompanies}
          onSelectFolder={handleSelectFolder}
          confirmModal={confirmModal}
          setConfirmModal={setConfirmModal}
        />
      )}

      {viewMode === "policies" && selectedFolder && selectedCompany && (
        <PoliciesView
          selectedCompany={selectedCompany}
          selectedFolder={selectedFolder}
          darkMode={darkMode}
          onBack={handleBackToFolders}
          onViewPolicy={handleViewPolicy}
          confirmModal={confirmModal}
          setConfirmModal={setConfirmModal}
        />
      )}

      {viewMode === "pdf" && selectedPolicy && selectedFolder && selectedCompany && (
        <PDFViewer
          selectedPolicy={selectedPolicy}
          selectedFolder={selectedFolder}
          selectedCompany={selectedCompany}
          darkMode={darkMode}
          onBack={handleBackToPolicies}
        />
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        darkMode={darkMode}
      />
    </DashboardLayout>
  );
}