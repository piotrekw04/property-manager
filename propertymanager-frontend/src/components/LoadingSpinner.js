import React from 'react';

function LoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <div className="spinner" style={{
        border: "4px solid rgba(0, 0, 0, 0.1)",
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        borderLeftColor: "black",
        animation: "spin 1s linear infinite",
        margin: "auto"
      }}></div>

      {/* Dodaj prostą animację w CSS */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default LoadingSpinner;
