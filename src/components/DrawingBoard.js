import React, { useRef, useEffect, useState } from 'react';
import { processImage } from '../services/geminiService';
import html2canvas from 'html2canvas';

function DrawingBoard() {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pressure, setPressure] = useState(0.5);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // تحسين جودة الرسم
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    setContext(ctx);

    // تعيين حجم Canvas
    function resizeCanvas() {
      const container = canvas.parentElement;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      ctx.scale(dpr, dpr);
      
      // إعادة تعيين الإعدادات
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // دالة الرسم
  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    context.beginPath();
    context.moveTo(lastX, lastY);
    context.lineTo(x, y);
    context.stroke();

    setLastX(x);
    setLastY(y);
  };

  // معالجات أحداث الماوس
  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setIsDrawing(true);
    setLastX((e.clientX || e.touches[0].clientX) - rect.left);
    setLastY((e.clientY || e.touches[0].clientY) - rect.top);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // دالة لتحويل Canvas إلى صورة
  const canvasToImage = async () => {
    try {
      const canvas = canvasRef.current;
      
      // استخدام html2canvas لالتقاط الرسم
      const capturedCanvas = await html2canvas(canvas, {
        backgroundColor: '#FFFFFF',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      return new Promise((resolve) => {
        capturedCanvas.toBlob((blob) => {
          const file = new File([blob], 'math.png', { type: 'image/png' });
          resolve(file);
        }, 'image/png', 1.0);
      });
    } catch (error) {
      console.error('Error converting canvas to image:', error);
      throw new Error('فشل في تحويل الرسم إلى صورة');
    }
  };

  // دالة للتعرف على المسألة وحلها
  const recognizeAndSolve = async () => {
    try {
      setLoading(true);
      setError(null);

      const imageFile = await canvasToImage();
      const result = await processImage(imageFile);
      setSolution(result);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'حدث خطأ في معالجة الصورة. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // دالة لمسح اللوحة
  const clearCanvas = () => {
    if (context) {
      context.clearRect(
        0, 0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      setSolution('');
      setError(null);
    }
  };

  return (
    <div className="drawing-board">
      <div className="drawing-section">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ touchAction: 'none' }}
        />
        <div className="drawing-controls">
          <button onClick={clearCanvas} className="clear-btn">مسح</button>
          <button 
            onClick={recognizeAndSolve} 
            className="solve-btn"
            disabled={loading}
          >
            {loading ? 'جاري الحل...' : 'حل'}
          </button>
        </div>
      </div>

      {(solution || loading || error) && (
        <div className="solution-section">
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>جاري التعرف على المسألة وحلها...</p>
            </div>
          )}
          
          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
            </div>
          )}
          
          {solution && !loading && !error && (
            <div className="solution-container">
              <div className="solution-content">
                {solution.split('\n').map((line, index) => (
                  <p key={index} className="solution-line">
                    {line.trim()}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DrawingBoard;
