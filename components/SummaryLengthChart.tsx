import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AnalysisResult } from '../types';

interface SummaryLengthChartProps {
  data: AnalysisResult[];
}

const SummaryLengthChart: React.FC<SummaryLengthChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    // Filter for completed analyses with a summary and count the words
    const wordCounts = data
      .filter(r => r.Summary && r.Summary.trim() !== '')
      .map(r => r.Summary!.split(/\s+/).filter(Boolean).length);

    // If no summaries are available, return null
    if (wordCounts.length === 0) {
      return null;
    }

    // Define bins for word count ranges
    const bins = {
      '0-20 מילים': 0,
      '21-40 מילים': 0,
      '41-60 מילים': 0,
      '61+ מילים': 0,
    };

    // Categorize each summary's word count into the bins
    wordCounts.forEach(count => {
      if (count <= 20) bins['0-20 מילים']++;
      else if (count <= 40) bins['21-40 מילים']++;
      else if (count <= 60) bins['41-60 מילים']++;
      else bins['61+ מילים']++;
    });

    // Format the data for recharts
    return Object.entries(bins).map(([name, count]) => ({
      name,
      'מספר סיכומים': count,
    }));
  }, [data]);

  // Don't render the component if there's no data
  if (!chartData) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <h3 className="text-xl font-semibold text-slate-700 mb-4">התפלגות אורך סיכומים (במילים)</h3>
      <div style={{ direction: 'ltr' }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475569' }} />
            <Tooltip
              cursor={{ fill: 'rgba(71, 85, 105, 0.1)' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                direction: 'rtl',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '14px', color: '#475569', paddingTop: '10px' }} />
            <Bar dataKey="מספר סיכומים" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SummaryLengthChart;
