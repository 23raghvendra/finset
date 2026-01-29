import React from 'react';
import './index.css';

function TestApp() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1 style={{ color: 'var(--primary-color, #2563eb)' }}>FinanceAI Test</h1>
      <p>If you can see this, the basic React setup is working!</p>
      <div className="card" style={{ 
        background: 'var(--surface-color, white)', 
        padding: '1rem', 
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '8px',
        marginTop: '1rem'
      }}>
        <h3>Test Card</h3>
        <p>This is a test card to verify CSS variables are working.</p>
        <button className="btn btn-primary" style={{
          background: 'var(--primary-color, #2563eb)',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          Test Button
        </button>
      </div>
    </div>
  );
}

export default TestApp;