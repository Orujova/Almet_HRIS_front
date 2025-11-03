import React from 'react';
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,

} from 'recharts';
import { TrendingUp, TrendingDown, Award, Target, Activity } from 'lucide-react';
import ChartContainer from './ChartContainer';

const CoreAssessmentCharts = ({ assessment }) => {
  // Prepare data for Radar Chart - Skill Groups
  const radarData = assessment.group_scores 
    ? Object.entries(assessment.group_scores).map(([group, scores]) => ({
        group: group.length > 15 ? group.substring(0, 15) + '...' : group,
        actual: scores.employee_total,
        required: scores.position_total,
        completion: scores.completion_percentage
      }))
    : [];

  // Prepare data for Bar Chart - Gap Analysis
  const gapData = assessment.group_scores
    ? Object.entries(assessment.group_scores).map(([group, scores]) => ({
        name: group.length > 12 ? group.substring(0, 12) + '...' : group,
        gap: scores.gap,
        positive: scores.gap > 0 ? scores.gap : 0,
        negative: scores.gap < 0 ? Math.abs(scores.gap) : 0
      }))
    : [];

  // Calculate statistics with proper type conversion
  const totalGap = Number(assessment.gap_score) || 0;
  const avgCompletion = Number(assessment.completion_percentage) || 0;
  const totalSkills = assessment.competency_ratings?.length || 0;

  return (
    <div className="space-y-4">
      

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar Chart - Skill Groups Performance */}
        <ChartContainer title="Skill Groups Performance" icon={Activity}>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="group" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Radar name="Required" dataKey="required" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="Actual" dataKey="actual" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value) => [value, '']}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Bar Chart - Gap Analysis */}
        <ChartContainer title="Skill Gap Analysis" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gapData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value) => [value, 'Gap']}
              />
              <Bar dataKey="positive" stackId="gap" fill="#10b981" name="Positive Gap" radius={[0, 4, 4, 0]} />
              <Bar dataKey="negative" stackId="gap" fill="#ef4444" name="Negative Gap" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default CoreAssessmentCharts