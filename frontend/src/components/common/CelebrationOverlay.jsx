import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, PartyPopper, ArrowRight } from 'lucide-react';
import { useCompletion } from '../../context/CompletionContext';

const CelebrationOverlay = () => {
  const { isCelebrating, completedProject, stopCelebration } = useCompletion();

  return (
    <AnimatePresence>
      {isCelebrating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: 'rgba(6, 78, 59, 0.9)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            padding: '2rem'
          }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            style={{
              maxWidth: '600px',
              width: '100%'
            }}
          >
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
                style={{
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 0 40px rgba(52, 211, 153, 0.5)'
                }}
              >
                <PartyPopper size={48} color="#34d399" />
              </motion.div>
            </div>

            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: 950, 
              letterSpacing: '-2px', 
              marginBottom: '1rem',
              lineHeight: 1.1
            }}>
              Success!
            </h1>
            <p style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600, 
              color: '#d1fae5', 
              marginBottom: '2.5rem',
              maxWidth: '500px',
              margin: '0 auto 2.5rem auto'
            }}>
              <span style={{ color: 'white', fontWeight: 900 }}>"{completedProject}"</span> has been completed successfully.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.95 }}
                onClick={stopCelebration}
                style={{
                  background: 'white',
                  color: '#065f46',
                  padding: '1.25rem 2.5rem',
                  borderRadius: '20px',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Great Work <ArrowRight size={20} />
              </motion.button>
            </div>

            <button
              onClick={stopCelebration}
              style={{
                position: 'absolute',
                top: '-60px',
                right: '0',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '50%',
                cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationOverlay;
