import React from 'react';

const Fallback = ({ componentName, error }) => {
  return (
    <div className="card">
      <div className="empty-state">
        <div className="empty-icon">⚠️</div>
        <h3>Component Not Available</h3>
        <p>The {componentName} component is currently unavailable.</p>
        {error && (
          <details style={{ marginTop: '1rem', textAlign: 'left' }}>
            <summary>Error Details</summary>
            <pre style={{ fontSize: '0.8rem', color: 'var(--danger-color)' }}>
              {error.toString()}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default Fallback;