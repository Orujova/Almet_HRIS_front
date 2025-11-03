import React from 'react';
import { 

  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import {  Award, Target, Activity } from 'lucide-react';
import ChartContainer from './ChartContainer';
 const LeadershipAssessmentCharts = ({ assessment }) => {
  // Main Group Performance
  const mainGroupData = assessment.main_group_scores_display
    ? Object.entries(assessment.main_group_scores_display).map(([name, scores]) => ({
        name: name.length > 12 ? name.substring(0, 12) + '...' : name,
        position: scores.position_total,
        employee: scores.employee_total,
        percentage: scores.percentage,
        grade: scores.letter_grade
      }))
    : [];

  // Child Group Performance
  const childGroupData = assessment.child_group_scores_display
    ? Object.entries(assessment.child_group_scores_display).map(([name, scores]) => ({
        name: name.length > 10 ? name.substring(0, 10) + '...' : name,
        percentage: scores.percentage,
        grade: scores.letter_grade
      }))
    : [];

  // Grade Colors
  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A': return '#10b981';
      case 'B': return '#3b82f6';
      case 'C': return '#f59e0b';
      case 'D': return '#f97316';
      case 'E': return '#a855f7';
      case 'F': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="space-y-4">
      

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stacked Bar - Main Groups */}
        <ChartContainer title="Main Group Performance" icon={Target}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mainGroupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="position" fill="#3b82f6" name="Required" radius={[4, 4, 0, 0]} />
              <Bar dataKey="employee" fill="#10b981" name="Actual" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Scatter - Child Groups */}
        <ChartContainer title="Child Group Grades" icon={Activity}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={childGroupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value, name, props) => [`${value}% (${props.payload.grade})`, 'Score']}
              />
              <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                {childGroupData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getGradeColor(entry.grade)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default LeadershipAssessmentCharts