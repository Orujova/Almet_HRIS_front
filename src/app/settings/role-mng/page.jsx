"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import MultiSelect from "@/components/common/MultiSelect";
import CustomCheckbox from "@/components/common/CustomCheckbox";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useToast } from "@/components/common/Toast";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import roleAccessService from "@/services/roleAccessService";
import axios from "axios";
import { 
  Shield, 
  Users, 
  Key, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  ChevronDown,
  Settings,
  UserPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function RoleAccessManagementPage() {
  const { darkMode } = useTheme();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("roles");
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination states
  const [rolesPage, setRolesPage] = useState(1);
  const [rolesTotal, setRolesTotal] = useState(0);
  const [rolesNext, setRolesNext] = useState(null);
  const [rolesPrev, setRolesPrev] = useState(null);
  
  const [permissionsPage, setPermissionsPage] = useState(1);
  const PERMISSIONS_PER_PAGE = 5;
  
  const [employeeRolesPage, setEmployeeRolesPage] = useState(1);
  const [employeeRolesTotal, setEmployeeRolesTotal] = useState(0);
  const [employeeRolesNext, setEmployeeRolesNext] = useState(null);
  const [employeeRolesPrev, setEmployeeRolesPrev] = useState(null);
  
  // Modal states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showBulkPermissionsModal, setShowBulkPermissionsModal] = useState(false);
  const [showBulkRoleAssignModal, setShowBulkRoleAssignModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToRevoke, setItemToRevoke] = useState(null);
  
  // Form states
  const [roleForm, setRoleForm] = useState({ name: "", is_active: true });
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [originalPermissions, setOriginalPermissions] = useState([]);
  const [bulkSelectedRoles, setBulkSelectedRoles] = useState([]);
  const [bulkPermissionsAction, setBulkPermissionsAction] = useState("add");
  const [bulkPermissionsSelected, setBulkPermissionsSelected] = useState([]);
  const [selectedRoleBoxes, setSelectedRoleBoxes] = useState([]);
  const [selectedEmployeeRows, setSelectedEmployeeRows] = useState([]);
  const [bulkRolesToAssign, setBulkRolesToAssign] = useState([]);
  
  // Store permissions for each selected role in bulk mode
  const [rolePermissionsMap, setRolePermissionsMap] = useState({});
  
  // Collapsible states
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedBulkCategories, setExpandedBulkCategories] = useState({});

  useEffect(() => {
    fetchData();
  }, [activeTab, rolesPage, employeeRolesPage]);

  useEffect(() => {
    fetchEmployees();
    fetchAllPermissions();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/employees/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data.results || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.showError("Failed to fetch employees");
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const permsData = await roleAccessService.permissions.getByCategory();
      setPermissions(permsData.categories || {});
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.showError("Failed to fetch permissions");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "roles") {
        const rolesData = await roleAccessService.roles.getAll({ page: rolesPage });
        setRoles(rolesData.results || []);
        setRolesTotal(rolesData.count || 0);
        setRolesNext(rolesData.next);
        setRolesPrev(rolesData.previous);
      } else if (activeTab === "permissions") {
        const permsData = await roleAccessService.permissions.getByCategory();
        setPermissions(permsData.categories || {});
        const allCategories = {};
        Object.keys(permsData.categories || {}).forEach(cat => {
          allCategories[cat] = true;
        });
        setExpandedCategories(allCategories);
      } else if (activeTab === "assignments") {
        const assignData = await roleAccessService.employeeRoles.getAll({ page: employeeRolesPage });
        setEmployeeRoles(assignData.results || []);
        setEmployeeRolesTotal(assignData.count || 0);
        setEmployeeRolesNext(assignData.next);
        setEmployeeRolesPrev(assignData.previous);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.showError("Failed to load data");
    }
    setLoading(false);
  };

  const handleCreateRole = async () => {
    try {
      if (!roleForm.name.trim()) {
        toast.showWarning("Please enter a role name");
        return;
      }
      await roleAccessService.roles.create(roleForm);
      setShowRoleModal(false);
      setRoleForm({ name: "", is_active: true });
      setRolesPage(1);
      fetchData();
      toast.showSuccess("Role created successfully");
    } catch (error) {
      console.error("Error creating role:", error);
      toast.showError("Failed to create role");
    }
  };

  const handleUpdateRole = async () => {
    try {
      if (!roleForm.name.trim()) {
        toast.showWarning("Please enter a role name");
        return;
      }
      await roleAccessService.roles.update(editingRole.id, roleForm);
      setShowRoleModal(false);
      setEditingRole(null);
      setRoleForm({ name: "", is_active: true });
      fetchData();
      toast.showSuccess("Role updated successfully");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.showError("Failed to update role");
    }
  };

  const handleDeleteRole = async () => {
    try {
      await roleAccessService.roles.delete(itemToDelete);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      fetchData();
      toast.showSuccess("Role deleted successfully");
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.showError("Failed to delete role");
    }
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setRoleForm({ name: role.name, is_active: role.is_active });
    setShowRoleModal(true);
  };

  const handleOpenBulkPermissions = async () => {
    setBulkSelectedRoles([]);
    setBulkPermissionsAction("add");
    setBulkPermissionsSelected([]);
    setRolePermissionsMap({});
    
    const allCategories = {};
    Object.keys(permissions).forEach(cat => {
      allCategories[cat] = false;
    });
    setExpandedBulkCategories(allCategories);
    
    setShowBulkPermissionsModal(true);
  };

  const handleBulkPermissionsForSelected = async (action) => {
    if (selectedRoleBoxes.length === 0) {
      toast.showWarning("Please select at least one role");
      return;
    }

    setLoading(true);
    try {
      const permissionsMap = {};
      for (const roleId of selectedRoleBoxes) {
        const rolePerms = await roleAccessService.roles.getPermissions(roleId);
        const permsArray = Array.isArray(rolePerms) ? rolePerms : (rolePerms.permissions || []);
        permissionsMap[roleId] = permsArray.map(p => p.id);
      }
      
      setRolePermissionsMap(permissionsMap);
      setBulkSelectedRoles(selectedRoleBoxes);
      setBulkPermissionsAction(action);
      setBulkPermissionsSelected([]);
      
      const allCategories = {};
      Object.keys(permissions).forEach(cat => {
        allCategories[cat] = false;
      });
      setExpandedBulkCategories(allCategories);
      
      setShowBulkPermissionsModal(true);
    } catch (error) {
      console.error("Error loading role permissions:", error);
      toast.showError("Failed to load role permissions");
    }
    setLoading(false);
  };

  const getAvailablePermissionsForBulk = () => {
    if (bulkSelectedRoles.length === 0) return [];
    
    const allPermissions = [];
    Object.values(permissions).forEach(categoryPerms => {
      allPermissions.push(...categoryPerms);
    });

    if (bulkPermissionsAction === "add") {
      return allPermissions;
    } else {
      return allPermissions.filter(perm => {
        return bulkSelectedRoles.some(roleId => {
          const rolePerms = rolePermissionsMap[roleId] || [];
          return rolePerms.includes(perm.id);
        });
      });
    }
  };

  const getFilteredPermissionsByCategory = () => {
    const availablePerms = getAvailablePermissionsForBulk();
    const filteredCategories = {};
    
    Object.entries(permissions).forEach(([category, perms]) => {
      const filtered = perms.filter(p => availablePerms.some(ap => ap.id === p.id));
      if (filtered.length > 0) {
        filteredCategories[category] = filtered;
      }
    });
    
    return filteredCategories;
  };

  const handleBulkPermissionsApply = async () => {
    try {
      if (bulkSelectedRoles.length === 0) {
        toast.showWarning("Please select at least one role");
        return;
      }
      if (bulkPermissionsSelected.length === 0) {
        toast.showWarning("Please select at least one permission");
        return;
      }

      setLoading(true);

      if (bulkPermissionsAction === "add") {
        await roleAccessService.roles.bulkAssignPermissions({
          role_ids: bulkSelectedRoles,
          permission_ids: bulkPermissionsSelected
        });
        toast.showSuccess(`Added ${bulkPermissionsSelected.length} permission(s) to ${bulkSelectedRoles.length} role(s)`);
      } else {
        let removedCount = 0;
        for (const roleId of bulkSelectedRoles) {
          const rolePerms = rolePermissionsMap[roleId] || [];
          for (const permId of bulkPermissionsSelected) {
            if (rolePerms.includes(permId)) {
              await roleAccessService.roles.removePermission(roleId, permId);
              removedCount++;
            }
          }
        }
        toast.showSuccess(`Removed ${removedCount} permission(s) from ${bulkSelectedRoles.length} role(s)`);
      }

      setShowBulkPermissionsModal(false);
      setBulkSelectedRoles([]);
      setBulkPermissionsSelected([]);
      setRolePermissionsMap({});
      setSelectedRoleBoxes([]);
      fetchData();
    } catch (error) {
      console.error("Error bulk updating permissions:", error);
      toast.showError("Failed to update permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    try {
      if (selectedEmployees.length === 0) {
        toast.showWarning("Please select at least one employee");
        return;
      }
      if (!selectedRole) {
        toast.showWarning("Please select a role");
        return;
      }

      await roleAccessService.employeeRoles.bulkAssignRoles({
        employee_ids: selectedEmployees,
        role_ids: [selectedRole]
      });

      setShowAssignModal(false);
      setSelectedEmployees([]);
      setSelectedRole(null);
      fetchData();
      toast.showSuccess(`Role assigned to ${selectedEmployees.length} employee(s)`);
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.showError("Failed to assign role");
    }
  };

  const handleBulkAssignRoles = async () => {
    try {
      if (selectedEmployeeRows.length === 0) {
        toast.showWarning("Please select at least one employee");
        return;
      }
      if (bulkRolesToAssign.length === 0) {
        toast.showWarning("Please select at least one role");
        return;
      }

      const employeeIds = selectedEmployeeRows.map(id => {
        const assignment = employeeRoles.find(er => er.id === id);
        return assignment?.employee;
      }).filter(Boolean);

      await roleAccessService.employeeRoles.bulkAssignRoles({
        employee_ids: employeeIds,
        role_ids: bulkRolesToAssign
      });

      setShowBulkRoleAssignModal(false);
      setBulkRolesToAssign([]);
      setSelectedEmployeeRows([]);
      fetchData();
      toast.showSuccess(`Assigned ${bulkRolesToAssign.length} role(s) to ${employeeIds.length} employee(s)`);
    } catch (error) {
      console.error("Error bulk assigning roles:", error);
      toast.showError("Failed to assign roles");
    }
  };

  const handleRevokeRole = async () => {
    try {
      await roleAccessService.employeeRoles.revokeRole(itemToRevoke.employeeId, itemToRevoke.roleId);
      setShowRevokeConfirm(false);
      setItemToRevoke(null);
      fetchData();
      toast.showSuccess("Role revoked successfully");
    } catch (error) {
      console.error("Error revoking role:", error);
      toast.showError("Failed to revoke role");
    }
  };

  const handleBulkRevokeRoles = async () => {
    try {
      if (selectedEmployeeRows.length === 0) {
        toast.showWarning("Please select at least one assignment");
        return;
      }

      for (const assignmentId of selectedEmployeeRows) {
        const assignment = employeeRoles.find(er => er.id === assignmentId);
        if (assignment) {
          await roleAccessService.employeeRoles.revokeRole(assignment.employee, assignment.role);
        }
      }

      setSelectedEmployeeRows([]);
      fetchData();
      toast.showSuccess(`Revoked ${selectedEmployeeRows.length} role assignment(s)`);
    } catch (error) {
      console.error("Error bulk revoking roles:", error);
      toast.showError("Failed to revoke roles");
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleBulkCategory = (category) => {
    setExpandedBulkCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const tabs = [
    { id: "roles", label: "Roles", icon: Shield },
    { id: "permissions", label: "Permissions", icon: Key },
    { id: "assignments", label: "Employee Assignments", icon: Users },
  ];

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployeeRoles = employeeRoles.filter((er) =>
    er.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    er.role_detail?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: `${emp.name} (${emp.employee_id})`,
    name: `${emp.name} (${emp.employee_id})`,
    id: emp.id
  }));

  const roleOptions = roles.map(role => ({
    value: role.id,
    label: role.name,
    name: role.name,
    id: role.id
  }));

  const getTotalPages = (total, perPage = 10) => Math.ceil(total / perPage);

  const paginatedPermissionCategories = () => {
    const categories = Object.entries(permissions);
    const start = (permissionsPage - 1) * PERMISSIONS_PER_PAGE;
    const end = start + PERMISSIONS_PER_PAGE;
    return categories.slice(start, end);
  };

  const totalPermissionPages = Math.ceil(Object.keys(permissions).length / PERMISSIONS_PER_PAGE);

  if (loading && roles.length === 0 && employeeRoles.length === 0) {
    return <LoadingSpinner message="Loading role management..." />;
  }

  const filteredBulkCategories = getFilteredPermissionsByCategory();

  return (
    <DashboardLayout>
      <div className="container mx-auto p-3 max-w-full">
        {/* Header - Daha kompakt */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm mb-3`}>
          <div className="px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
            <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Role & Access Management
            </h1>
            <p className={`mt-0.5 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage roles, permissions, and employee access
            </p>
          </div>

          {/* Tabs - Daha kiçik */}
          <div className="flex gap-1 px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedRoleBoxes([]);
                    setSelectedEmployeeRows([]);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-almet-sapphire text-almet-sapphire'
                      : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Bar - Daha kompakt */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm mb-3 px-4 py-2.5`}>
          <div className="flex items-center justify-between gap-3">
            {/* Search */}
            {(activeTab === "roles" || activeTab === "assignments") && (
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-1 focus:ring-almet-sapphire`}
                />
              </div>
            )}

            {/* Action Buttons - Kiçik düymələr */}
            <div className="flex gap-2 ml-auto">
              {activeTab === "roles" && (
                <>
                  {selectedRoleBoxes.length > 0 && (
                    <>
                      <button
                        onClick={() => handleBulkPermissionsForSelected("add")}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add ({selectedRoleBoxes.length})
                      </button>
                      <button
                        onClick={() => handleBulkPermissionsForSelected("remove")}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove ({selectedRoleBoxes.length})
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleOpenBulkPermissions}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-almet-steel-blue hover:bg-almet-astral text-white rounded-lg transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Bulk Permissions
                  </button>
                  <button
                    onClick={() => {
                      setEditingRole(null);
                      setRoleForm({ name: "", is_active: true });
                      setShowRoleModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create Role
                  </button>
                </>
              )}
              {activeTab === "assignments" && (
                <>
                  {selectedEmployeeRows.length > 0 && (
                    <>
                      <button
                        onClick={() => setShowBulkRoleAssignModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Assign ({selectedEmployeeRows.length})
                      </button>
                      <button
                        onClick={handleBulkRevokeRoles}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Revoke ({selectedEmployeeRows.length})
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Assign Role
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Roles Tab - Daha kompakt kartlar */}
          {activeTab === "roles" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredRoles.map((role) => (
                  <div
                    key={role.id}
                    className={`rounded-lg border ${
                      selectedRoleBoxes.includes(role.id)
                        ? 'border-almet-sapphire bg-almet-sapphire/5'
                        : darkMode
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    } p-3 shadow-sm hover:shadow transition-shadow`}
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <CustomCheckbox
                          checked={selectedRoleBoxes.includes(role.id)}
                          onChange={() => {
                            setSelectedRoleBoxes(prev =>
                              prev.includes(role.id)
                                ? prev.filter(id => id !== role.id)
                                : [...prev, role.id]
                            );
                          }}
                        />
                        <div className="p-1.5 rounded-lg bg-almet-sapphire/10 text-almet-sapphire">
                          <Shield className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          

                          <h3 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {role.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {role.is_system_role && (
                              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                System
                              </span>
                            )}
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              role.is_active
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {role.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                  
                        </div>
                      </div>

                      <div>
                                 <div className="flex gap-1.5">
                      <button 
                        onClick={() => openEditModal(role)}
                        className={`p-1.5 rounded transition-colors ${
                          darkMode 
                            ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!role.is_system_role && (
                        <button 
                          onClick={() => {
                            setItemToDelete(role.id);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-2.5">
                      <div className={`p-2 flex gap-6 items-center justify-center rounded ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Permissions
                        </p>
                        <p className={`text-xs font-bold mt-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {role.permissions_count || 0}
                        </p>
                      </div>
                      <div className={`p-2 flex gap-6 items-center justify-center rounded ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Employees
                        </p>
                        <p className={`text-xs font-bold mt-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {role.employees_count || 0}
                        </p>
                      </div>
                    </div>

                   
                  </div>
                ))}
              </div>
              
              {/* Pagination - Daha kiçik */}
              {rolesTotal > 10 && (
                <div className="flex items-center justify-between mt-3">
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {Math.min((rolesPage - 1) * 10 + 1, rolesTotal)}-{Math.min(rolesPage * 10, rolesTotal)} of {rolesTotal}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setRolesPage(p => Math.max(1, p - 1))}
                      disabled={!rolesPrev}
                      className={`p-1.5 rounded border text-xs transition-colors ${
                        darkMode 
                          ? 'border-gray-700 hover:bg-gray-700 disabled:opacity-50' 
                          : 'border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                      } disabled:cursor-not-allowed`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(getTotalPages(rolesTotal), 5) }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setRolesPage(page)}
                          className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                            page === rolesPage
                              ? 'bg-almet-sapphire text-white'
                              : darkMode
                              ? 'hover:bg-gray-700 text-gray-400'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setRolesPage(p => p + 1)}
                      disabled={!rolesNext}
                      className={`p-1.5 rounded border text-xs transition-colors ${
                        darkMode 
                          ? 'border-gray-700 hover:bg-gray-700 disabled:opacity-50' 
                          : 'border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                      } disabled:cursor-not-allowed`}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Permissions Tab - Daha kompakt */}
          {activeTab === "permissions" && (
            <>
              <div className="space-y-2.5">
                {paginatedPermissionCategories().map(([category, perms]) => (
                  <div
                    key={category}
                    className={`rounded-lg border shadow-sm ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => toggleCategory(category)}
                      className={`w-full px-4 py-2.5 flex items-center justify-between transition-colors ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-almet-sapphire/10 text-almet-sapphire">
                          <Key className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left">
                          <h3 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {category}
                          </h3>
                          <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {perms.length} permissions
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedCategories[category] ? 'rotate-180' : ''}`} />
                    </button>

                    {expandedCategories[category] && (
                      <div className={`px-4 pb-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                          {perms.map((perm) => (
                            <div
                              key={perm.id}
                              className={`p-2.5 rounded border ${
                                darkMode
                                  ? 'bg-gray-700/50 border-gray-600'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div className="p-1 rounded bg-almet-sapphire/10 text-almet-sapphire mt-0.5">
                                  <CheckCircle2 className="w-3 h-3" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-xs ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {perm.name}
                                  </p>
                                  <p className={`text-[10px] mt-0.5 font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                                    {perm.codename}
                                  </p>
                                  {perm.description && (
                                    <p className={`text-[10px] mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {perm.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPermissionPages > 1 && (
                <div className="flex items-center justify-between mt-3">
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Page {permissionsPage} of {totalPermissionPages}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPermissionsPage(p => Math.max(1, p - 1))}
                      disabled={permissionsPage === 1}
                      className={`p-1.5 rounded border transition-colors ${
                        darkMode 
                          ? 'border-gray-700 hover:bg-gray-700 disabled:opacity-50' 
                          : 'border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                      } disabled:cursor-not-allowed`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPermissionPages, 5) }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setPermissionsPage(page)}
                          className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                            page === permissionsPage
                              ? 'bg-almet-sapphire text-white'
                              : darkMode
                              ? 'hover:bg-gray-700 text-gray-400'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setPermissionsPage(p => Math.min(totalPermissionPages, p + 1))}
                      disabled={permissionsPage === totalPermissionPages}
                      className={`p-1.5 rounded border transition-colors ${
                        darkMode 
                          ? 'border-gray-700 hover:bg-gray-700 disabled:opacity-50' 
                          : 'border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                      } disabled:cursor-not-allowed`}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Assignments Tab - Daha kompakt cədvəl */}
          {activeTab === "assignments" && (
            <>
              <div className={`rounded-lg border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full rounded-lg overflow-hidden">
                    <thead className={`border-b ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                      <tr>
                        <th className="px-3 py-2 text-left">
                          <CustomCheckbox
                            checked={selectedEmployeeRows.length === filteredEmployeeRoles.length && filteredEmployeeRoles.length > 0}
                            onChange={() => {
                              if (selectedEmployeeRows.length === filteredEmployeeRoles.length) {
                                setSelectedEmployeeRows([]);
                              } else {
                                setSelectedEmployeeRows(filteredEmployeeRoles.map(er => er.id));
                              }
                            }}
                          />
                        </th>
                        <th className={`px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Employee
                        </th>
                        <th className={`px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Role
                        </th>
                        <th className={`px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Job Title
                        </th>
                        <th className={`px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Assigned
                        </th>
                        <th className={`px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Status
                        </th>
                        <th className={`px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {filteredEmployeeRoles.map((assignment) => (
                        <tr key={assignment.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                          <td className="px-3 py-2.5">
                            <CustomCheckbox
                              checked={selectedEmployeeRows.includes(assignment.id)}
                              onChange={() => {
                                setSelectedEmployeeRows(prev =>
                                  prev.includes(assignment.id)
                                    ? prev.filter(id => id !== assignment.id)
                                    : [...prev, assignment.id]
                                );
                              }}
                            />
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <div>
                              <p className={`font-medium text-xs ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {assignment.employee_name}
                              </p>
                              <p className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                ID: {assignment.employee_id_display}
                              </p>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-almet-sapphire/10 text-almet-sapphire">
                              {assignment.role_detail?.name}
                            </span>
                          </td>
                          <td className={`px-3 py-2.5 whitespace-nowrap text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {assignment.employee_job_title}
                          </td>
                          <td className={`px-3 py-2.5 whitespace-nowrap text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {new Date(assignment.assigned_at).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              assignment.is_active
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {assignment.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap text-right">
                            <button 
                              onClick={() => {
                                setItemToRevoke({ employeeId: assignment.employee, roleId: assignment.role });
                                setShowRevokeConfirm(true);
                              }}
                              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                              title="Revoke role"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {employeeRolesTotal > 10 && (
                <div className="flex items-center justify-between mt-3">
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {Math.min((employeeRolesPage - 1) * 10 + 1, employeeRolesTotal)}-{Math.min(employeeRolesPage * 10, employeeRolesTotal)} of {employeeRolesTotal}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEmployeeRolesPage(p => Math.max(1, p - 1))}
                      disabled={!employeeRolesPrev}
                      className={`p-1.5 rounded border transition-colors ${
                        darkMode 
                          ? 'border-gray-700 hover:bg-gray-700 disabled:opacity-50' 
                          : 'border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                      } disabled:cursor-not-allowed`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(getTotalPages(employeeRolesTotal), 5) }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setEmployeeRolesPage(page)}
                          className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                            page === employeeRolesPage
                              ? 'bg-almet-sapphire text-white'
                              : darkMode
                              ? 'hover:bg-gray-700 text-gray-400'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setEmployeeRolesPage(p => p + 1)}
                      disabled={!employeeRolesNext}
                      className={`p-1.5 rounded border transition-colors ${
                        darkMode 
                          ? 'border-gray-700 hover:bg-gray-700 disabled:opacity-50' 
                          : 'border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                      } disabled:cursor-not-allowed`}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Role Modal - Kiçik */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-lg shadow-xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
              <h2 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h2>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setEditingRole(null);
                  setRoleForm({ name: "", is_active: true });
                }}
                className={`p-1 rounded transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Role Name
                </label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="Enter role name"
                  className={`w-full px-3 py-1.5 text-xs rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-1 focus:ring-almet-sapphire`}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={roleForm.is_active}
                  onChange={(e) => setRoleForm({ ...roleForm, is_active: e.target.checked })}
                  className="w-3.5 h-3.5 text-almet-sapphire rounded focus:ring-almet-sapphire"
                />
                <label htmlFor="is_active" className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Active
                </label>
              </div>
            </div>
            <div className="flex gap-2 p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setEditingRole(null);
                  setRoleForm({ name: "", is_active: true });
                }}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={editingRole ? handleUpdateRole : handleCreateRole}
                className="flex-1 px-3 py-1.5 text-xs bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg font-medium transition-colors"
              >
                {editingRole ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-lg shadow-xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
              <h2 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Assign Role to Employees
              </h2>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedEmployees([]);
                  setSelectedRole(null);
                }}
                className={`p-1 rounded transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Employees
                </label>
                <MultiSelect
                  options={employeeOptions}
                  selected={selectedEmployees}
                  onChange={(field, value) => {
                    setSelectedEmployees(prev => 
                      prev.includes(value) ? prev.filter(id => id !== value) : [...prev, value]
                    );
                  }}
                  placeholder="Select employees..."
                  fieldName="employees"
                  darkMode={darkMode}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Role
                </label>
                <MultiSelect
                  options={roleOptions}
                  selected={selectedRole ? [selectedRole] : []}
                  onChange={(field, value) => setSelectedRole(value)}
                  placeholder="Select a role..."
                  fieldName="role"
                  darkMode={darkMode}
                />
              </div>
            </div>
            <div className="flex gap-2 p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedEmployees([]);
                  setSelectedRole(null);
                }}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRole}
                disabled={selectedEmployees.length === 0 || !selectedRole}
                className="flex-1 px-3 py-1.5 text-xs bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign ({bulkRolesToAssign.length})
              </button>
            </div>
          </div>
        </div>
      )}
{/* Bulk Role Assign Modal */}
      {showBulkRoleAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-lg shadow-xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
              <h2 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Assign Roles to Selected Employees
              </h2>
              <button
                onClick={() => {
                  setShowBulkRoleAssignModal(false);
                  setBulkRolesToAssign([]);
                }}
                className={`p-1 rounded transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className={`text-xs mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Assigning to {selectedEmployeeRows.length} employee(s)
              </p>
              <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Roles to Assign
              </label>
              <MultiSelect
                options={roleOptions}
                selected={bulkRolesToAssign}
                onChange={(field, value) => {
                  setBulkRolesToAssign(prev => 
                    prev.includes(value) ? prev.filter(id => id !== value) : [...prev, value]
                  );
                }}
                placeholder="Select roles..."
                fieldName="roles"
                darkMode={darkMode}
              />
            </div>
            <div className="flex gap-2 p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
              <button
                onClick={() => {
                  setShowBulkRoleAssignModal(false);
                  setBulkRolesToAssign([]);
                }}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAssignRoles}
                disabled={bulkRolesToAssign.length === 0}
                className="flex-1 px-3 py-1.5 text-xs bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign ({selectedEmployees.length})
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Permissions Modal - Kompakt */}
      {showBulkPermissionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-4xl max-h-[85vh] rounded-lg shadow-xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } flex flex-col`}>
            <div className="flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
              <div>
                <h2 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Bulk Permissions Management
                </h2>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {bulkSelectedRoles.length} role(s) • {bulkPermissionsSelected.length} permission(s) • {bulkPermissionsAction === 'add' ? 'Add' : 'Remove'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBulkPermissionsModal(false);
                  setBulkSelectedRoles([]);
                  setBulkPermissionsSelected([]);
                  setRolePermissionsMap({});
                }}
                className={`p-1 rounded transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Roles
                  </label>
                  <MultiSelect
                    options={roleOptions}
                    selected={bulkSelectedRoles}
                    onChange={async (field, value) => {
                      const newSelected = bulkSelectedRoles.includes(value) 
                        ? bulkSelectedRoles.filter(id => id !== value) 
                        : [...bulkSelectedRoles, value];
                      
                      setBulkSelectedRoles(newSelected);
                      
                      if (!bulkSelectedRoles.includes(value) && !rolePermissionsMap[value]) {
                        try {
                          const rolePerms = await roleAccessService.roles.getPermissions(value);
                          const permsArray = Array.isArray(rolePerms) ? rolePerms : (rolePerms.permissions || []);
                          setRolePermissionsMap(prev => ({
                            ...prev,
                            [value]: permsArray.map(p => p.id)
                          }));
                        } catch (error) {
                          console.error("Error loading role permissions:", error);
                        }
                      }
                    }}
                    placeholder="Select roles..."
                    fieldName="roles"
                    darkMode={darkMode}
                  />
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setBulkPermissionsAction("add")}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      bulkPermissionsAction === "add"
                        ? 'bg-green-600 text-white'
                        : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setBulkPermissionsAction("remove")}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      bulkPermissionsAction === "remove"
                        ? 'bg-red-600 text-white'
                        : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <h3 className={`font-medium text-xs mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Select Permissions to {bulkPermissionsAction === 'add' ? 'Add' : 'Remove'}
              </h3>
              {bulkSelectedRoles.length === 0 ? (
                <div className={`text-center py-8 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Please select at least one role to continue
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(filteredBulkCategories).map(([category, perms]) => {
                    const selectedCount = perms.filter(p => bulkPermissionsSelected.includes(p.id)).length;
                    return (
                      <div
                        key={category}
                        className={`rounded border ${
                          darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <button
                          onClick={() => toggleBulkCategory(category)}
                          className={`w-full p-2.5 flex items-center justify-between transition-colors ${
                            darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium text-xs ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {category}
                            </h4>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              bulkPermissionsAction === "add"
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {selectedCount}/{perms.length}
                            </span>
                          </div>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedBulkCategories[category] ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {expandedBulkCategories[category] && (
                          <div className="p-2.5 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                            {perms.map((perm) => {
                              const isSelected = bulkPermissionsSelected.includes(perm.id);
                              return (
                                <label
                                  key={perm.id}
                                  className={`flex items-start gap-1.5 p-2 rounded cursor-pointer transition-all text-xs ${
                                    isSelected
                                      ? bulkPermissionsAction === "add"
                                        ? 'bg-green-500/10 border border-green-500'
                                        : 'bg-red-500/10 border border-red-500'
                                      : darkMode
                                      ? 'hover:bg-gray-600 border border-transparent'
                                      : 'hover:bg-white border border-transparent'
                                  }`}
                                >
                                  <CustomCheckbox
                                    checked={isSelected}
                                    onChange={() => {
                                      setBulkPermissionsSelected(prev =>
                                        prev.includes(perm.id)
                                          ? prev.filter(id => id !== perm.id)
                                          : [...prev, perm.id]
                                      );
                                    }}
                                  />
                                  <span className={`flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {perm.name}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {Object.keys(filteredBulkCategories).length === 0 && bulkPermissionsAction === 'remove' && (
                    <div className={`text-center py-8 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No permissions available to remove from the selected role(s)
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
              <button
                onClick={() => {
                  setShowBulkPermissionsModal(false);
                  setBulkSelectedRoles([]);
                  setBulkPermissionsSelected([]);
                  setRolePermissionsMap({});
                }}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkPermissionsApply}
                disabled={bulkSelectedRoles.length === 0 || bulkPermissionsSelected.length === 0}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  bulkPermissionsAction === "add"
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {bulkPermissionsAction === "add" ? 'Add' : 'Remove'} ({bulkPermissionsSelected.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        darkMode={darkMode}
      />

      {/* Revoke Role Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRevokeConfirm}
        onClose={() => {
          setShowRevokeConfirm(false);
          setItemToRevoke(null);
        }}
        onConfirm={handleRevokeRole}
        title="Revoke Role"
        message="Are you sure you want to revoke this role from the employee? They will lose all associated permissions."
        confirmText="Revoke"
        cancelText="Cancel"
        type="danger"
        darkMode={darkMode}
      />
    </DashboardLayout>
  );
}

      