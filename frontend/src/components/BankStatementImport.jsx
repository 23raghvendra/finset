import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  Check, 
  AlertTriangle, 
  X,
  ChevronDown,
  ChevronRight,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

// Bank statement parsers
const BANK_FORMATS = {
  'generic': {
    name: 'Generic CSV',
    description: 'Standard CSV with Date, Description, Amount columns',
    dateFormats: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
    columns: ['date', 'description', 'amount']
  },
  'hdfc': {
    name: 'HDFC Bank',
    description: 'HDFC Bank statement format',
    dateFormats: ['DD/MM/YY'],
    columns: ['date', 'narration', 'withdrawal', 'deposit', 'balance']
  },
  'icici': {
    name: 'ICICI Bank',
    description: 'ICICI Bank statement format',
    dateFormats: ['DD-MM-YYYY'],
    columns: ['date', 'transaction_remarks', 'withdrawal', 'deposit', 'balance']
  },
  'sbi': {
    name: 'SBI',
    description: 'State Bank of India statement format',
    dateFormats: ['DD MMM YYYY'],
    columns: ['date', 'description', 'debit', 'credit', 'balance']
  },
  'axis': {
    name: 'Axis Bank',
    description: 'Axis Bank statement format',
    dateFormats: ['DD-MM-YYYY'],
    columns: ['date', 'particulars', 'debit', 'credit', 'balance']
  }
};

// Category detection based on keywords
const CATEGORY_KEYWORDS = {
  'Food & Dining': ['swiggy', 'zomato', 'restaurant', 'cafe', 'food', 'dominos', 'pizza', 'mcdonalds', 'kfc', 'starbucks', 'dining'],
  'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'shopping', 'mall', 'store', 'retail'],
  'Transportation': ['uber', 'ola', 'metro', 'petrol', 'fuel', 'parking', 'toll', 'irctc', 'railway'],
  'Bills & Utilities': ['electricity', 'water', 'gas', 'internet', 'broadband', 'mobile', 'recharge', 'bill'],
  'Entertainment': ['netflix', 'prime', 'hotstar', 'spotify', 'movie', 'pvr', 'inox', 'gaming'],
  'Healthcare': ['pharmacy', 'hospital', 'doctor', 'medical', 'health', 'apollo', 'medicine'],
  'Groceries': ['bigbasket', 'grofers', 'blinkit', 'grocery', 'supermarket', 'dmart'],
  'Transfer': ['transfer', 'neft', 'rtgs', 'imps', 'upi'],
  'Salary': ['salary', 'payroll', 'wages'],
  'Investment': ['mutual fund', 'sip', 'stock', 'zerodha', 'groww', 'investment']
};

const detectCategory = (description) => {
  const lowerDesc = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      return category;
    }
  }
  return 'Other';
};

const parseDate = (dateStr, format) => {
  try {
    // Handle common date formats
    let parts;
    if (dateStr.includes('/')) {
      parts = dateStr.split('/');
    } else if (dateStr.includes('-')) {
      parts = dateStr.split('-');
    } else {
      // Try parsing as-is
      const date = new Date(dateStr);
      if (!isNaN(date)) return date;
      return null;
    }

    if (parts.length >= 3) {
      // Assume DD/MM/YYYY or similar
      let day, month, year;
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        [year, month, day] = parts;
      } else if (parts[2].length === 4) {
        // DD/MM/YYYY
        [day, month, year] = parts;
      } else {
        // DD/MM/YY
        [day, month, year] = parts;
        year = parseInt(year) < 50 ? `20${year}` : `19${year}`;
      }
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
  } catch (e) {
    console.error('Date parse error:', e);
  }
  return null;
};

const parseCSV = (text) => {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
    if (values.length >= headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      rows.push(row);
    }
  }
  
  return { headers, rows };
};

const BankStatementImport = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [bankFormat, setBankFormat] = useState('generic');
  const [parsedData, setParsedData] = useState(null);
  const [mappedTransactions, setMappedTransactions] = useState([]);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Confirm
  const [columnMapping, setColumnMapping] = useState({
    date: '',
    description: '',
    amount: '',
    debit: '',
    credit: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0] || e.target.files[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
      processFile(droppedFile);
    } else {
      toast.error('Please upload a CSV file');
    }
  }, []);

  const processFile = async (uploadedFile) => {
    setIsProcessing(true);
    try {
      const text = await uploadedFile.text();
      const { headers, rows } = parseCSV(text);
      
      setParsedData({ headers, rows });
      
      // Auto-detect column mapping
      const mapping = { date: '', description: '', amount: '', debit: '', credit: '' };
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('date')) mapping.date = header;
        if (lowerHeader.includes('description') || lowerHeader.includes('narration') || lowerHeader.includes('particular') || lowerHeader.includes('remark')) mapping.description = header;
        if (lowerHeader.includes('amount') && !lowerHeader.includes('balance')) mapping.amount = header;
        if (lowerHeader.includes('debit') || lowerHeader.includes('withdrawal')) mapping.debit = header;
        if (lowerHeader.includes('credit') || lowerHeader.includes('deposit')) mapping.credit = header;
      });
      
      setColumnMapping(mapping);
      setStep(2);
    } catch (error) {
      toast.error('Failed to parse file');
      console.error(error);
    }
    setIsProcessing(false);
  };

  const mapTransactions = () => {
    if (!parsedData) return;

    const transactions = parsedData.rows
      .map((row, index) => {
        const dateStr = row[columnMapping.date];
        const description = row[columnMapping.description] || '';
        
        let amount = 0;
        let type = 'expense';

        if (columnMapping.amount) {
          amount = Math.abs(parseFloat(row[columnMapping.amount]?.replace(/[^0-9.-]/g, '')) || 0);
          // Negative amounts are typically expenses
          if (parseFloat(row[columnMapping.amount]?.replace(/[^0-9.-]/g, '')) > 0) {
            type = 'income';
          }
        } else {
          const debit = parseFloat(row[columnMapping.debit]?.replace(/[^0-9.-]/g, '')) || 0;
          const credit = parseFloat(row[columnMapping.credit]?.replace(/[^0-9.-]/g, '')) || 0;
          if (credit > 0) {
            amount = credit;
            type = 'income';
          } else if (debit > 0) {
            amount = debit;
            type = 'expense';
          }
        }

        const parsedDate = parseDate(dateStr, 'DD/MM/YYYY');
        if (!parsedDate || amount === 0) return null;

        return {
          id: `import-${index}`,
          date: parsedDate.toISOString(),
          description: description.substring(0, 100),
          amount,
          type,
          category: detectCategory(description),
          isSelected: true
        };
      })
      .filter(t => t !== null);

    setMappedTransactions(transactions);
    setSelectedTransactions(transactions.map(t => t.id));
    setStep(3);
  };

  const handleImport = () => {
    const toImport = mappedTransactions
      .filter(t => selectedTransactions.includes(t.id))
      .map(({ id, isSelected, ...t }) => t);

    if (toImport.length === 0) {
      toast.error('No transactions selected');
      return;
    }

    onImport(toImport);
    toast.success(`Imported ${toImport.length} transactions!`);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setParsedData(null);
    setMappedTransactions([]);
    setStep(1);
    setSelectedTransactions([]);
    onClose();
  };

  const toggleTransaction = (id) => {
    setSelectedTransactions(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedTransactions.length === mappedTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(mappedTransactions.map(t => t.id));
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div 
        className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: 'var(--card-bg)' }}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Import Bank Statement
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Step {step} of 3: {step === 1 ? 'Upload File' : step === 2 ? 'Map Columns' : 'Review & Import'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Progress */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div 
                key={s}
                className="flex-1 h-1 rounded-full transition-all"
                style={{ background: s <= step ? 'var(--primary-600)' : 'var(--bg-secondary)' }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Bank Format Selection */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Bank Format (Optional)
                </label>
                <select
                  value={bankFormat}
                  onChange={(e) => setBankFormat(e.target.value)}
                  className="input"
                >
                  {Object.entries(BANK_FORMATS).map(([key, format]) => (
                    <option key={key} value={key}>{format.name}</option>
                  ))}
                </select>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {BANK_FORMATS[bankFormat].description}
                </p>
              </div>

              {/* Drop Zone */}
              <div
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('file-input').click()}
                className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all"
                style={{ 
                  borderColor: file ? 'var(--success-800)' : 'var(--border)',
                  background: file ? 'var(--success-200)' : 'var(--bg-secondary)'
                }}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileDrop}
                  className="hidden"
                />
                
                {file ? (
                  <div>
                    <Check size={48} className="mx-auto mb-4" style={{ color: 'var(--success-800)' }} />
                    <p className="font-medium" style={{ color: 'var(--success-800)' }}>{file.name}</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      Drop your CSV file here
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                      or click to browse
                    </p>
                  </div>
                )}
              </div>

              {/* Sample Download */}
              <div className="text-center">
                <button
                  className="text-sm inline-flex items-center gap-1"
                  style={{ color: 'var(--primary-600)' }}
                >
                  <Download size={14} />
                  Download sample CSV format
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {step === 2 && parsedData && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl" style={{ background: 'var(--primary-100)' }}>
                <p className="text-sm" style={{ color: 'var(--primary-600)' }}>
                  Found {parsedData.rows.length} rows. Map the columns below to import correctly.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Date Column *
                  </label>
                  <select
                    value={columnMapping.date}
                    onChange={(e) => setColumnMapping({ ...columnMapping, date: e.target.value })}
                    className="input"
                  >
                    <option value="">Select column</option>
                    {parsedData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Description Column *
                  </label>
                  <select
                    value={columnMapping.description}
                    onChange={(e) => setColumnMapping({ ...columnMapping, description: e.target.value })}
                    className="input"
                  >
                    <option value="">Select column</option>
                    {parsedData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Amount Column (or leave empty)
                  </label>
                  <select
                    value={columnMapping.amount}
                    onChange={(e) => setColumnMapping({ ...columnMapping, amount: e.target.value })}
                    className="input"
                  >
                    <option value="">Select column</option>
                    {parsedData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Debit/Withdrawal Column
                  </label>
                  <select
                    value={columnMapping.debit}
                    onChange={(e) => setColumnMapping({ ...columnMapping, debit: e.target.value })}
                    className="input"
                  >
                    <option value="">Select column</option>
                    {parsedData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Credit/Deposit Column
                  </label>
                  <select
                    value={columnMapping.credit}
                    onChange={(e) => setColumnMapping({ ...columnMapping, credit: e.target.value })}
                    className="input"
                  >
                    <option value="">Select column</option>
                    {parsedData.headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div>
                <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Preview (first 3 rows)</h3>
                <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)' }}>
                        {parsedData.headers.slice(0, 5).map(h => (
                          <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.rows.slice(0, 3).map((row, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--border-light)' }}>
                          {parsedData.headers.slice(0, 5).map(h => (
                            <td key={h} className="px-3 py-2" style={{ color: 'var(--text-primary)' }}>
                              {row[h]?.substring(0, 20)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {selectedTransactions.length} of {mappedTransactions.length} transactions selected
                </p>
                <button
                  onClick={toggleAll}
                  className="text-sm font-medium"
                  style={{ color: 'var(--primary-600)' }}
                >
                  {selectedTransactions.length === mappedTransactions.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {mappedTransactions.map(t => (
                  <div 
                    key={t.id}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                    style={{ 
                      background: selectedTransactions.includes(t.id) ? 'var(--primary-100)' : 'var(--bg-secondary)',
                      border: `1px solid ${selectedTransactions.includes(t.id) ? 'var(--primary-600)' : 'transparent'}`
                    }}
                    onClick={() => toggleTransaction(t.id)}
                  >
                    <div 
                      className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                      style={{ 
                        borderColor: selectedTransactions.includes(t.id) ? 'var(--primary-600)' : 'var(--border)',
                        background: selectedTransactions.includes(t.id) ? 'var(--primary-600)' : 'transparent'
                      }}
                    >
                      {selectedTransactions.includes(t.id) && <Check size={12} color="white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {t.description}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(t.date).toLocaleDateString('en-IN')} • {t.category}
                      </p>
                    </div>
                    <span 
                      className="text-sm font-medium shrink-0"
                      style={{ color: t.type === 'income' ? 'var(--success-800)' : 'var(--danger-500)' }}
                    >
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-3" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-secondary)' }}>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          {step === 2 && (
            <button
              onClick={mapTransactions}
              disabled={!columnMapping.date || !columnMapping.description}
              className="px-6 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--primary-600)' }}
            >
              Continue
            </button>
          )}
          {step === 3 && (
            <button
              onClick={handleImport}
              disabled={selectedTransactions.length === 0}
              className="px-6 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--primary-600)' }}
            >
              Import {selectedTransactions.length} Transactions
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankStatementImport;
