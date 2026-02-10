
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const data = [
  { name: 'Jan', revenue: 40000, expenses: 24000 },
  { name: 'Feb', revenue: 38000, expenses: 25000 },
  { name: 'Mar', revenue: 42000, expenses: 23000 },
  { name: 'Apr', revenue: 45000, expenses: 26000 },
  { name: 'May', revenue: 48000, expenses: 27000 },
];

const FinanceManagement: React.FC = () => {
  const downloadCSV = (chartName: string) => {
    const headers = ['Month', 'Revenue (CAD)', 'Expenses (CAD)'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => `${row.name},${row.revenue},${row.expenses}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${chartName.toLowerCase().replace(/\s+/g, '_')}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ExportButton = ({ onClick }: { onClick: () => void }) => (
    <button 
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 bg-slate-50 rounded-lg transition-all border border-slate-100"
    >
      <span>📥</span> Export CSV
    </button>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* P&L Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold text-slate-800">Profit & Loss (P&L) Trend</h4>
            <ExportButton onClick={() => downloadCSV('Profit_and_Loss')} />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cash Flow Forecast */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold text-slate-800">Cash Flow Forecast</h4>
            <ExportButton onClick={() => downloadCSV('Cash_Flow_Forecast')} />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold text-slate-800">Pending Invoices</h4>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-100">
              + New Batch Invoice
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                <div>
                  <p className="font-bold text-slate-800">Smith Family - Liam (May Fees)</p>
                  <p className="text-xs text-slate-500 italic">Due in {i * 2 + 1} days</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">$1,450.00</p>
                  <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Pending</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mb-4 shadow-inner">
            🏦
          </div>
          <h4 className="font-bold text-lg text-slate-800">Net Profit Margin</h4>
          <p className="text-4xl font-extrabold text-emerald-600 mt-2">24.5%</p>
          <p className="text-slate-400 text-xs mt-2 italic">Exceeding Ontario Average (18%)</p>
        </div>
      </div>
    </div>
  );
};

export default FinanceManagement;
