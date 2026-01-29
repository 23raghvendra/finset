import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useOffline } from '../contexts/OfflineContext';

const OfflineIndicator = () => {
  const {
    isOfflineMode
  } = useOffline();

  return (
    <>

      {/* Offline Banner (when offline mode is enabled) */}
      <AnimatePresence>
        {isOfflineMode && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2"
            style={{ background: 'var(--warning-500)', color: 'white' }}
          >
            <WifiOff size={16} />
            Offline mode enabled. Changes will be saved locally and synced when you turn it off.
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OfflineIndicator;
