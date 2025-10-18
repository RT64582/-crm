import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  type?: 'gauge';
  gaugeValue?: number | null; // Value on a 1-5 scale
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, type, gaugeValue }) => {
  const isGauge = type === 'gauge' && gaugeValue !== null && gaugeValue !== undefined;

  // Calculate percentage for the gauge bar (scale 1-5)
  const score = gaugeValue ?? 0;
  const percentage = score >= 1 ? ((score - 1) / 4) * 100 : 0;
  
  const getGaugeColor = (s: number) => {
    if (s === 0) return 'bg-slate-500'; // For 'N/A' case
    if (s < 2.5) return 'from-red-500 to-orange-500';
    if (s < 4) return 'from-yellow-500 to-lime-500';
    return 'from-green-500 to-emerald-500';
  };

  return (
    <div className="bg-brand-card/70 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-brand-border flex flex-col justify-between gap-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-white/20">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full p-3 shadow-lg shadow-indigo-500/20 -mt-2 -mr-1 flex-shrink-0">
            {icon}
        </div>
      </div>
      <div>
        <p className="mt-1 text-3xl font-bold text-slate-100">{value}</p>
        {isGauge && (
          <div className="w-full bg-slate-700 rounded-full h-2 mt-2" title={`Score: ${score > 0 ? score.toFixed(2) : 'N/A'} / 5`}>
             <div 
                className={`h-2 rounded-full transition-all duration-500 bg-gradient-to-r ${getGaugeColor(score)}`}
                style={{ width: `${percentage}%` }}
             ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;