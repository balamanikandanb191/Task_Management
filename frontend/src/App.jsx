import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CompletionProvider } from './context/CompletionContext';
import ToastContainer from './components/common/ToastContainer';
import CelebrationOverlay from './components/common/CelebrationOverlay';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter basename="/Task_Management/">
      <ToastProvider>
        <CompletionProvider>
          <AuthProvider>
            <AppRoutes />
            <ToastContainer />
            <CelebrationOverlay />
          </AuthProvider>
        </CompletionProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
