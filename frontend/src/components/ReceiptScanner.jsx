import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader, CheckCircle, AlertCircle, Scan } from 'lucide-react';
import toast from 'react-hot-toast';

const ReceiptScanner = ({ isOpen, onClose, onTransactionCreated }) => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image too large (max 10MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    await scanReceipt(file);
  };

  const scanReceipt = async (file) => {
    setScanning(true);
    setError(null);
    setScannedData(null);

    try {
      // AI functionality has been removed
      // Show an error message directing users to manual entry
      setTimeout(() => {
        setError('AI receipt scanning has been disabled. Please create transactions manually using the Add Transaction button.');
        toast.error('Receipt scanning unavailable');
      }, 1000);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to scan receipt');
    } finally {
      setTimeout(() => {
        setScanning(false);
      }, 1000);
    }
  };

  const handleConfirm = () => {
    if (scannedData) {
      onTransactionCreated({
        type: 'expense',
        amount: scannedData.amount,
        description: scannedData.description,
        category: scannedData.category,
        date: scannedData.date
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setScanning(false);
    setScannedData(null);
    setError(null);
    setPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-content max-w-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Scan size={24} style={{ color: 'var(--primary-600)' }} />
              Scan Receipt
            </h2>
            <button onClick={handleClose} className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>

          {!preview && !scanning && !scannedData && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all hover:border-[var(--primary-600)]"
                style={{ borderColor: 'var(--border)' }}
              >
                <Upload size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Click to upload receipt
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  PNG, JPG up to 10MB
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2" style={{ background: 'var(--card-bg)', color: 'var(--text-muted)' }}>
                    OR
                  </span>
                </div>
              </div>

              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full btn btn-primary"
              >
                <Camera size={18} />
                Take Photo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {scanning && (
            <div className="py-12 text-center">
              <Loader size={48} className="mx-auto mb-4 animate-spin" style={{ color: 'var(--primary-600)' }} />
              <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Scanning receipt...
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                AI is analyzing your receipt
              </p>
            </div>
          )}

          {error && (
            <div className="py-8 text-center">
              <AlertCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--danger-500)' }} />
              <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Scan Failed
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                {error}
              </p>
              <button
                onClick={() => {
                  setError(null);
                  setPreview(null);
                }}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          )}

          {scannedData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--success-200)' }}>
                <CheckCircle size={20} style={{ color: 'var(--success-800)' }} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--success-800)' }}>
                    Receipt scanned successfully
                  </p>
                  <p className="text-xs" style={{ color: 'var(--success-800)', opacity: 0.8 }}>
                    Confidence: {Math.round(scannedData.confidence * 100)}%
                  </p>
                </div>
              </div>

              {preview && (
                <div className="rounded-lg overflow-hidden" style={{ maxHeight: '200px' }}>
                  <img src={preview} alt="Receipt" className="w-full h-full object-contain" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Amount <span style={{ color: 'var(--danger-500)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={scannedData.amount}
                    onChange={(e) => setScannedData({ ...scannedData, amount: parseFloat(e.target.value) })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={scannedData.date}
                    onChange={(e) => setScannedData({ ...scannedData, date: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Description
                </label>
                <input
                  type="text"
                  value={scannedData.description}
                  onChange={(e) => setScannedData({ ...scannedData, description: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Category
                </label>
                <input
                  type="text"
                  value={scannedData.category}
                  onChange={(e) => setScannedData({ ...scannedData, category: e.target.value })}
                  className="input"
                />
              </div>

              {scannedData.items && scannedData.items.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Items
                  </label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {scannedData.items.map((item, i) => (
                      <div key={i} className="text-xs p-2 rounded" style={{ background: 'var(--bg-secondary)' }}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setScannedData(null);
                    setPreview(null);
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Scan Another
                </button>
                <button
                  onClick={handleConfirm}
                  className="btn btn-primary flex-1"
                >
                  Create Transaction
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptScanner;
