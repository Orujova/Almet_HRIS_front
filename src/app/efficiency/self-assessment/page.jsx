'use client';

import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { Save, TrendingUp, Award, Code, Database, Wrench, Users, BarChart3, History, ChevronDown, ChevronUp, PieChart, Eye, Filter } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart as RePieChart, Pie, Cell } from 'recharts';

const SelfAssessment = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('assessment');
  const [showResults, setShowResults] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Mock data - işçilərin assessmentləri
  const employeesAssessments = [
    {
      id: 1,
      name: 'Narmin Mammadova',
      position: 'Full Stack Developer',
      department: 'IT',
      date: '2024-12-15',
      overallScore: 4.2,
      categories: [
        { name: 'Programming', score: 4.5 },
        { name: 'Frameworks', score: 4.3 },
        { name: 'Databases', score: 4.0 },
        { name: 'Tools', score: 4.2 },
        { name: 'Soft Skills', score: 3.8 }
      ]
    },
    {
      id: 2,
      name: 'Elvin Hasanov',
      position: 'Backend Developer',
      department: 'IT',
      date: '2024-12-14',
      overallScore: 3.8,
      categories: [
        { name: 'Programming', score: 4.2 },
        { name: 'Frameworks', score: 3.8 },
        { name: 'Databases', score: 4.5 },
        { name: 'Tools', score: 3.5 },
        { name: 'Soft Skills', score: 3.2 }
      ]
    },
    {
      id: 3,
      name: 'Leyla Aliyeva',
      position: 'Frontend Developer',
      department: 'IT',
      date: '2024-12-13',
      overallScore: 4.0,
      categories: [
        { name: 'Programming', score: 4.3 },
        { name: 'Frameworks', score: 4.5 },
        { name: 'Databases', score: 3.2 },
        { name: 'Tools', score: 3.8 },
        { name: 'Soft Skills', score: 4.2 }
      ]
    },
    {
      id: 4,
      name: 'Farid Ismayilov',
      position: 'DevOps Engineer',
      department: 'IT',
      date: '2024-12-12',
      overallScore: 4.1,
      categories: [
        { name: 'Programming', score: 3.8 },
        { name: 'Frameworks', score: 3.5 },
        { name: 'Databases', score: 4.0 },
        { name: 'Tools', score: 4.8 },
        { name: 'Soft Skills', score: 3.7 }
      ]
    },
    {
      id: 5,
      name: 'Aysel Quliyeva',
      position: 'UI/UX Designer',
      department: 'Design',
      date: '2024-12-11',
      overallScore: 3.6,
      categories: [
        { name: 'Programming', score: 2.8 },
        { name: 'Frameworks', score: 3.2 },
        { name: 'Databases', score: 2.5 },
        { name: 'Tools', score: 4.0 },
        { name: 'Soft Skills', score: 4.5 }
      ]
    }
  ];

  const skillCategories = [
    {
      id: 'programming',
      name: 'Programming Languages',
      icon: Code,
      color: '#7D1315',
      skills: [
        { id: 'python', name: 'Python', rating: 0 },
        { id: 'javascript', name: 'JavaScript', rating: 0 },
        { id: 'typescript', name: 'TypeScript', rating: 0 },
        { id: 'java', name: 'Java', rating: 0 },
        { id: 'csharp', name: 'C#', rating: 0 },
        { id: 'php', name: 'PHP', rating: 0 },
        { id: 'go', name: 'Go', rating: 0 },
        { id: 'rust', name: 'Rust', rating: 0 }
      ]
    },
    {
      id: 'frameworks',
      name: 'Frameworks & Libraries',
      icon: Wrench,
      color: '#A91D1F',
      skills: [
        { id: 'react', name: 'React', rating: 0 },
        { id: 'nextjs', name: 'Next.js', rating: 0 },
        { id: 'django', name: 'Django', rating: 0 },
        { id: 'nodejs', name: 'Node.js', rating: 0 },
        { id: 'vue', name: 'Vue.js', rating: 0 },
        { id: 'angular', name: 'Angular', rating: 0 },
        { id: 'flask', name: 'Flask', rating: 0 },
        { id: 'fastapi', name: 'FastAPI', rating: 0 }
      ]
    },
    {
      id: 'databases',
      name: 'Databases',
      icon: Database,
      color: '#C42426',
      skills: [
        { id: 'postgresql', name: 'PostgreSQL', rating: 0 },
        { id: 'mongodb', name: 'MongoDB', rating: 0 },
        { id: 'mysql', name: 'MySQL', rating: 0 },
        { id: 'redis', name: 'Redis', rating: 0 },
        { id: 'elasticsearch', name: 'Elasticsearch', rating: 0 },
        { id: 'oracle', name: 'Oracle', rating: 0 }
      ]
    },
    {
      id: 'tools',
      name: 'Tools & Technologies',
      icon: Wrench,
      color: '#D32F2F',
      skills: [
        { id: 'git', name: 'Git', rating: 0 },
        { id: 'docker', name: 'Docker', rating: 0 },
        { id: 'aws', name: 'AWS', rating: 0 },
        { id: 'ci-cd', name: 'CI/CD', rating: 0 },
        { id: 'kubernetes', name: 'Kubernetes', rating: 0 },
        { id: 'jenkins', name: 'Jenkins', rating: 0 },
        { id: 'terraform', name: 'Terraform', rating: 0 }
      ]
    },
    {
      id: 'soft-skills',
      name: 'Soft Skills',
      icon: Users,
      color: '#E53935',
      skills: [
        { id: 'communication', name: 'Communication', rating: 0 },
        { id: 'teamwork', name: 'Teamwork', rating: 0 },
        { id: 'problem-solving', name: 'Problem Solving', rating: 0 },
        { id: 'leadership', name: 'Leadership', rating: 0 },
        { id: 'time-management', name: 'Time Management', rating: 0 },
        { id: 'critical-thinking', name: 'Critical Thinking', rating: 0 }
      ]
    }
  ];

  const [categories, setCategories] = useState(skillCategories);
  const [previousAssessments] = useState([
    { date: '2024-12-15', averageScore: 3.5 },
    { date: '2024-10-15', averageScore: 3.2 },
    { date: '2024-07-20', averageScore: 2.8 },
    { date: '2024-04-10', averageScore: 2.5 }
  ]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleRatingChange = (categoryId, skillId, rating) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          skills: cat.skills.map(skill => 
            skill.id === skillId ? { ...skill, rating } : skill
          )
        };
      }
      return cat;
    }));
  };

  const handleSubmit = () => {
    const assessmentData = {
      date: new Date().toISOString(),
      categories: categories.map(cat => ({
        category: cat.name,
        skills: cat.skills.map(skill => ({
          skill: skill.name,
          rating: skill.rating
        }))
      }))
    };
    
    console.log('Submitting assessment:', assessmentData);
    setShowResults(true);
    setActiveTab('analytics');
  };

  const calculateCategoryAverage = (category) => {
    const total = category.skills.reduce((sum, skill) => sum + skill.rating, 0);
    return (total / category.skills.length).toFixed(1);
  };

  const calculateOverallAverage = () => {
    let totalRatings = 0;
    let totalSkills = 0;
    categories.forEach(cat => {
      cat.skills.forEach(skill => {
        totalRatings += skill.rating;
        totalSkills++;
      });
    });
    return totalSkills > 0 ? (totalRatings / totalSkills).toFixed(1) : 0;
  };

  const getRadarData = () => {
    return categories.map(cat => ({
      category: cat.name.split(' ')[0],
      score: parseFloat(calculateCategoryAverage(cat)),
      fullMark: 5
    }));
  };

  const getEmployeeRadarData = (employee) => {
    return employee.categories.map(cat => ({
      category: cat.name,
      score: cat.score,
      fullMark: 5
    }));
  };

  const getProgressData = () => {
    return previousAssessments.map(assessment => ({
      date: new Date(assessment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: assessment.averageScore
    })).reverse();
  };

  const getSkillDistribution = () => {
    const distribution = { '1-2': 0, '2-3': 0, '3-4': 0, '4-5': 0, '5': 0 };
    categories.forEach(cat => {
      cat.skills.forEach(skill => {
        if (skill.rating >= 5) distribution['5']++;
        else if (skill.rating >= 4) distribution['4-5']++;
        else if (skill.rating >= 3) distribution['3-4']++;
        else if (skill.rating >= 2) distribution['2-3']++;
        else if (skill.rating >= 1) distribution['1-2']++;
      });
    });
    
    return Object.entries(distribution).map(([range, count]) => ({
      range,
      count
    }));
  };

  const getTeamComparisonData = () => {
    return employeesAssessments.map(emp => ({
      name: emp.name.split(' ')[0],
      score: emp.overallScore
    }));
  };

  const COLORS = ['#7D1315', '#A91D1F', '#C42426', '#D32F2F', '#E53935'];

  const RatingStars = ({ currentRating, onChange }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={`w-7 h-7 rounded text-xs font-medium transition-all ${
              star <= currentRating
                ? 'bg-[#7D1315] text-white'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {star}
          </button>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-3">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900">Self Assessment</h1>
                <p className="text-xs text-gray-600 mt-0.5">Evaluate your technical skills and track progress</p>
              </div>
              <Award className="w-8 h-8 text-[#7D1315]" />
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-3">
            <div className="flex border-b text-xs">
              <button
                onClick={() => setActiveTab('assessment')}
                className={`flex-1 px-3 py-2 font-medium transition-colors ${
                  activeTab === 'assessment'
                    ? 'border-b-2 border-[#7D1315] text-[#7D1315]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Code className="w-3.5 h-3.5" />
                  Assessment
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                disabled={!showResults}
                className={`flex-1 px-3 py-2 font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-b-2 border-[#7D1315] text-[#7D1315]'
                    : showResults ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5" />
                  My Results
                </div>
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`flex-1 px-3 py-2 font-medium transition-colors ${
                  activeTab === 'team'
                    ? 'border-b-2 border-[#7D1315] text-[#7D1315]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Team Results
                </div>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-3 py-2 font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'border-b-2 border-[#7D1315] text-[#7D1315]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  History
                </div>
              </button>
            </div>
          </div>

          {/* Assessment Tab */}
          {activeTab === 'assessment' && (
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isExpanded = expandedCategories[category.id];
                
                return (
                  <div key={category.id} className="bg-white rounded-lg shadow-sm">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: category.color }} />
                        <h2 className="text-sm font-bold text-gray-900">{category.name}</h2>
                        <span className="text-xs text-gray-500">({category.skills.length} skills)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-600">
                          Avg: {calculateCategoryAverage(category)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 space-y-2 border-t">
                        {category.skills.map(skill => (
                          <div key={skill.id} className="flex items-center justify-between py-1">
                            <span className="text-xs font-medium text-gray-700 w-32">{skill.name}</span>
                            <RatingStars
                              currentRating={skill.rating}
                              onChange={(rating) => handleRatingChange(category.id, skill.id, rating)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex justify-end gap-2 sticky bottom-3 pt-2">
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-5 py-2 bg-[#7D1315] text-white rounded-lg hover:bg-[#6B1113] transition-colors shadow-lg text-xs font-medium"
                >
                  <Save className="w-3.5 h-3.5" />
                  Submit Assessment
                </button>
              </div>
            </div>
          )}

          {/* My Analytics Tab */}
          {activeTab === 'analytics' && showResults && (
            <div className="space-y-3">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#7D1315]/10 mb-2">
                    <span className="text-3xl font-bold text-[#7D1315]">{calculateOverallAverage()}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Overall Score</h3>
                  <p className="text-xs text-gray-600">Out of 5.0</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white rounded-lg shadow-sm p-3">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Skills Overview</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={getRadarData()}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9 }} />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#7D1315"
                        fill="#7D1315"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-3">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Progress Over Time</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={getProgressData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#7D1315"
                        strokeWidth={2}
                        dot={{ fill: '#7D1315', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-3">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Category Breakdown</h3>
                <div className="space-y-3">
                  {categories.map(category => (
                    <div key={category.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">{category.name}</span>
                        <span className="text-xs font-bold text-[#7D1315]">
                          {calculateCategoryAverage(category)} / 5.0
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${(parseFloat(calculateCategoryAverage(category)) / 5) * 100}%`,
                            backgroundColor: category.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Team Results Tab */}
          {activeTab === 'team' && (
            <div className="space-y-3">
              {!selectedEmployee ? (
                <>
                  {/* Team Overview */}
                  <div className="bg-white rounded-lg shadow-sm p-3">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Team Comparison</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={getTeamComparisonData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="score" fill="#7D1315" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Employees List */}
                  <div className="bg-white rounded-lg shadow-sm p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-900">Team Members ({employeesAssessments.length})</h3>
                      <button className="text-xs text-[#7D1315] flex items-center gap-1">
                        <Filter className="w-3.5 h-3.5" />
                        Filter
                      </button>
                    </div>
                    <div className="space-y-2">
                      {employeesAssessments.map((employee) => (
                        <div
                          key={employee.id}
                          className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 flex-1">
                            <div className="w-10 h-10 rounded-full bg-[#7D1315]/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-[#7D1315]">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-900">{employee.name}</p>
                              <p className="text-xs text-gray-600">{employee.position}</p>
                            </div>
                            <div className="text-right mr-3">
                              <p className="text-sm font-bold text-[#7D1315]">{employee.overallScore}</p>
                              <p className="text-xs text-gray-500">Score</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedEmployee(employee)}
                            className="flex items-center gap-1 text-xs text-[#7D1315] hover:underline font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Employee Detail View */}
                  <div className="bg-white rounded-lg shadow-sm p-3">
                    <button
                      onClick={() => setSelectedEmployee(null)}
                      className="text-xs text-[#7D1315] hover:underline mb-3"
                    >
                      ← Back to Team
                    </button>
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                      <div className="w-12 h-12 rounded-full bg-[#7D1315]/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-[#7D1315]">
                          {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{selectedEmployee.name}</h3>
                        <p className="text-xs text-gray-600">{selectedEmployee.position} • {selectedEmployee.department}</p>
                        <p className="text-xs text-gray-500">Assessed: {new Date(selectedEmployee.date).toLocaleDateString()}</p>
                      </div>
                      <div className="ml-auto text-center">
                        <div className="w-16 h-16 rounded-full bg-[#7D1315]/10 flex items-center justify-center mb-1">
                          <span className="text-2xl font-bold text-[#7D1315]">{selectedEmployee.overallScore}</span>
                        </div>
                        <p className="text-xs text-gray-600">Overall</p>
                      </div>
                    </div>

                    {/* Employee Radar Chart */}
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={getEmployeeRadarData(selectedEmployee)}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9 }} />
                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke="#7D1315"
                          fill="#7D1315"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>

                    {/* Category Details */}
                    <div className="mt-4 space-y-2">
                      <h4 className="text-xs font-bold text-gray-900">Category Scores</h4>
                      {selectedEmployee.categories.map((cat, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                            <span className="text-xs font-bold text-[#7D1315]">{cat.score} / 5.0</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-[#7D1315]"
                              style={{ width: `${(cat.score / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-lg shadow-sm p-3">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Assessment History</h3>
              <div className="space-y-2">
                {previousAssessments.map((assessment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#7D1315]/10 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-[#7D1315]" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">
                          {new Date(assessment.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-600">Average Score: {assessment.averageScore}</p>
                      </div>
                    </div>
                    <button className="text-xs text-[#7D1315] hover:underline font-medium">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SelfAssessment;