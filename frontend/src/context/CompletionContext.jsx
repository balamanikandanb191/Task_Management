import React, { createContext, useContext, useState, useEffect } from 'react';

const CompletionContext = createContext();

export const CompletionProvider = ({ children }) => {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [completedProject, setCompletedProject] = useState(null);

  const triggerCelebration = (projectTitle) => {
    setCompletedProject(projectTitle);
    setIsCelebrating(true);
    document.body.classList.add('celebration-mode');
  };

  const stopCelebration = () => {
    setIsCelebrating(false);
    setCompletedProject(null);
    document.body.classList.remove('celebration-mode');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('celebration-mode');
    };
  }, []);

  return (
    <CompletionContext.Provider value={{ isCelebrating, completedProject, triggerCelebration, stopCelebration }}>
      {children}
    </CompletionContext.Provider>
  );
};

export const useCompletion = () => {
  const context = useContext(CompletionContext);
  if (!context) {
    throw new Error('useCompletion must be used within a CompletionProvider');
  }
  return context;
};
