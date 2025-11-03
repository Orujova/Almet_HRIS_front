import React from 'react';
import { 

  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,  ResponsiveContainer,
   Cell
} from 'recharts';
import { TrendingUp, Target, Activity } from 'lucide-react';
import ChartContainer from './ChartContainer';



const BehavioralAssessmentCharts = ({ assessment }) => {
  // Group Performance Data
  const groupPerformance = assessment.group_scores
    ? Object.entries(assessment.group_scores).map(([name, scores]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        position: scores.position_total,
        employee: scores.employee_total,
        percentage: scores.percentage,
        grade: scores.letter_grade
      }))
    : [];

  // Individual Competencies with Gap
  const competencyGaps = assessment.competency_ratings
    ? assessment.competency_ratings.slice(0, 10).map(rating => ({
        name: rating.competency_name?.substring(0, 20) || 'Unknown',
        gap: rating.actual_level - rating.required_level,
        required: rating.required_level,
        actual: rating.actual_level
      }))
    : [];

  return (
    <div className="space-y-4">
     

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Horizontal Bar - Group Comparison */}
        <ChartContainer title="Competency Group Performance" icon={Target}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={groupPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value, name) => [`${value}${name === 'percentage' ? '%' : ''}`, name === 'percentage' ? 'Score' : name]}
              />
              <Bar dataKey="percentage" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Competency Gap Analysis */}
        <ChartContainer title="Top 10 Competency Gaps" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={competencyGaps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 9 }} angle={-30} textAnchor="end" height={80} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="gap" radius={[4, 4, 0, 0]}>
                {competencyGaps.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.gap >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default BehavioralAssessmentCharts