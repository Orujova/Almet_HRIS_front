'use client';
import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Save, X, Search, Target, BarChart3,
  RefreshCw, AlertCircle, Building, Users, ListFilter, LayoutGrid, 
  Table as TableIcon, Crown, ChevronRight, ChevronDown, Settings
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';
import { competencyApi } from '@/services/competencyApi';
import AssessmentMatrix from './AssessmentMatrix';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import { ToastProvider, useToast } from '@/components/common/Toast';

const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', disabled = false, loading = false, size = 'md', className = '' }) => {
  const variants = {
    primary: 'bg-almet-sapphire hover:bg-almet-astral text-white',
    secondary: 'bg-almet-bali-hai hover:bg-almet-waterloo text-white',
    success: 'bg-blue-600 hover:bg-blue-700 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    outline: 'border-2 border-almet-sapphire text-almet-sapphire hover:bg-almet-sapphire hover:text-white bg-transparent',
  };
  const sizes = { xs: 'px-2 py-1 text-xs', sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-2xl font-medium transition-all duration-200 shadow-sm ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'hover:shadow'} ${className}`}
    >
      {loading ? <RefreshCw size={16} className="animate-spin"/> : <Icon size={16}/>}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

const Field = ({ label, children, required }) => (
  <label className="block space-y-2">
    {label && (
      <span className="text-xs font-semibold text-almet-cloud-burst dark:text-white">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
    )}
    {children}
  </label>
);

const TextInput = ({ value, onChange, placeholder = '', required = false, autoFocus = false }) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    autoFocus={autoFocus}
    className="w-full px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200 bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire placeholder-almet-waterloo dark:placeholder-almet-bali-hai"
  />
);

const StatChip = ({ label }) => (
  <div className="px-3 py-1 rounded-full bg-almet-mystic dark:bg-almet-comet text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai border border-gray-200 dark:border-almet-comet">
    {label}
  </div>
);

const CompetencyMatrixSystemInner = () => {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();

  const [activeView, setActiveView] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('competencyActiveView') || 'matrix';
    }
    return 'matrix';
  });
  
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('competencyViewMode') || 'cards';
    }
    return 'cards';
  });
  
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [expandedChildGroups, setExpandedChildGroups] = useState({});
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showAddChildGroup, setShowAddChildGroup] = useState(false);

  const [skillGroups, setSkillGroups] = useState([]);
  const [behavioralGroups, setBehavioralGroups] = useState([]);
  const [leadershipMainGroups, setLeadershipMainGroups] = useState([]);
  const [skillsData, setSkillsData] = useState({});
  const [behavioralData, setBehavioralData] = useState({});
  const [leadershipFullData, setLeadershipFullData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const [editKey, setEditKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  const [newGroupName, setNewGroupName] = useState('');
  const [newChildGroup, setNewChildGroup] = useState({ main_group: '', name: '' });
  const [newItem, setNewItem] = useState({ main_group: '', child_group: '', name: '' });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'default'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('competencyActiveView', activeView);
    }
  }, [activeView]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('competencyViewMode', viewMode);
    }
  }, [viewMode]);

  const bgApp = darkMode ? 'bg-gray-950' : 'bg-almet-mystic';
  const card = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const subtle = darkMode ? 'bg-almet-comet' : 'bg-gray-50';
  const border = darkMode ? 'border-almet-comet' : 'border-gray-200';
  const text = darkMode ? 'text-white' : 'text-almet-cloud-burst';
  const textDim = darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo';

  const fetchData = async () => {
    setLoading(true);
    setErr(null);
    try {
      const [sg, bg, lmg] = await Promise.all([
        competencyApi.skillGroups.getAll(),
        competencyApi.behavioralGroups.getAll(),
        competencyApi.leadershipMainGroups.getAll(),
      ]);
      
      const sgList = sg.results || [];
      const bgList = bg.results || [];
      const lmgList = lmg.results || [];
      
      setSkillGroups(sgList);
      setBehavioralGroups(bgList);
      setLeadershipMainGroups(lmgList);

      const [sgd, bgd, lmgd] = await Promise.all([
        Promise.all(sgList.map(g => competencyApi.skillGroups.getById(g.id))),
        Promise.all(bgList.map(g => competencyApi.behavioralGroups.getById(g.id))),
        Promise.all(lmgList.map(g => competencyApi.leadershipMainGroups.getById(g.id))),
      ]);

      const sMap = {};
      sgd.forEach(g => {
        sMap[g.name] = (g.skills || []).map(s => ({
          id: s.id,
          name: s.name,
          created_at: s.created_at,
          updated_at: s.updated_at
        }));
      });

      const bMap = {};
      bgd.forEach(g => {
        bMap[g.name] = (g.competencies || []).map(c => ({
          id: c.id,
          name: c.name,
          created_at: c.created_at,
          updated_at: c.updated_at
        }));
      });

      const leadershipStructure = [];
      for (const mg of lmgd) {
        const mainGroup = {
          id: mg.id,
          name: mg.name,
          childGroups: []
        };
        
        const childGroups = mg.child_groups || [];
        for (const cg of childGroups) {
          const cgDetail = await competencyApi.leadershipChildGroups.getById(cg.id);
          mainGroup.childGroups.push({
            id: cgDetail.id,
            name: cgDetail.name,
            items: (cgDetail.items || []).map(item => ({
              id: item.id,
              name: item.name,
              created_at: item.created_at,
              updated_at: item.updated_at
            }))
          });
        }
        
        leadershipStructure.push(mainGroup);
      }

      setSkillsData(sMap);
      setBehavioralData(bMap);
      setLeadershipFullData(leadershipStructure);
    } catch (e) {
      setErr(e);
      showError(e?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCurrentData = () => {
    switch (activeView) {
      case 'skills': return { data: skillsData, setData: setSkillsData, groups: skillGroups };
      case 'behavioral': return { data: behavioralData, setData: setBehavioralData, groups: behavioralGroups };
      case 'leadership': return { data: leadershipFullData, groups: leadershipMainGroups };
      default: return { data: {}, setData: () => {}, groups: [] };
    }
  };

  const { data: currentData, setData: setCurrentData, groups: currentGroups } = getCurrentData();

  const filteredData = useMemo(() => {
    if (activeView === 'leadership') {
      let filtered = leadershipFullData;
      
      if (selectedGroup) {
        filtered = filtered.filter(mg => mg.name === selectedGroup);
      }
      
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.map(mg => ({
          ...mg,
          childGroups: mg.childGroups.map(cg => ({
            ...cg,
            items: cg.items.filter(item => 
              item.name.toLowerCase().includes(q) ||
              cg.name.toLowerCase().includes(q) ||
              mg.name.toLowerCase().includes(q)
            )
          })).filter(cg => cg.items.length > 0)
        })).filter(mg => mg.childGroups.length > 0);
      }
      
      return filtered;
    }
    
    let obj = currentData;
    if (selectedGroup) obj = { [selectedGroup]: currentData[selectedGroup] || [] };
    if (!search) return obj;
    const q = search.toLowerCase();
    const next = {};
    Object.keys(obj).forEach(g => {
      const items = (obj[g] || []).filter(it => {
        const name = (it?.name || it).toLowerCase();
        return name.includes(q) || g.toLowerCase().includes(q);
      });
      if (items.length) next[g] = items;
    });
    return next;
  }, [currentData, leadershipFullData, search, selectedGroup, activeView]);

  const stats = useMemo(() => {
    if (activeView === 'leadership') {
      const totalGroups = leadershipFullData.length;
      const totalChildGroups = leadershipFullData.reduce((acc, mg) => acc + mg.childGroups.length, 0);
      const totalItems = leadershipFullData.reduce((acc, mg) => 
        acc + mg.childGroups.reduce((acc2, cg) => acc2 + cg.items.length, 0), 0
      );
      return { totalGroups, totalChildGroups, totalItems };
    }
    
    const totalGroups = Object.keys(currentData).length;
    const totalItems = Object.values(currentData).reduce((a, b) => a + b.length, 0);
    return { totalGroups, totalItems };
  }, [currentData, leadershipFullData, activeView]);

  const findGroupByName = (name) => currentGroups.find(g => g.name === name);
  
  const toggleExpand = (g) => {
    setExpandedCard(expandedCard === g ? null : g);
  };

  const toggleChildGroup = (mainGroupId, childGroupId) => {
    const key = `${mainGroupId}-${childGroupId}`;
    setExpandedChildGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const beginEditItem = (group, index, itemData = null) => {
    const name = itemData?.name || (currentData[group][index]?.name) || currentData[group][index];
    setEditKey(`${group}-${index}`);
    setEditValue(name);
  };

  const beginEditGroup = (groupId, groupName) => {
    setEditKey(`group-${groupId}`);
    setEditValue(groupName);
  };

  const beginEditChildGroup = (mainGroupId, childGroupId, childGroupName) => {
    setEditKey(`childgroup-${mainGroupId}-${childGroupId}`);
    setEditValue(childGroupName);
  };

  const beginEditLeadershipItem = (mainGroupId, childGroupId, itemId, itemName) => {
    setEditKey(`item-${mainGroupId}-${childGroupId}-${itemId}`);
    setEditValue(itemName);
  };

  const addGroup = async () => {
    if (!newGroupName.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      if (activeView === 'skills') {
        await competencyApi.skillGroups.create({ name: newGroupName.trim() });
      } else if (activeView === 'behavioral') {
        await competencyApi.behavioralGroups.create({ name: newGroupName.trim() });
      } else if (activeView === 'leadership') {
        await competencyApi.leadershipMainGroups.create({ name: newGroupName.trim() });
      }
      await fetchData();
      setShowAddGroup(false);
      setNewGroupName('');
      showSuccess('Group created successfully');
    } catch (e) {
      setErr(e);
      showError(e?.message || 'Could not add group');
    } finally {
      setBusy(false);
    }
  };

  const addChildGroup = async () => {
    if (!newChildGroup.main_group || !newChildGroup.name.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const mainGroup = leadershipMainGroups.find(g => g.id === parseInt(newChildGroup.main_group));
      if (!mainGroup) throw new Error('Main group not found');
      
      await competencyApi.leadershipChildGroups.create({
        main_group: mainGroup.id,
        name: newChildGroup.name.trim()
      });
      
      await fetchData();
      setShowAddChildGroup(false);
      setNewChildGroup({ main_group: '', name: '' });
      showSuccess('Child group created successfully');
    } catch (e) {
      setErr(e);
      showError(e?.message || 'Could not add child group');
    } finally {
      setBusy(false);
    }
  };

  const deleteGroup = async (gName, gId = null) => {
    const g = gId ? currentGroups.find(gr => gr.id === gId) : findGroupByName(gName);
    if (!g) {
      showError('Group not found');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Delete Group',
      message: `Are you sure you want to delete "${gName}" group and all its items? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        setBusy(true);
        setErr(null);
        try {
          if (activeView === 'skills') {
            await competencyApi.skillGroups.delete(g.id);
          } else if (activeView === 'behavioral') {
            await competencyApi.behavioralGroups.delete(g.id);
          } else if (activeView === 'leadership') {
            await competencyApi.leadershipMainGroups.delete(g.id);
          }
          await fetchData();
          if (expandedCard === gName || expandedCard === g.id) setExpandedCard(null);
          if (selectedGroup === gName) setSelectedGroup('');
          showSuccess('Group deleted successfully');
        } catch (e) {
          setErr(e);
          showError(e?.message || 'Could not delete group');
        } finally {
          setBusy(false);
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      }
    });
  };

  const deleteChildGroup = async (childGroupId, childGroupName) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Child Group',
      message: `Are you sure you want to delete "${childGroupName}" and all its items?`,
      type: 'danger',
      onConfirm: async () => {
        setBusy(true);
        setErr(null);
        try {
          await competencyApi.leadershipChildGroups.delete(childGroupId);
          await fetchData();
          showSuccess('Child group deleted successfully');
        } catch (e) {
          setErr(e);
          showError(e?.message || 'Could not delete child group');
        } finally {
          setBusy(false);
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      }
    });
  };

  const addItem = async () => {
    if (activeView === 'leadership') {
      if (!newItem.child_group || !newItem.name.trim()) return;
    } else {
      if (!newItem.main_group || !newItem.name.trim()) return;
    }
    
    setBusy(true);
    setErr(null);
    try {
      if (activeView === 'leadership') {
        await competencyApi.leadershipItems.create({
          child_group: parseInt(newItem.child_group),
          name: newItem.name.trim()
        });
      } else {
        const g = findGroupByName(newItem.main_group);
        if (!g) throw new Error('Group not found');
        const payload = { group: g.id, name: newItem.name.trim() };
        if (activeView === 'skills') {
          await competencyApi.skills.create(payload);
        } else if (activeView === 'behavioral') {
          await competencyApi.behavioralCompetencies.create(payload);
        }
      }
      
      await fetchData();
      setShowAddItem(false);
      setNewItem({ main_group: '', child_group: '', name: '' });
      showSuccess('Item added successfully');
    } catch (e) {
      setErr(e);
      showError(e?.message || 'Could not add item');
    } finally {
      setBusy(false);
    }
  };

  const deleteItem = async (itemId, itemName, childGroupId = null) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Item',
      message: `Are you sure you want to delete "${itemName}"?`,
      type: 'danger',
      onConfirm: async () => {
        setBusy(true);
        setErr(null);
        try {
          if (activeView === 'leadership') {
            await competencyApi.leadershipItems.delete(itemId);
          } else if (activeView === 'skills') {
            await competencyApi.skills.delete(itemId);
          } else if (activeView === 'behavioral') {
            await competencyApi.behavioralCompetencies.delete(itemId);
          }
          await fetchData();
          showSuccess('Item deleted successfully');
        } catch (e) {
          setErr(e);
          showError(e?.message || 'Could not delete item');
        } finally {
          setBusy(false);
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      }
    });
  };

  const cancelEdit = () => {
    setEditKey(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!editKey || !editValue.trim()) return;

    if (editKey.startsWith('group-')) {
      const groupId = parseInt(editKey.replace('group-', ''));
      const gObj = currentGroups.find(g => g.id === groupId);
      if (!gObj) {
        showError('Group not found');
        return;
      }

      setBusy(true);
      setErr(null);
      try {
        const payload = { name: editValue.trim() };
        if (activeView === 'skills') {
          await competencyApi.skillGroups.update(gObj.id, payload);
        } else if (activeView === 'behavioral') {
          await competencyApi.behavioralGroups.update(gObj.id, payload);
        } else if (activeView === 'leadership') {
          await competencyApi.leadershipMainGroups.update(gObj.id, payload);
        }
        await fetchData();
        cancelEdit();
        showSuccess('Group updated successfully');
      } catch (e) {
        setErr(e);
        showError(e?.message || 'Could not update group');
      } finally {
        setBusy(false);
      }
      return;
    }

    if (editKey.startsWith('childgroup-')) {
      const parts = editKey.split('-');
      const childGroupId = parseInt(parts[2]);

      setBusy(true);
      setErr(null);
      try {
        const childGroup = leadershipFullData
          .flatMap(mg => mg.childGroups)
          .find(cg => cg.id === childGroupId);
        
        if (!childGroup) throw new Error('Child group not found');

        const mainGroup = leadershipFullData.find(mg => 
          mg.childGroups.some(cg => cg.id === childGroupId)
        );

        await competencyApi.leadershipChildGroups.update(childGroupId, {
          main_group: mainGroup.id,
          name: editValue.trim()
        });
        
        await fetchData();
        cancelEdit();
        showSuccess('Child group updated successfully');
      } catch (e) {
        setErr(e);
        showError(e?.message || 'Could not update child group');
      } finally {
        setBusy(false);
      }
      return;
    }

    if (editKey.startsWith('item-')) {
      const parts = editKey.split('-');
      const itemId = parseInt(parts[3]);
      const childGroupId = parseInt(parts[2]);

      setBusy(true);
      setErr(null);
      try {
        await competencyApi.leadershipItems.update(itemId, {
          child_group: childGroupId,
          name: editValue.trim()
        });
        
        await fetchData();
        cancelEdit();
        showSuccess('Item updated successfully');
      } catch (e) {
        setErr(e);
        showError(e?.message || 'Could not update item');
      } finally {
        setBusy(false);
      }
      return;
    }

    const [group, idxStr] = editKey.split('-');
    const index = Number(idxStr);
    const item = currentData[group][index];
    const id = item?.id;

    if (!id) {
      setCurrentData(prev => ({
        ...prev,
        [group]: prev[group].map((it, i) => i === index ? editValue.trim() : it)
      }));
      cancelEdit();
      return;
    }

    setBusy(true);
    setErr(null);
    try {
      const gObj = findGroupByName(group);
      if (!gObj) throw new Error('Group not found');
      
      const payload = { group: gObj.id, name: editValue.trim() };
      if (activeView === 'skills') {
        await competencyApi.skills.update(id, payload);
      } else if (activeView === 'behavioral') {
        await competencyApi.behavioralCompetencies.update(id, payload);
      }
      
      await fetchData();
      cancelEdit();
      showSuccess('Item updated successfully');
    } catch (e) {
      setErr(e);
      showError(e?.message || 'Could not update item');
    } finally {
      setBusy(false);
    }
  };

  const LeadershipCardView = () => (
    <section className="space-y-4">
      {filteredData.length === 0 && (
        <div className={`${card} border ${border} rounded-2xl p-10 text-center`}>
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-almet-mystic flex items-center justify-center">
            <Search className="text-almet-waterloo" />
          </div>
          <p className={`${text} font-semibold`}>No results found</p>
          <p className={`${textDim} text-sm mt-1`}>Clear filters or add a new group.</p>
          <div className="mt-4 flex justify-center gap-2">
            <ActionButton
              icon={X}
              label="Clear filters"
              onClick={() => {
                setSearch('');
                setSelectedGroup('');
              }}
              variant="outline"
            />
            <ActionButton icon={Plus} label="New Group" onClick={() => setShowAddGroup(true)} />
          </div>
        </div>
      )}

      {filteredData.map(mainGroup => {
        const isMainOpen = expandedCard === mainGroup.id;
        const isEditingMain = editKey === `group-${mainGroup.id}`;

        return (
          <article key={mainGroup.id} className={`${card} border ${border} rounded-2xl shadow-sm hover:shadow-md transition`}>
            <header className={`p-4 flex items-center gap-3 border-b ${border}`}>
              <button
                onClick={() => toggleExpand(mainGroup.id)}
                className={`p-2 rounded-xl ${isMainOpen ? 'bg-almet-sapphire text-white' : 'bg-almet-mystic text-almet-cloud-burst'} transition`}
              >
                {isMainOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <Crown size={18} className="text-almet-sapphire" />
              <div className="flex-1 min-w-0">
                {isEditingMain ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      className="w-full px-2 py-1 rounded-lg border-2 text-sm font-bold bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                    />
                    <button
                      onClick={saveEdit}
                      disabled={busy}
                      className="p-1 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className={`text-sm font-bold ${text} truncate`}>{mainGroup.name}</h3>
                    <p className={`${textDim} text-xs`}>{mainGroup.childGroups.length} child groups</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!isEditingMain && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        beginEditGroup(mainGroup.id, mainGroup.name);
                      }}
                      className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteGroup(mainGroup.name, mainGroup.id);
                      }}
                      disabled={busy}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </header>

            {isMainOpen && (
              <div className="p-3 space-y-2">
                {mainGroup.childGroups.length === 0 ? (
                  <div className={`${subtle} rounded-xl p-6 text-center text-sm ${textDim}`}>
                    No child groups yet
                    <div className="mt-3">
                      <ActionButton
                        icon={Plus}
                        label="Add child group"
                        size="sm"
                        onClick={() => {
                          setShowAddChildGroup(true);
                          setNewChildGroup({ main_group: mainGroup.id.toString(), name: '' });
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  mainGroup.childGroups.map(childGroup => {
                    const isChildOpen = expandedChildGroups[`${mainGroup.id}-${childGroup.id}`];
                    const isEditingChild = editKey === `childgroup-${mainGroup.id}-${childGroup.id}`;

                    return (
                      <div key={childGroup.id} className={`${subtle} border ${border} rounded-xl overflow-hidden`}>
                        <div className="p-3 flex items-center gap-3">
                          <button
                            onClick={() => toggleChildGroup(mainGroup.id, childGroup.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                          >
                            {isChildOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                          <Building size={14} className="text-almet-sapphire" />
                          <div className="flex-1 min-w-0">
                            {isEditingChild ? (
                              <div className="flex items-center gap-2">
                                <input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  autoFocus
                                  className="w-full px-2 py-1 rounded-lg border text-xs bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                                />
                                <button
                                  onClick={saveEdit}
                                  disabled={busy}
                                  className="p-1 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                >
                                  <Save size={12} />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <p className={`text-xs font-semibold ${text}`}>{childGroup.name}</p>
                                <p className={`${textDim} text-xs`}>{childGroup.items.length} items</p>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {!isEditingChild && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    beginEditChildGroup(mainGroup.id, childGroup.id, childGroup.name);
                                  }}
                                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteChildGroup(childGroup.id, childGroup.name);
                                  }}
                                  disabled={busy}
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {isChildOpen && (
                          <div className="px-3 pb-3 space-y-1.5">
                            {childGroup.items.length === 0 ? (
                              <div className="px-4 py-3 text-center text-xs text-gray-500">
                                No items yet
                              </div>
                            ) : (
                              childGroup.items.map(item => {
                                const isEditingItem = editKey === `item-${mainGroup.id}-${childGroup.id}-${item.id}`;
                                
                                return (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-almet-cloud-burst border border-gray-100 dark:border-gray-700 hover:border-almet-sapphire transition"
                                  >
                                    {isEditingItem ? (
                                      <>
                                        <input
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          autoFocus
                                          className="flex-1 px-2 py-1 rounded-lg border text-xs bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                                        />
                                        <button
                                          onClick={saveEdit}
                                          disabled={busy}
                                          className="p-1 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                        >
                                          <Save size={12} />
                                        </button>
                                        <button
                                          onClick={cancelEdit}
                                          className="p-1 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                          <X size={12} />
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <div className="w-1.5 h-1.5 rounded-full bg-almet-sapphire" />
                                        <div className="flex-1 min-w-0">
                                          <p className={`text-xs font-medium ${text} truncate`}>{item.name}</p>
                                          {item.created_at && (
                                            <p className={`${textDim} text-xs`}>
                                              {new Date(item.created_at).toLocaleDateString()}
                                            </p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => beginEditLeadershipItem(mainGroup.id, childGroup.id, item.id, item.name)}
                                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                          >
                                            <Edit size={12} />
                                          </button>
                                          <button
                                            onClick={() => deleteItem(item.id, item.name, childGroup.id)}
                                            disabled={busy}
                                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </article>
        );
      })}
    </section>
  );

  const LeadershipTableView = () => {
    return (
      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <div className={`${card} border ${border} rounded-2xl p-10 text-center`}>
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-almet-mystic flex items-center justify-center">
              <Search className="text-almet-waterloo" />
            </div>
            <p className={`${text} font-semibold`}>No results found</p>
            <p className={`${textDim} text-sm mt-1`}>Clear filters or add a new group.</p>
          </div>
        ) : (
          filteredData.map(mainGroup => (
            <div key={mainGroup.id} className={`${card} border ${border} rounded-2xl overflow-hidden shadow-sm`}>
              <div className={`px-4 py-3 ${subtle} border-b ${border} flex items-center gap-2`}>
                <Crown size={16} className="text-almet-sapphire" />
                <h3 className={`text-sm font-bold ${text}`}>{mainGroup.name}</h3>
                <span className={`ml-auto px-2 py-1 rounded-full bg-almet-sapphire/10 text-almet-sapphire text-xs font-semibold`}>
                  {mainGroup.childGroups.reduce((acc, cg) => acc + cg.items.length, 0)} items
                </span>
                <button
                  onClick={() => beginEditGroup(mainGroup.id, mainGroup.name)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => deleteGroup(mainGroup.name, mainGroup.id)}
                  disabled={busy}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${subtle} border-b ${border}`}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-semibold ${text}`}>Child Group</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold ${text}`}>Item Name</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold ${text}`}>Created</th>
                      <th className={`px-4 py-3 text-right text-xs font-semibold ${text}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mainGroup.childGroups.map((childGroup, cgIdx) => (
                      <React.Fragment key={childGroup.id}>
                        {childGroup.items.length === 0 ? (
                          <tr>
                            <td className={`px-4 py-3 text-sm font-medium ${text} bg-gray-50 dark:bg-gray-800/50`}>
                              <div className="flex items-center gap-2">
                                <Building size={14} className="text-almet-sapphire" />
                                {childGroup.name}
                              </div>
                            </td>
                            <td colSpan={2} className={`px-4 py-3 text-sm ${textDim} italic bg-gray-50 dark:bg-gray-800/50`}>
                              No items yet
                            </td>
                            <td className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => beginEditChildGroup(mainGroup.id, childGroup.id, childGroup.name)}
                                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => deleteChildGroup(childGroup.id, childGroup.name)}
                                  disabled={busy}
                                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          childGroup.items.map((item, itemIdx) => {
                            const isEditingItem = editKey === `item-${mainGroup.id}-${childGroup.id}-${item.id}`;
                            
                            return (
                              <tr 
                                key={item.id}
                                className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                                  itemIdx === 0 ? 'border-t-2 border-gray-200 dark:border-gray-700' : ''
                                }`}
                              >
                                {itemIdx === 0 && (
                                  <td 
                                    rowSpan={childGroup.items.length}
                                    className={`px-4 py-3 text-sm font-medium ${text} bg-gray-50 dark:bg-gray-800/50 align-top`}
                                  >
                                    <div className="flex items-center justify-between gap-2 sticky top-0">
                                      <div className="flex items-center gap-2">
                                        <Building size={14} className="text-almet-sapphire" />
                                        {childGroup.name}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => beginEditChildGroup(mainGroup.id, childGroup.id, childGroup.name)}
                                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                        >
                                          <Edit size={12} />
                                        </button>
                                        <button
                                          onClick={() => deleteChildGroup(childGroup.id, childGroup.name)}
                                          disabled={busy}
                                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                )}
                                <td className={`px-4 py-3 text-sm ${text}`}>
                                  {isEditingItem ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        autoFocus
                                        className="w-full px-2 py-1 rounded-lg border text-xs bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                                      />
                                    </div>
                                  ) : (
                                    item.name
                                  )}
                                </td>
                                <td className={`px-4 py-3 text-sm ${textDim}`}>
                                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-2">
                                    {isEditingItem ? (
                                      <>
                                        <button
                                          onClick={saveEdit}
                                          disabled={busy}
                                          className="p-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                                        >
                                          <Save size={16} />
                                        </button>
                                        <button
                                          onClick={cancelEdit}
                                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                        >
                                          <X size={16} />
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => beginEditLeadershipItem(mainGroup.id, childGroup.id, item.id, item.name)}
                                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                        >
                                          <Edit size={16} />
                                        </button>
                                        <button
                                          onClick={() => deleteItem(item.id, item.name)}
                                          disabled={busy}
                                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const TableView = () => {
    const groupedData = {};
    Object.entries(filteredData).forEach(([group, items]) => {
      if (!groupedData[group]) {
        groupedData[group] = [];
      }
      items.forEach(item => {
        groupedData[group].push(typeof item === 'object' ? item : { name: item });
      });
    });

    return (
      <div className="space-y-4">
        {Object.keys(groupedData).length === 0 ? (
          <div className={`${card} border ${border} rounded-2xl p-10 text-center`}>
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-almet-mystic flex items-center justify-center">
              <Search className="text-almet-waterloo" />
            </div>
            <p className={`${text} font-semibold`}>No results found</p>
            <p className={`${textDim} text-sm mt-1`}>Clear filters or add a new item.</p>
          </div>
        ) : (
          Object.entries(groupedData).map(([group, items]) => (
            <div key={group} className={`${card} border ${border} rounded-2xl overflow-hidden shadow-sm`}>
              <div className={`px-4 py-3 ${subtle} border-b ${border} flex items-center gap-2`}>
                <Target size={16} className="text-almet-sapphire" />
                <h3 className={`text-sm font-bold ${text}`}>{group}</h3>
                <span className={`ml-auto px-2 py-1 rounded-full bg-almet-sapphire/10 text-almet-sapphire text-xs font-semibold`}>
                  {items.length} items
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${subtle} border-b ${border}`}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-semibold ${text}`}>Name</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold ${text}`}>Created</th>
                      <th className={`px-4 py-3 text-right text-xs font-semibold ${text}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center">
                          <p className={`${textDim} text-sm`}>No items yet</p>
                        </td>
                      </tr>
                    ) : (
                      items.map((item, idx) => {
                        const name = item.name || item;
                        const k = `${group}-${idx}`;
                        const editing = editKey === k;

                        return (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                            <td className="px-4 py-3">
                              {editing ? (
                                <div className="flex items-center gap-2">
                                  <TextInput
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    autoFocus
                                  />
                                  <button
                                    onClick={saveEdit}
                                    disabled={busy}
                                    className="p-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                                  >
                                    <Save size={16} />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <span className={`text-sm ${text}`}>{name}</span>
                              )}
                            </td>
                            <td className={`px-4 py-3 text-sm ${textDim}`}>
                              {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-3">
                              {!editing && (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => beginEditItem(group, idx)}
                                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const id = typeof item === 'object' ? item.id : null;
                                      if (id) deleteItem(id, name);
                                    }}
                                    disabled={busy}
                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const CardView = () => (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Object.keys(filteredData).length === 0 && (
        <div className={`${card} border ${border} rounded-2xl p-10 text-center col-span-full`}>
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-almet-mystic flex items-center justify-center">
            <Search className="text-almet-waterloo" />
          </div>
          <p className={`${text} font-semibold`}>No results found</p>
          <p className={`${textDim} text-sm mt-1`}>Clear filters or add a new item.</p>
          <div className="mt-4 flex justify-center gap-2">
            <ActionButton
              icon={X}
              label="Clear filters"
              onClick={() => {
                setSearch('');
                setSelectedGroup('');
              }}
              variant="outline"
            />
            <ActionButton icon={Plus} label="New item" onClick={() => setShowAddItem(true)} />
          </div>
        </div>
      )}

      {Object.keys(filteredData).map(group => {
        const isOpen = expandedCard === group;
        const items = filteredData[group] || [];
        const isEditingGroup = editKey === `group-${group}`;

        return (
          <article key={group} className={`${card} border ${border} rounded-2xl shadow-sm hover:shadow-md transition`}>
            <header className={`p-4 flex items-center gap-3 border-b ${border}`}>
              <button
                onClick={() => toggleExpand(group)}
                className={`p-2 rounded-xl ${isOpen ? 'bg-almet-sapphire text-white' : 'bg-almet-mystic text-almet-cloud-burst'} transition`}
              >
                {isOpen ? <X size={16} /> : <Plus size={16} />}
              </button>
              <div className="flex-1 min-w-0">
                {isEditingGroup ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      className="w-full px-2 py-1 rounded-lg border-2 text-sm font-bold bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                    />
                    <button
                      onClick={saveEdit}
                      disabled={busy}
                      className="p-1 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className={`text-sm font-bold ${text} truncate`}>{group}</h3>
                    <p className={`${textDim} text-xs`}>{items.length} items</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!isEditingGroup && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      beginEditGroup(group);
                    }}
                    className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition"
                  >
                    <Edit size={16} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGroup(group);
                  }}
                  disabled={busy}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </header>

            {isOpen ? (
              <div className="p-3 space-y-2">
                {items.length === 0 && (
                  <div className={`${subtle} rounded-xl p-6 text-center text-sm ${textDim}`}>
                    No items yet
                    <div className="mt-3">
                      <ActionButton
                        icon={Plus}
                        label="Add first item"
                        onClick={() => {
                          setShowAddItem(true);
                          setNewItem({ main_group: group, child_group: '', name: '' });
                        }}
                      />
                    </div>
                  </div>
                )}

                {items.map((it, idx) => {
                  const name = typeof it === 'string' ? it : it.name;
                  const k = `${group}-${idx}`;
                  const editing = editKey === k;
                  return (
                    <div key={k} className={`${subtle} border ${border} rounded-xl p-3 flex items-center gap-3`}>
                      {editing ? (
                        <>
                          <TextInput value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus />
                          <div className="ml-auto flex gap-2">
                            <ActionButton icon={Save} label="Save" variant="success" size="sm" onClick={saveEdit} disabled={busy} />
                            <ActionButton icon={X} label="Cancel" variant="outline" size="sm" onClick={cancelEdit} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-almet-sapphire" />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${text} truncate`}>{name}</p>
                            {typeof it === 'object' && it.created_at && (
                              <p className={`${textDim} text-xs mt-0.5`}>Added: {new Date(it.created_at).toLocaleDateString()}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-auto">
                            <button onClick={() => beginEditItem(group, idx)} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition">
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => {
                                const id = typeof it === 'object' ? it.id : null;
                                if (id) deleteItem(id, name);
                              }}
                              disabled={busy}
                              className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`p-4 text-xs ${textDim}`}>Click to expand</div>
            )}
          </article>
        );
      })}
    </section>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className={`min-h-screen ${bgApp} p-6`}>
          <div className=" mx-auto">
            <div className={`${card} border ${border} rounded-2xl p-10 shadow-md text-center`}>
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-almet-mystic border-t-almet-sapphire rounded-full animate-spin" />
              <p className={`${text} font-semibold`}>Loading data...</p>
              <p className={`${textDim} text-sm mt-1`}>Please wait.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (err && !loading) {
    return (
      <DashboardLayout>
        <div className={`min-h-screen ${bgApp} p-6`}>
          <div className="mx-auto">
            <div className={`${card} border border-red-200 rounded-2xl p-8 shadow-md`}>
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600" />
                <div>
                  <h3 className="text-red-700 font-bold">An error occurred</h3>
                  <p className="text-sm text-red-600 mt-1">{err?.message || 'Unexpected error.'}</p>
                </div>
                <div className="ml-auto">
                  <ActionButton icon={RefreshCw} label="Try again" onClick={fetchData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const mainGroupOptions = leadershipMainGroups.map(g => ({ value: g.id.toString(), label: g.name }));
  const groupOptions = activeView === 'leadership' 
    ? mainGroupOptions 
    : Object.keys(activeView === 'skills' ? skillsData : behavioralData).map(g => ({ value: g, label: g }));

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${bgApp} p-6`}>
        <div className=" mx-auto space-y-4">
          <header className={`${card} border ${border} rounded-2xl p-5 shadow-sm`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h1 className={`text-xl font-bold ${text} flex items-center gap-2`}>
                  <span className="p-2 rounded-xl bg-almet-mystic">
                    <BarChart3 className="w-5 h-5 text-almet-sapphire" />
                  </span>
                  Competency Matrix System
                </h1>
                <p className={`${textDim} text-xs`}>
                  {activeView === 'matrix' 
                    ? 'Assessment matrix and performance tracking'
                    : 'Management of skills and behavioral competencies'
                  }
                </p>
              </div>
              {activeView !== 'matrix' && (
                <div className="flex items-center gap-2">
                  <StatChip label={`${stats.totalGroups} groups`} />
                  {activeView === 'leadership' && stats.totalChildGroups > 0 && (
                    <StatChip label={`${stats.totalChildGroups} child groups`} />
                  )}
                  <StatChip label={`${stats.totalItems} items`} />
                </div>
              )}
            </div>
          </header>

          <div className={`${card} border ${border} rounded-2xl p-2 shadow-sm z-10`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveView('matrix')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${activeView === 'matrix' ? 'bg-almet-sapphire text-white shadow' : 'text-almet-waterloo hover:bg-almet-mystic hover:text-almet-cloud-burst'}`}
                >
                  <BarChart3 size={16} />
                  <span className="hidden sm:inline">Matrix</span>
                </button>
                
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                
                <button
                  onClick={() => setActiveView('skills')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${activeView === 'skills' ? 'bg-almet-sapphire text-white shadow' : 'text-almet-waterloo hover:bg-almet-mystic hover:text-almet-cloud-burst'}`}
                >
                  <Target size={16} />
                  <span className="hidden sm:inline">Skills</span>
                </button>
                
                <button
                  onClick={() => setActiveView('behavioral')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${activeView === 'behavioral' ? 'bg-almet-sapphire text-white shadow' : 'text-almet-waterloo hover:bg-almet-mystic hover:text-almet-cloud-burst'}`}
                >
                  <Users size={16} />
                  <span className="hidden sm:inline">Behavioral</span>
                </button>
                
                <button
                  onClick={() => setActiveView('leadership')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${activeView === 'leadership' ? 'bg-almet-sapphire text-white shadow' : 'text-almet-waterloo hover:bg-almet-mystic hover:text-almet-cloud-burst'}`}
                >
                  <Crown size={16} />
                  <span className="hidden sm:inline">Leadership</span>
                </button>
              </div>

              {activeView !== 'matrix' && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`p-2 rounded-lg transition ${viewMode === 'cards' ? 'bg-white dark:bg-gray-700 text-almet-sapphire shadow-sm' : 'text-gray-500'}`}
                      title="Card View"
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded-lg transition ${viewMode === 'table' ? 'bg-white dark:bg-gray-700 text-almet-sapphire shadow-sm' : 'text-gray-500'}`}
                      title="Table View"
                    >
                      <TableIcon size={16} />
                    </button>
                  </div>

                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-almet-waterloo" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search..."
                      className="pl-9 pr-3 py-2 rounded-xl border-2 text-xs bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                    />
                  </div>

                  <SearchableDropdown
                    options={[{ value: '', label: 'All groups' }, ...groupOptions]}
                    value={selectedGroup}
                    onChange={setSelectedGroup}
                    placeholder="Filter"
                    searchPlaceholder="Search groups..."
                    darkMode={darkMode}
                    icon={<ListFilter size={14} />}
                    portal={true}
                    className="min-w-[140px]"
                  />

                  <ActionButton icon={Plus} label="Item" onClick={() => setShowAddItem(true)} size="sm" />
                  <ActionButton icon={Building} label="Group" onClick={() => setShowAddGroup(true)} size="sm" variant="success" />
                </div>
              )}

              {activeView === 'matrix' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveView('skills')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-almet-waterloo hover:bg-almet-mystic hover:text-almet-cloud-burst transition"
                  >
                    <Settings size={16} />
                    <span className="hidden sm:inline">Manage Competencies</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {activeView === 'matrix' ? (
            <div className="rounded-2xl overflow-hidden">
              <AssessmentMatrix />
            </div>
          ) : activeView === 'leadership' ? (
            viewMode === 'table' ? <LeadershipTableView /> : <LeadershipCardView />
          ) : (
            viewMode === 'table' ? <TableView /> : <CardView />
          )}
        </div>

        {showAddItem && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
            <div className={`${card} border ${border} rounded-2xl w-full max-w-md shadow-2xl`}>
              <div className={`p-5 border-b ${border} flex items-center gap-2`}>
                <span className="p-2 rounded-xl bg-almet-mystic">
                  <Plus className="text-almet-sapphire" />
                </span>
                <h3 className={`text-sm font-bold ${text}`}>
                  New {activeView === 'skills' ? 'Skill' : activeView === 'behavioral' ? 'Competency' : 'Leadership Item'}
                </h3>
                <button
                  className="ml-auto p-2 rounded-xl hover:bg-almet-mystic"
                  onClick={() => {
                    setShowAddItem(false);
                    setNewItem({ main_group: '', child_group: '', name: '' });
                  }}
                >
                  <X />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {activeView === 'leadership' ? (
                  <>
                    <Field label="Main Group" required>
                      <select
                        value={newItem.main_group}
                        onChange={(e) => {
                          setNewItem(s => ({ ...s, main_group: e.target.value, child_group: '' }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                      >
                        <option value="">Select main group</option>
                        {leadershipMainGroups.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </Field>
                    {newItem.main_group && (
                      <Field label="Child Group" required>
                        <select
                          value={newItem.child_group}
                          onChange={(e) => setNewItem(s => ({ ...s, child_group: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                        >
                          <option value="">Select child group</option>
                          {leadershipFullData
                            .find(mg => mg.id === parseInt(newItem.main_group))
                            ?.childGroups.map(cg => (
                              <option key={cg.id} value={cg.id}>{cg.name}</option>
                            ))}
                        </select>
                      </Field>
                    )}
                  </>
                ) : (
                  <Field label="Group" required>
                    <SearchableDropdown
                      options={groupOptions}
                      value={newItem.main_group}
                      onChange={(value) => setNewItem(s => ({ ...s, main_group: value }))}
                      placeholder="Select a group"
                      searchPlaceholder="Search groups..."
                      darkMode={darkMode}
                      portal={true}
                    />
                  </Field>
                )}
                <Field label="Name" required>
                  <TextInput
                    value={newItem.name}
                    onChange={(e) => setNewItem(s => ({ ...s, name: e.target.value }))}
                    placeholder={activeView === 'leadership' ? 'e.g. Strategic Planning' : 'e.g. React, Teamwork'}
                  />
                </Field>
              </div>
              <div className="p-5 pt-0 flex justify-end gap-2">
                <ActionButton
                  icon={X}
                  label="Close"
                  variant="outline"
                  onClick={() => {
                    setShowAddItem(false);
                    setNewItem({ main_group: '', child_group: '', name: '' });
                  }}
                />
                <ActionButton
                  icon={Plus}
                  label="Add"
                  onClick={addItem}
                  loading={busy}
                  disabled={
                    !newItem.name.trim() || 
                    (activeView === 'leadership' ? (!newItem.main_group || !newItem.child_group) : !newItem.main_group)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {showAddGroup && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
            <div className={`${card} border ${border} rounded-2xl w-full max-w-md shadow-2xl`}>
              <div className={`p-5 border-b ${border} flex items-center gap-2`}>
                <span className="p-2 rounded-xl bg-almet-mystic">
                  <Building className="text-almet-sapphire" />
                </span>
                <h3 className={`text-sm font-bold ${text}`}>
                  New {activeView === 'leadership' ? 'Main Group' : 'Group'}
                </h3>
                <button
                  className="ml-auto p-2 rounded-xl hover:bg-almet-mystic"
                  onClick={() => {
                    setShowAddGroup(false);
                    setNewGroupName('');
                  }}
                >
                  <X />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <Field label="Group name" required>
                  <TextInput
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder={activeView === 'leadership' ? 'e.g. Strategic Leadership' : 'e.g. Frontend, Leadership'}
                  />
                </Field>
              </div>
              <div className="p-5 pt-0 flex justify-end gap-2">
                <ActionButton
                  icon={X}
                  label="Close"
                  variant="outline"
                  onClick={() => {
                    setShowAddGroup(false);
                    setNewGroupName('');
                  }}
                />
                <ActionButton
                  icon={Plus}
                  label="Create"
                  variant="success"
                  onClick={addGroup}
                  loading={busy}
                  disabled={!newGroupName.trim()}
                />
              </div>
            </div>
          </div>
        )}

        {activeView === 'leadership' && (
          <div className="fixed bottom-6 right-6 z-40">
            <ActionButton
              icon={Plus}
              label="Child Group"
              onClick={() => setShowAddChildGroup(true)}
              variant="secondary"
              size="md"
              className="shadow-lg"
            />
          </div>
        )}

        {showAddChildGroup && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
            <div className={`${card} border ${border} rounded-2xl w-full max-w-md shadow-2xl`}>
              <div className={`p-5 border-b ${border} flex items-center gap-2`}>
                <span className="p-2 rounded-xl bg-almet-mystic">
                  <Building className="text-almet-sapphire" />
                </span>
                <h3 className={`text-sm font-bold ${text}`}>New Child Group</h3>
                <button
                  className="ml-auto p-2 rounded-xl hover:bg-almet-mystic"
                  onClick={() => {
                    setShowAddChildGroup(false);
                    setNewChildGroup({ main_group: '', name: '' });
                  }}
                >
                  <X />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <Field label="Main Group" required>
                  <select
                    value={newChildGroup.main_group}
                    onChange={(e) => setNewChildGroup(s => ({ ...s, main_group: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                  >
                    <option value="">Select main group</option>
                    {leadershipMainGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Child Group name" required>
                  <TextInput
                    value={newChildGroup.name}
                    onChange={(e) => setNewChildGroup(s => ({ ...s, name: e.target.value }))}
                    placeholder="e.g. Strategic Thinking"
                  />
                </Field>
              </div>
              <div className="p-5 pt-0 flex justify-end gap-2">
                <ActionButton
                  icon={X}
                  label="Close"
                  variant="outline"
                  onClick={() => {
                    setShowAddChildGroup(false);
                    setNewChildGroup({ main_group: '', name: '' });
                  }}
                />
                <ActionButton
                  icon={Plus}
                  label="Create"
                  variant="success"
                  onClick={addChildGroup}
                  loading={busy}
                  disabled={!newChildGroup.main_group || !newChildGroup.name.trim()}
                />
              </div>
            </div>
          </div>
        )}

        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText="Delete"
          cancelText="Cancel"
          type={confirmModal.type}
          loading={busy}
          darkMode={darkMode}
        />
      </div>
    </DashboardLayout>
  );
};

const CompetencyMatrixSystem = () => {
  return (
    <ToastProvider>
      <CompetencyMatrixSystemInner />
    </ToastProvider>
  );
};

export default CompetencyMatrixSystem;