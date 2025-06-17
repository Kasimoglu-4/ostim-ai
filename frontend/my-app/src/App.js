import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, } from 'react-router-dom';
import './App.css';
import { getCurrentUser, logout } from './services/auth';

// Lazy load theme provider to reduce initial bundle
const ThemeProvider = lazy(() => import('./contexts/ThemeContext').then(module => ({ default: module.ThemeProvider })));

// Aggressive lazy loading - split everything into separate chunks
const ChatInterface = lazy(() => 
  import(/* webpackChunkName: "chat" */ './components/Chat/ChatInterface')
);
const Login = lazy(() => 
  import(/* webpackChunkName: "auth" */ './pages/Login')
);
const Signup = lazy(() => 
  import(/* webpackChunkName: "auth" */ './pages/Signup')
);
const SharedChatViewer = lazy(() => 
  import(/* webpackChunkName: "share" */ './pages/SharedChatViewer')
);
const GlobalFeedbackModal = lazy(() => 
  import(/* webpackChunkName: "modal" */ './components/Chat/GlobalFeedbackModal')
);

// Theme-aware loading component using CSS classes
const LoadingSpinner = () => {
  // Apply saved theme immediately to ensure correct styling
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Apply theme class to the document body immediately
    document.body.classList.remove('light-theme', 'dark-theme', 'sepia-theme');
    document.body.classList.add(`${savedTheme}-theme`);
  }, []);

  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      Loading...
    </div>
  );
};

// Ultra-lightweight authentication - completely synchronous, no API calls
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  
  useEffect(() => {
    // Completely synchronous auth check - no network requests
    const user = getCurrentUser();
    
    if (!user?.token) {
      setIsAuthenticated(false);
      return;
    }
    
    try {
      // Basic token structure validation only
      const parts = user.token.split('.');
      if (parts.length !== 3) {
        logout();
        setIsAuthenticated(false);
        return;
      }
      
      // Check expiry only - no server validation
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        logout();
        setIsAuthenticated(false);
        return;
      }
      
      // Trust the token - authenticate immediately
      setIsAuthenticated(true);
      
    } catch (error) {
      logout();
      setIsAuthenticated(false);
    }
  }, []);
  
  if (isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }
  
  if (isAuthenticated === null) {
    return null; // Minimal render blocking
  }
  
  return children;
};

// Minimal auth redirect
const AuthRedirect = ({ children }) => {
  const user = getCurrentUser();
  const urlParams = new URLSearchParams(window.location.search);
  const fromShared = urlParams.get('from') === 'shared';
  
  // If coming from shared page, don't redirect even if authenticated
  if (fromShared) {
    return children;
  }
  
  return user?.token ? <Navigate to="/chat" replace /> : children;
};

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ThemeProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={
                <AuthRedirect>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Login />
                  </Suspense>
                </AuthRedirect>
              } />
              <Route path="/signup" element={
                <AuthRedirect>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Signup />
                  </Suspense>
                </AuthRedirect>
              } />
              <Route path="/share/:shareToken" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <SharedChatViewer />
                </Suspense>
              } />
              <Route
                path="/chat/*"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <ChatInterface />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            
            <Suspense fallback={null}>
              <GlobalFeedbackModal />
            </Suspense>
          </div>
        </Router>
      </ThemeProvider>
    </Suspense>
  );
}

export default App;
