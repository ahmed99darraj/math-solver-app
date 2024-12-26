import React from 'react';
import { MathComponent } from 'mathjax-react';

function SolutionDisplay({ solution, loading, error }) {
  if (loading) {
    return (
      <div className="solution-display loading">
        <div className="loading-spinner"></div>
        <p>جاري حل المسألة...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="solution-display error">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!solution) {
    return null;
  }

  return (
    <div className="solution-display">
      <div className="solution-content">
        {solution.split('\n').map((line, index) => {
          // التحقق مما إذا كان النص يحتوي على صيغة رياضية
          if (line.includes('$') && line.split('$').length >= 2) {
            const parts = line.split('$');
            return (
              <div key={index} className="solution-line">
                {parts.map((part, partIndex) => {
                  if (partIndex % 2 === 0) {
                    return <span key={partIndex}>{part}</span>;
                  } else {
                    return <MathComponent key={partIndex} tex={part} />;
                  }
                })}
              </div>
            );
          }
          return (
            <p key={index} className="solution-line">
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default SolutionDisplay;
