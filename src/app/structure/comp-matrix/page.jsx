'use client';
import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Save, X, Search, Target, BarChart3,
  RefreshCw, AlertCircle,  Building, Users, ListFilter
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';
import { competencyApi } from '@/services/competencyApi';
import AssessmentMatrix from './AssessmentMatrix';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import { ToastProvider, useToast } from '@/components/common/Toast';

/*************************************
 * Compact primitives
 *************************************/
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
      {loading ? <RefreshCw size={16} className="animate-spin"/> : <Icon size={16}/>}<span className="hidden sm:inline">{label}</span>
    </button>
  );
};

const Field = ({ label, children, required }) => {
  return (
    <label className="block space-y-2">
      {label && (
        <span className="text-xs font-semibold text-almet-cloud-burst dark:text-white">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      )}
      {children}
    </label>
  );
};

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

/*************************************
 * Main Component (with Toast wrapper)
 *************************************/
const CompetencyMatrixSystemInner = () => {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();

  // ui state - TAB STATE-Nİ STORAGE-DƏ SAXLA
  const [activeView, setActiveView] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('competencyActiveView') || 'skills';
    }
    return 'skills';
  });
  
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);

  // data state
  const [skillGroups, setSkillGroups] = useState([]);
  const [behavioralGroups, setBehavioralGroups] = useState([]);
  const [skillsData, setSkillsData] = useState({});
  const [behavioralData, setBehavioralData] = useState({});

  // op state
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  // inline edit state
  const [editKey, setEditKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  // add forms
  const [newGroupName, setNewGroupName] = useState('');
  const [newItem, setNewItem] = useState({ group: '', name: '' });

  // confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'default'
  });

  // TAB DEYİŞƏNDƏ STORAGE-Ə YARAT
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('competencyActiveView', activeView);
    }
  }, [activeView]);

  const bgApp = darkMode ? 'bg-gray-950' : 'bg-almet-mystic';
  const card = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const subtle = darkMode ? 'bg-almet-comet' : 'bg-gray-50';
  const border = darkMode ? 'border-almet-comet' : 'border-gray-200';
  const text = darkMode ? 'text-white' : 'text-almet-cloud-burst';
  const textDim = darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo';

  const fetchData = async () => {
    setLoading(true); setErr(null);
    try {
      const [sg, bg] = await Promise.all([
        competencyApi.skillGroups.getAll(),
        competencyApi.behavioralGroups.getAll(),
      ]);
      const sgList = sg.results || []; const bgList = bg.results || [];
      setSkillGroups(sgList); setBehavioralGroups(bgList);

      const [sgd, bgd] = await Promise.all([
        Promise.all(sgList.map(g => competencyApi.skillGroups.getById(g.id))),
        Promise.all(bgList.map(g => competencyApi.behavioralGroups.getById(g.id))),
      ]);

      const sMap = {}; sgd.forEach(g => { sMap[g.name] = (g.skills || []).map(s => ({ id: s.id, name: s.name, created_at: s.created_at, updated_at: s.updated_at })); });
      const bMap = {}; bgd.forEach(g => { bMap[g.name] = (g.competencies || []).map(c => ({ id: c.id, name: c.name, created_at: c.created_at, updated_at: c.updated_at })); });

      setSkillsData(sMap); setBehavioralData(bMap);
    } catch (e) {
      setErr(e);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const currentData = activeView === 'skills' ? skillsData : behavioralData;
  const setCurrentData = activeView === 'skills' ? setSkillsData : setBehavioralData;
  const groupsArr = Object.keys(currentData);

  const filtered = useMemo(() => {
    let obj = currentData;
    if (selectedGroup) obj = { [selectedGroup]: currentData[selectedGroup] || [] };
    if (!search) return obj;
    const q = search.toLowerCase();
    const next = {};
    Object.keys(obj).forEach(g => {
      const items = (obj[g] || []).filter(it => (it?.name || it).toLowerCase().includes(q) || g.toLowerCase().includes(q));
      if (items.length) next[g] = items;
    });
    return next;
  }, [currentData, search, selectedGroup]);

  const stats = useMemo(() => {
    const totalGroups = Object.keys(currentData).length;
    const totalItems = Object.values(currentData).reduce((a, b) => a + b.length, 0);
    return { totalGroups, totalItems };
  }, [currentData]);

  // helpers
  const findGroupByName = (name) => (activeView === 'skills' ? skillGroups : behavioralGroups).find(g => g.name === name);
  const toggleExpand = (g) => {
    setExpandedCard(expandedCard === g ? null : g);
  };

  // CRUD operations
  const beginEditItem = (group, index) => { 
    const name = (currentData[group][index]?.name) ?? currentData[group][index]; 
    setEditKey(`${group}-${index}`); 
    setEditValue(name); 
  };

  const beginEditGroup = (group) => {
    setEditKey(`group-${group}`);
    setEditValue(group);
  };

  const addGroup = async () => {
    if (!newGroupName.trim()) return;
    setBusy(true); setErr(null);
    try {
      if (activeView === 'skills') await competencyApi.skillGroups.create({ name: newGroupName.trim() });
      else await competencyApi.behavioralGroups.create({ name: newGroupName.trim() });
      await fetchData();
      setShowAddGroup(false); setNewGroupName('');
      showSuccess('Group created successfully');
    } catch (e) { 
      setErr(e); 
      showError(e?.message || 'Could not add group');
    } finally { setBusy(false); }
  };

  const deleteGroup = async (gName) => {
    const g = findGroupByName(gName);
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
        setBusy(true); setErr(null);
        try {
          if (activeView === 'skills') await competencyApi.skillGroups.delete(g.id); 
          else await competencyApi.behavioralGroups.delete(g.id);
          await fetchData(); 
          if (expandedCard === gName) setExpandedCard(null);
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

  const addItem = async () => {
    if (!newItem.group || !newItem.name.trim()) return;
    setBusy(true); setErr(null);
    try {
      const g = findGroupByName(newItem.group); 
      if (!g) throw new Error('Group not found');
      const payload = { group: g.id, name: newItem.name.trim() };
      if (activeView === 'skills') await competencyApi.skills.create(payload); 
      else await competencyApi.behavioralCompetencies.create(payload);
      await fetchData(); 
      setShowAddItem(false); 
      setNewItem({ group: '', name: '' });
      showSuccess('Item added successfully');
    } catch (e) { 
      setErr(e); 
      showError(e?.message || 'Could not add item');
    } finally { setBusy(false); }
  };

  const deleteItem = async (group, index) => {
    const item = currentData[group][index];
    const id = typeof item === 'object' ? item.id : null;
    
    if (!id) {
      setCurrentData(prev => ({ ...prev, [group]: prev[group].filter((_, i) => i !== index) }));
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Delete Item',
      message: `Are you sure you want to delete "${item.name}"?`,
      type: 'danger',
      onConfirm: async () => {
        setBusy(true); setErr(null);
        try {
          if (activeView === 'skills') await competencyApi.skills.delete(id); 
          else await competencyApi.behavioralCompetencies.delete(id);
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

  const cancelEdit = () => { setEditKey(null); setEditValue(''); };
  
  const saveEdit = async () => {
    if (!editKey || !editValue.trim()) return;
    
    if (editKey.startsWith('group-')) {
      const groupName = editKey.replace('group-', '');
      const gObj = findGroupByName(groupName);
      if (!gObj) {
        showError('Group not found');
        return;
      }
      
      setBusy(true); setErr(null);
      try {
        const payload = { name: editValue.trim() };
        if (activeView === 'skills') {
          await competencyApi.skillGroups.update(gObj.id, payload);
        } else {
          await competencyApi.behavioralGroups.update(gObj.id, payload);
        }
        await fetchData();
        cancelEdit();
        showSuccess('Group updated successfully');
      } catch (e) { 
        setErr(e); 
        showError(e?.message || 'Could not update group');
      } finally { setBusy(false); }
      return;
    }

    const [group, idxStr] = editKey.split('-'); 
    const index = Number(idxStr);
    const item = currentData[group][index]; 
    const id = item?.id;
    
    if (!id) {
      setCurrentData(prev => ({ ...prev, [group]: prev[group].map((it, i) => i === index ? editValue.trim() : it) }));
      cancelEdit(); 
      return;
    }
    
    setBusy(true); setErr(null);
    try {
      const gObj = findGroupByName(group); 
      if (!gObj) throw new Error('Group not found');
      const payload = { group: gObj.id, name: editValue.trim() };
      if (activeView === 'skills') await competencyApi.skills.update(id, payload); 
      else await competencyApi.behavioralCompetencies.update(id, payload);
      await fetchData(); 
      cancelEdit(); 
      showSuccess('Item updated successfully');
    } catch (e) { 
      setErr(e); 
      showError(e?.message || 'Could not update item');
    } finally { setBusy(false); }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className={`min-h-screen ${bgApp} p-6`}>
          <div className="max-w-7xl mx-auto">
            <div className={`${card} border ${border} rounded-2xl p-10 shadow-md text-center`}>
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-almet-mystic border-t-almet-sapphire rounded-full animate-spin"/>
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
          <div className="max-w-7xl mx-auto">
            <div className={`${card} border border-red-200 rounded-2xl p-8 shadow-md`}>
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600"/>
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

  // Group dropdown options
  const groupOptions = groupsArr.map(g => ({ value: g, label: g }));

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${bgApp} p-6`}>
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header */}
          <header className={`${card} border ${border} rounded-2xl p-5 shadow-sm`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h1 className={`text-xl font-bold ${text} flex items-center gap-2`}>
                  <span className="p-2 rounded-xl bg-almet-mystic">
                    <Target className="w-5 h-5 text-almet-sapphire"/>
                  </span>
                  Competency Matrix
                </h1>
                <p className={`${textDim} text-xs`}>Management of skills and behavioral competencies</p>
              </div>
              {activeView !== 'matrix' && (
                <div className="flex items-center gap-2">
                  <StatChip label={`${stats.totalGroups} groups`}/>
                  <StatChip label={`${stats.totalItems} items`}/>
                </div>
              )}
            </div>
          </header>

          {/* Tabs + Toolbar */}
          <div className={`${card} border ${border} rounded-2xl p-2 shadow-sm z-10`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
              <div className="flex items-center gap-1">
                {[
                  { id: 'skills', name: 'Skills', icon: Target },
                  { id: 'behavioral', name: 'Behavioral', icon: Users },
                  { id: 'matrix', name: 'Assessment Matrix', icon: BarChart3 },
                ].map(t => (
                  <button key={t.id} onClick={() => setActiveView(t.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${activeView===t.id ? 'bg-almet-sapphire text-white shadow' : 'text-almet-waterloo hover:bg-almet-mystic hover:text-almet-cloud-burst'}`}>
                    <t.icon size={16}/><span className="hidden sm:inline">{t.name}</span>
                  </button>
                ))}
              </div>

              {activeView !== 'matrix' && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-almet-waterloo"/>
                    <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-3 py-2 rounded-xl border-2 text-xs bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"/>
                  </div>
                  
                  <SearchableDropdown
                    options={[{ value: '', label: 'All groups' }, ...groupOptions]}
                    value={selectedGroup}
                    onChange={setSelectedGroup}
                    placeholder="Filter by group"
                    searchPlaceholder="Search groups..."
                    darkMode={darkMode}
                    icon={<ListFilter size={14} />}
                    portal={true}
                    className="min-w-[160px]"
                  />
                  
                  <ActionButton icon={Plus} label="Item" onClick={()=>setShowAddItem(true)} size="sm"/>
                  <ActionButton icon={Building} label="Group" onClick={()=>setShowAddGroup(true)} size="sm" variant="success"/>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {activeView === 'matrix' ? (
            <div className="rounded-2xl overflow-hidden">
              <AssessmentMatrix />
            </div>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Object.keys(filtered).length === 0 && (
                <div className={`${card} border ${border} rounded-2xl p-10 text-center col-span-full`}>
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-almet-mystic flex items-center justify-center">
                    <Search className="text-almet-waterloo"/>
                  </div>
                  <p className={`${text} font-semibold`}>No results found</p>
                  <p className={`${textDim} text-sm mt-1`}>Clear filters or add a new item.</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <ActionButton icon={X} label="Clear filters" onClick={()=>{ setSearch(''); setSelectedGroup(''); }} variant="outline"/>
                    <ActionButton icon={Plus} label="New item" onClick={()=>setShowAddItem(true)}/>
                  </div>
                </div>
              )}

              {Object.keys(filtered).map(group => {
                const isOpen = expandedCard === group;
                const items = filtered[group] || [];
                const isEditingGroup = editKey === `group-${group}`;
                
                return (
                  <article key={group} className={`${card} border ${border} rounded-2xl shadow-sm hover:shadow-md transition`}> 
                    <header className={`p-4 flex items-center gap-3 border-b ${border}`}>
                      <button onClick={()=>toggleExpand(group)} className={`p-2 rounded-xl ${isOpen ? 'bg-almet-sapphire text-white' : 'bg-almet-mystic text-almet-cloud-burst'} transition`}>
                        {isOpen ? <X size={16}/> : <Plus size={16}/>}
                      </button>
                      <div className="flex-1 min-w-0">
                        {isEditingGroup ? (
                          <div className="flex items-center gap-2">
                            <input
                              value={editValue} 
                              onChange={(e)=>setEditValue(e.target.value)} 
                              autoFocus 
                              className="w-full px-2 py-1 rounded-lg border-2 text-sm font-bold bg-white dark:bg-almet-cloud-burst text-almet-cloud-burst dark:text-white border-gray-200 dark:border-almet-comet focus:outline-none focus:border-almet-sapphire"
                            />
                            <button onClick={saveEdit} disabled={busy} className="p-1 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition">
                              <Save size={14}/>
                            </button>
                            <button onClick={cancelEdit} className="p-1 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                              <X size={14}/>
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
                          <button onClick={(e) => {
                            e.stopPropagation();
                            beginEditGroup(group);
                          }} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition">
                            <Edit size={16}/>
                          </button>
                        )}
                        <button onClick={(e) => {
                          e.stopPropagation();
                          deleteGroup(group);
                        }} disabled={busy} className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </header>

                    {isOpen ? (
                      <div className="p-3 space-y-2">
                        {items.length === 0 && (
                          <div className={`${subtle} rounded-xl p-6 text-center text-sm ${textDim}`}>
                            No items yet
                            <div className="mt-3"><ActionButton icon={Plus} label="Add first item" onClick={()=>{ setShowAddItem(true); setNewItem({ group, name: '' }); }}/></div>
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
                                  <TextInput value={editValue} onChange={(e)=>setEditValue(e.target.value)} autoFocus />
                                  <div className="ml-auto flex gap-2">
                                    <ActionButton icon={Save} label="Save" variant="success" size="sm" onClick={saveEdit} disabled={busy} />
                                    <ActionButton icon={X} label="Cancel" variant="outline" size="sm" onClick={cancelEdit} />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="w-2 h-2 rounded-full bg-almet-sapphire"/>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${text} truncate`}>{name}</p>
                                    {typeof it === 'object' && it.created_at && (
                                      <p className={`${textDim} text-xs mt-0.5`}>Added: {new Date(it.created_at).toLocaleDateString()}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 ml-auto">
                                    <button onClick={()=>beginEditItem(group, idx)} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition">
                                      <Edit size={14}/>
                                    </button>
                                    <button onClick={()=>deleteItem(group, idx)} disabled={busy} className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                                      <Trash2 size={14}/>
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
          )}
        </div>

        {/* Add Item Modal */}
        {showAddItem && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
            <div className={`${card} border ${border} rounded-2xl w-full max-w-md shadow-2xl`}>
              <div className={`p-5 border-b ${border} flex items-center gap-2`}>
                <span className="p-2 rounded-xl bg-almet-mystic"><Plus className="text-almet-sapphire"/></span>
                <h3 className={`text-sm font-bold ${text}`}>New {activeView==='skills' ? 'Skill' : 'Competency'}</h3>
                <button className="ml-auto p-2 rounded-xl hover:bg-almet-mystic" onClick={()=>{ setShowAddItem(false); setNewItem({ group: '', name: '' }); }}><X/></button>
              </div>
              <div className="p-5 space-y-4">
                <Field label="Group" required>
                  <SearchableDropdown
                    options={groupOptions}
                    value={newItem.group}
                    onChange={(value) => setNewItem(s => ({ ...s, group: value }))}
                    placeholder="Select a group"
                    searchPlaceholder="Search groups..."
                    darkMode={darkMode}
                    portal={true}
                  />
                </Field>
                <Field label="Name" required>
                  <TextInput value={newItem.name} onChange={(e)=>setNewItem(s=>({ ...s, name: e.target.value }))} placeholder="e.g. React, Teamwork" />
                </Field>
              </div>
              <div className="p-5 pt-0 flex justify-end gap-2">
                <ActionButton icon={X} label="Close" variant="outline" onClick={()=>{ setShowAddItem(false); setNewItem({ group: '', name: '' }); }}/>
                <ActionButton icon={Plus} label="Add" onClick={addItem} loading={busy} disabled={!newItem.group || !newItem.name.trim()} />
              </div>
            </div>
          </div>
        )}

        {/* Add Group Modal */}
        {showAddGroup && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
            <div className={`${card} border ${border} rounded-2xl w-full max-w-md shadow-2xl`}>
              <div className={`p-5 border-b ${border} flex items-center gap-2`}>
                <span className="p-2 rounded-xl bg-almet-mystic"><Building className="text-almet-sapphire"/></span>
                <h3 className={`text-sm font-bold ${text}`}>New Group</h3>
                <button className="ml-auto p-2 rounded-xl hover:bg-almet-mystic" onClick={()=>{ setShowAddGroup(false); setNewGroupName(''); }}><X/></button>
              </div>
              <div className="p-5 space-y-4">
                <Field label="Group name" required>
                  <TextInput value={newGroupName} onChange={(e)=>setNewGroupName(e.target.value)} placeholder="e.g. Frontend, Leadership" />
                </Field>
              </div>
              <div className="p-5 pt-0 flex justify-end gap-2">
                <ActionButton icon={X} label="Close" variant="outline" onClick={()=>{ setShowAddGroup(false); setNewGroupName(''); }} />
                <ActionButton icon={Plus} label="Create Group" variant="success" onClick={addGroup} loading={busy} disabled={!newGroupName.trim()} />
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
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

// Wrap with ToastProvider
const CompetencyMatrixSystem = () => {
  return (
    <ToastProvider>
      <CompetencyMatrixSystemInner />
    </ToastProvider>
  );
};

export default CompetencyMatrixSystem;