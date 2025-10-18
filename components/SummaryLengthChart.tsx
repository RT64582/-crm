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
    <div className="bg-brand-card/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-brand-border">
      <h3 className="text-xl font-semibold text-slate-100 mb-4">התפלגות אורך סיכומים (במילים)</h3>
      <div style={{ direction: 'ltr' }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <Tooltip
              cursor={{ fill: 'rgba(124, 58, 237, 0.1)' }}
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.8)', // slate-900 with opacity
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                direction: 'rtl',
                color: '#cbd5e1' // slate-300
              }}
              labelStyle={{ color: '#ffffff' }}
            />
            <Legend wrapperStyle={{ fontSize: '14px', color: '#94a3b8', paddingTop: '10px' }} />
            <Bar dataKey="מספר סיכומים" fill="url(#colorUv)" radius={[4, 4, 0, 0]} />
             <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SummaryLengthChart;