import React, { useState } from 'react';
import { processText } from '../services/geminiService';
import './MathKeyboard.css';

const MathKeyboard = () => {
  const [input, setInput] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(0);

  const basicCalculator = {
    title: 'الآلة الحاسبة',
    keys: [
      ['7', '8', '9', '+'],
      ['4', '5', '6', '-'],
      ['1', '2', '3', '×'],
      ['0', '.', '÷', '='],
      ['(', ')', '⌫', 'C']
    ]
  };

  const specialSymbols = {
    title: 'الرموز الرياضية',
    symbols: [
      { symbol: '∫', desc: 'تكامل' },
      { symbol: '∑', desc: 'مجموع' },
      { symbol: '∏', desc: 'جداء' },
      { symbol: 'lim', desc: 'نهاية' },
      { symbol: '∞', desc: 'ما لا نهاية' },
      { symbol: '∂', desc: 'مشتق جزئي' },
      { symbol: 'π', desc: 'باي' },
      { symbol: 'θ', desc: 'ثيتا' },
      { symbol: 'α', desc: 'ألفا' },
      { symbol: 'β', desc: 'بيتا' },
      { symbol: 'Δ', desc: 'دلتا' },
      { symbol: '±', desc: 'موجب/سالب' }
    ]
  };

  const trigFunctions = {
    title: 'الدوال المثلثية',
    functions: [
      'sin', 'cos', 'tan',
      'sec', 'csc', 'cot',
      'arcsin', 'arccos', 'arctan',
      'sinh', 'cosh', 'tanh'
    ]
  };

  const sections = [basicCalculator, specialSymbols, trigFunctions];

  const handleKeyPress = async (key) => {
    if (key === '=') {
      // حل المسألة
      try {
        setLoading(true);
        setError(null);
        const result = await processText(input);
        setSolution(result);
      } catch (error) {
        setError(error.message || 'حدث خطأ في معالجة المسألة');
      } finally {
        setLoading(false);
      }
    } else if (key === 'C') {
      // مسح الكل
      setInput('');
      setSolution('');
      setError(null);
    } else if (key === '⌫') {
      // مسح آخر حرف
      setInput(prev => prev.slice(0, -1));
    } else {
      // إضافة المفتاح إلى المدخلات
      setInput(prev => prev + key);
    }
  };

  const handleSwipe = (direction) => {
    if (direction === 'right') {
      setActiveSection((prev) => (prev > 0 ? prev - 1 : sections.length - 1));
    } else {
      setActiveSection((prev) => (prev < sections.length - 1 ? prev + 1 : 0));
    }
  };

  const renderCalculator = () => (
    <div className="calculator-grid">
      {basicCalculator.keys.map((row, rowIndex) => (
        <div key={rowIndex} className="calculator-row">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className={`calc-key ${key === '=' ? 'equals' : ''} ${key === 'C' ? 'clear' : ''} ${key === '⌫' ? 'backspace' : ''}`}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );

  const renderSpecialSymbols = () => (
    <div className="special-symbols-grid">
      {specialSymbols.symbols.map((item, index) => (
        <button
          key={index}
          onClick={() => handleKeyPress(item.symbol)}
          title={item.desc}
          className="special-key"
        >
          {item.symbol}
        </button>
      ))}
    </div>
  );

  const renderTrigFunctions = () => (
    <div className="trig-functions-grid">
      {trigFunctions.functions.map((func, index) => (
        <button
          key={index}
          onClick={() => handleKeyPress(func + '(')}
          className="function-key"
        >
          {func}
        </button>
      ))}
    </div>
  );

  return (
    <div className="math-keyboard">
      <div className="input-section">
        <input
          type="text"
          className="input-display"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب المسألة الرياضية هنا..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleKeyPress('=');
            }
          }}
        />
        <button 
          className="submit-button"
          onClick={() => handleKeyPress('=')}
          title="حل المسألة"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
      </div>

      <div className="keyboard-carousel">
        <button 
          className="carousel-button prev" 
          onClick={() => handleSwipe('right')}
        >
          ‹
        </button>

        <div className="carousel-content">
          <h3 className="section-title">{sections[activeSection].title}</h3>
          <div className="section-content">
            {activeSection === 0 && renderCalculator()}
            {activeSection === 1 && renderSpecialSymbols()}
            {activeSection === 2 && renderTrigFunctions()}
          </div>
        </div>

        <button 
          className="carousel-button next" 
          onClick={() => handleSwipe('left')}
        >
          ›
        </button>
      </div>

      <div className="carousel-dots">
        {sections.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === activeSection ? 'active' : ''}`}
            onClick={() => setActiveSection(index)}
          />
        ))}
      </div>

      {(solution || loading || error) && (
        <div className="solution-section">
          {loading && (
            <div className="loading-message">
              جاري حل المسألة...
            </div>
          )}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          {solution && (
            <div className="solution-text">
              <strong>الحل:</strong>
              {solution}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MathKeyboard;
