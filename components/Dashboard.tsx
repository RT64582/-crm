import React, { useState, useMemo } from 'react';
import { AnalysisResult } from '../types';
import KPICard from './KPICard';
import CallDetailModal from './CallDetailModal';
import ConfirmationModal from './ConfirmationModal';
import SummaryLengthChart from './SummaryLengthChart';

interface DashboardProps {
  results: AnalysisResult[];
  onClearHistory: () => void;
}

const ChartBarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>);
const AlertTriangleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>);
const ListCheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);


const Dashboard: React.FC<DashboardProps> = ({ results, onClearHistory }) => {
  const [selectedCall, setSelectedCall] = useState<AnalysisResult | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Completed' | 'Error'>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [isClearConfirmVisible, setIsClearConfirmVisible] = useState(false);

  const unfilteredSuccessfulAnalyses = useMemo(() => results.filter(r => r.AnalysisStatus === 'Completed'), [results]);

  const kpiData = useMemo(() => {
    const totalCalls = unfilteredSuccessfulAnalyses.length;
    if (totalCalls === 0) {
      return {
        avgEmotionScore: 'N/A',
        criticalActions: 0,
        totalActions: 0,
      };
    }

    const totalEmotionScore = unfilteredSuccessfulAnalyses.reduce((sum, r) => sum + (r.EmotionScore?.Score || 0), 0);
    const avgEmotionScore = (totalEmotionScore / totalCalls).toFixed(1);

    const criticalActions = unfilteredSuccessfulAnalyses.reduce((count, r) =>
      count + (r.ActionItems?.filter(item => item.Urgency === 'קריטי').length || 0),
    0);
    
    const totalActions = unfilteredSuccessfulAnalyses.reduce((count, r) => count + (r.ActionItems?.length || 0), 0);

    return {
      avgEmotionScore,
      criticalActions,
      totalActions
    };
  }, [unfilteredSuccessfulAnalyses]);

  const filteredResults = useMemo(() => {
      return results
        .filter(result => {
          if (statusFilter === 'all') return true;
          return result.AnalysisStatus === statusFilter;
        })
        .filter(result => {
          const resultDate = new Date(result.timestamp);
          const startDate = dateRange.start ? new Date(dateRange.start) : null;
          const endDate = dateRange.end ? new Date(dateRange.end) : null;

          if (startDate) {
            startDate.setHours(0, 0, 0, 0); // Set to start of the day
          }
          if (endDate) {
            endDate.setHours(23, 59, 59, 999); // Set to end of the day
          }

          if (startDate && resultDate < startDate) return false;
          if (endDate && resultDate > endDate) return false;
          
          return true;
        });
    }, [results, statusFilter, dateRange]);

  const handleExportCSV = () => {
    const analysesToExport = filteredResults.filter(r => r.AnalysisStatus === 'Completed');
    if (analysesToExport.length === 0) return;

    const escapeCSV = (field: string | number | undefined) => {
        if (field === null || field === undefined) {
            return '';
        }
        const str = String(field);
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const headers = [
        'ID',
        'Timestamp',
        'Status',
        'Emotion Score',
        'Emotion Explanation',
        'Summary',
        'Action Items',
        'Critical Actions Count',
        'Original Transcript'
    ];

    const rows = analysesToExport.map(r => [
        r.id,
        new Date(r.timestamp).toLocaleString('he-IL'),
        r.AnalysisStatus,
        r.EmotionScore?.Score ?? 'N/A',
        r.EmotionScore?.Explanation ?? '',
        r.Summary ?? '',
        r.ActionItems?.map(item => `${item.Action} (${item.Urgency})`).join(' | ') ?? '',
        r.ActionItems?.filter(item => item.Urgency === 'קריטי').length ?? 0,
        r.originalTranscript
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'logiflow_analysis_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
  };
  
  const handleClearFilters = () => {
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
  };

  const handleConfirmClear = () => {
    onClearHistory();
    setIsClearConfirmVisible(false);
  };

  const isAnyFilterActive = statusFilter !== 'all' || dateRange.start !== '' || dateRange.end !== '';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">לוח בקרה</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <KPICard title="ציון רגש ממוצע" value={kpiData.avgEmotionScore} icon={<ChartBarIcon />} />
            <KPICard title="משימות קריטיות" value={kpiData.criticalActions.toString()} icon={<AlertTriangleIcon />} />
            <KPICard title="סה״כ משימות" value={kpiData.totalActions.toString()} icon={<ListCheckIcon />} />
        </div>
      </div>

      <SummaryLengthChart data={unfilteredSuccessfulAnalyses} />

      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
         <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-slate-700">היסטוריית ניתוחים</h2>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleExportCSV}
                    disabled={filteredResults.filter(r => r.AnalysisStatus === 'Completed').length === 0}
                    className="bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
                    aria-label="יצא נתונים לקובץ CSV"
                >
                    <DownloadIcon/> <span className="hidden sm:inline">יצא CSV</span>
                </button>
                 <button
                    onClick={() => setIsClearConfirmVisible(true)}
                    disabled={results.length === 0}
                    className="bg-red-50 text-red-700 font-semibold py-2 px-4 rounded-lg hover:bg-red-100 border border-red-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:border-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
                    aria-label="נקה היסטוריה"
                >
                    <TrashIcon/> <span className="hidden sm:inline">נקה</span>
                </button>
            </div>
        </div>

        {/* Filters Section */}
        <div className="border-t border-b border-slate-200 py-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-slate-600 mb-1">סנן לפי סטטוס</label>
                <select 
                    id="status-filter" 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value as 'all' | 'Completed' | 'Error')}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                >
                    <option value="all">הכל</option>
                    <option value="Completed">הושלם</option>
                    <option value="Error">נכשל</option>
                </select>
            </div>
             <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-slate-600 mb-1">מתאריך</label>
                <input 
                    type="date" 
                    id="start-date"
                    value={dateRange.start}
                    onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                />
            </div>
            <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-slate-600 mb-1">עד תאריך</label>
                <input 
                    type="date" 
                    id="end-date"
                    value={dateRange.end}
                    onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                />
            </div>
            <button
                onClick={handleClearFilters}
                disabled={!isAnyFilterActive}
                className="w-full bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors border border-slate-300 text-sm"
            >
                נקה סינונים
            </button>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12">
             <div className="inline-block bg-slate-200 rounded-full p-4">
                 <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
             </div>
             <p className="text-slate-500 mt-4 font-semibold">טרם נותחו שיחות.</p>
             <p className="text-slate-400 text-sm">השתמש בטופס בצד כדי להתחיל.</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <p className="text-slate-500 text-center py-8">לא נמצאו תוצאות התואמות את הסינון הנוכחי.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">תאריך ושעה</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">סטטוס</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">ציון רגש</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">משימות</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">צפה</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(result.timestamp).toLocaleString('he-IL')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        result.AnalysisStatus === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.AnalysisStatus === 'Completed' ? 'הושלם' : 'נכשל'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">{result.EmotionScore?.Score ?? 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">{result.ActionItems?.length ?? 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <button onClick={() => setSelectedCall(result)} className="text-indigo-600 hover:text-indigo-800 font-semibold">
                        צפה בפרטים
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedCall && (
        <CallDetailModal result={selectedCall} onClose={() => setSelectedCall(null)} />
      )}
      {isClearConfirmVisible && (
        <ConfirmationModal
          title="אישור מחיקת היסטוריה"
          message="האם אתה בטוח שברצונך למחוק את כל היסטוריית הניתוחים? פעולה זו אינה הפיכה."
          onConfirm={handleConfirmClear}
          onCancel={() => setIsClearConfirmVisible(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;