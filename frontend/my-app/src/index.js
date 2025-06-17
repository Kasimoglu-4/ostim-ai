import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Ultra-fast React mounting
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render immediately and signal when ready
root.render(<App />);

// Signal that React is ready (for hiding static version)
setTimeout(() => {
  document.body.setAttribute('data-react-ready', 'true');
}, 100);

// Optional: Report web vitals after app loads (production only)
if (process.env.NODE_ENV === 'production') {
  import('./reportWebVitals').then(({ default: reportWebVitals }) => {
    reportWebVitals();
  });
}
