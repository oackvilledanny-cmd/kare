
import React, { useState } from 'react';

// Mock Invoice Type
interface Invoice {
  id: string;
  date: string;
  dueDate: string;
  description: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  items: { desc: string; amount: number }[];
}

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-2024-001',
    date: '2024-05-01',
    dueDate: '2024-05-15',
    description: 'May 2024 Tuition - Liam Smith',
    amount: 1450.00,
    status: 'Pending',
    items: [
        { desc: 'Preschool Program (Full Time)', amount: 1350.00 },
        { desc: 'Hot Lunch Program', amount: 100.00 }
    ]
  },
  {
    id: 'INV-2024-002',
    date: '2024-04-01',
    dueDate: '2024-04-15',
    description: 'April 2024 Tuition - Liam Smith',
    amount: 1450.00,
    status: 'Paid',
    items: [
        { desc: 'Preschool Program (Full Time)', amount: 1350.00 },
        { desc: 'Hot Lunch Program', amount: 100.00 }
    ]
  },
  {
    id: 'INV-2024-003',
    date: '2024-03-01',
    dueDate: '2024-03-15',
    description: 'March 2024 Tuition - Liam Smith',
    amount: 1450.00,
    status: 'Paid',
    items: [
        { desc: 'Preschool Program (Full Time)', amount: 1350.00 },
        { desc: 'Hot Lunch Program', amount: 100.00 }
    ]
  }
];

const ParentBilling: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalDue = invoices.filter(i => i.status !== 'Paid').reduce((acc, curr) => acc + curr.amount, 0);

  const handlePay = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPayModalOpen(true);
  };

  const confirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
        if (selectedInvoice) {
            setInvoices(prev => prev.map(inv => 
                inv.id === selectedInvoice.id ? { ...inv, status: 'Paid' } : inv
            ));
            setIsPayModalOpen(false);
            setSelectedInvoice(null);
            setIsProcessing(false);
        }
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <h3 className="text-3xl font-black text-slate-800 tracking-tight">Billing & Payments</h3>
           <p className="text-slate-500 font-medium mt-2">Manage your childcare fees and download receipts.</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
                <p className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Total Outstanding Balance</p>
                <h2 className="text-6xl font-black tracking-tighter">${totalDue.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</h2>
                <p className="text-sm text-slate-400 mt-2 font-medium">Due by May 15, 2024</p>
            </div>
            {totalDue > 0 && (
                <button 
                  onClick={() => {
                     const firstPending = invoices.find(i => i.status === 'Pending');
                     if (firstPending) handlePay(firstPending);
                  }}
                  className="bg-white text-slate-900 px-10 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl active:scale-95 whitespace-nowrap"
                >
                    Pay Balance
                </button>
            )}
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-6">
        <h4 className="text-lg font-black text-slate-800 uppercase tracking-wide flex items-center gap-3">
            <span className="bg-slate-100 p-2 rounded-lg">📄</span> Invoice History
        </h4>
        
        <div className="grid grid-cols-1 gap-4">
            {invoices.map(invoice => (
                <div key={invoice.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row items-center justify-between gap-6 group">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-inner border-2 ${
                            invoice.status === 'Paid' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-orange-50 border-orange-100 text-orange-600'
                        }`}>
                            {invoice.status === 'Paid' ? '✓' : '⚠️'}
                        </div>
                        <div>
                            <h5 className="text-xl font-black text-slate-800">{invoice.description}</h5>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                                Issued: {new Date(invoice.date).toLocaleDateString()} • Due: {new Date(invoice.dueDate).toLocaleDateString()}
                            </p>
                            
                            {/* Line Items Preview */}
                            <div className="mt-3 space-y-1">
                                {invoice.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-8 text-xs text-slate-500 font-medium max-w-md">
                                        <span>• {item.desc}</span>
                                        <span>${item.amount}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                        <p className="text-2xl font-black text-slate-900">${invoice.amount.toLocaleString()}</p>
                        
                        {invoice.status === 'Pending' ? (
                            <button 
                                onClick={() => handlePay(invoice)}
                                className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                            >
                                Pay Now
                            </button>
                        ) : (
                            <button className="w-full md:w-auto bg-slate-50 text-slate-400 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center gap-2">
                                <span>⬇</span> Receipt
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Payment Modal */}
      {isPayModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
                <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Secure Payment</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Encrypted SSL Connection</p>
                    </div>
                    <button onClick={() => setIsPayModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 transition-colors">✕</button>
                </div>
                
                <form onSubmit={confirmPayment} className="p-8 space-y-6">
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Payment Amount</p>
                        <p className="text-3xl font-black text-blue-900">${selectedInvoice.amount.toLocaleString()}</p>
                        <p className="text-xs text-blue-600 mt-1 font-medium">{selectedInvoice.description}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Card Number</label>
                            <input required type="text" placeholder="0000 0000 0000 0000" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-800 tracking-widest" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Expiry</label>
                                <input required type="text" placeholder="MM/YY" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-800 text-center" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">CVC</label>
                                <input required type="text" placeholder="123" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-800 text-center" />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isProcessing}
                        className="w-full bg-emerald-500 text-white py-5 rounded-[2rem] font-black uppercase text-sm tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-3"
                    >
                        {isProcessing ? (
                            <>Processing...</>
                        ) : (
                            <>Confirm Payment</>
                        )}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ParentBilling;
