import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-slate-200 flex items-center gap-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
       <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full p-3 shadow-lg">
          {icon}
       </div>
       <div>
         <h3 className="text-sm font-medium text-slate-500">{title}</h3>
         <p className="mt-1 text-3xl font-bold text-slate-800">{value}</p>
       </div>
    </div>
  );
};

export default KPICard;
