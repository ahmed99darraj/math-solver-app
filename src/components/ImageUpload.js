import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faArrowRight, faCamera } from '@fortawesome/free-solid-svg-icons';
import { processImage } from '../services/geminiService';
import Camera from './Camera';
import './ImageUpload.css';

const ImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleKeyPress = async (event) => {
      if (event.key === 'Enter' && selectedImage && !loading) {
        await handleSolve();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, loading]);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    handleFileSelection(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFileSelection(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleFileSelection = (file) => {
    setError('');
    setSolution('');
    
    if (!file) {
      setError('الرجاء اختيار ملف');
      return;
    }

    if (!file.type.match('image.*')) {
      setError('الرجاء اختيار صورة صالحة');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 4 ميجابايت');
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSolve = async () => {
    if (!selectedImage) {
      setError('الرجاء اختيار صورة أولاً');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await processImage(selectedImage);
      setSolution(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraCapture = (file) => {
    handleFileSelection(file);
    setShowCamera(false);
  };

  const renderSolution = () => {
    if (!solution) return null;

    const lines = solution.split('\n');
    return (
      <div className="solution-container">
        <div className="solution-title">حل المسألة</div>
        {lines.map((line, index) => {
          if (line.startsWith('المسألة:')) {
            return <div key={index} className="solution-step"><strong>{line}</strong></div>;
          } else if (line.startsWith('الإجابة النهائية:')) {
            return <div key={index} className="solution-final">{line}</div>;
          } else if (line.trim()) {
            return <div key={index} className="solution-step">{line}</div>;
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="image-upload">
      {showCamera ? (
        <Camera
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          onFileSelect={handleFileSelection}
        />
      ) : (
        <>
          <div 
            className="upload-container"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="upload-options">
              <button 
                className="camera-button"
                onClick={() => setShowCamera(true)}
              >
                <FontAwesomeIcon icon={faCamera} />
                <span>التقاط صورة</span>
              </button>
              <div className="upload-divider">أو</div>
              <button 
                className="upload-button"
                onClick={() => fileInputRef.current.click()}
              >
                <FontAwesomeIcon icon={faCloudUploadAlt} />
                <span>اختيار ملف</span>
              </button>
            </div>
            <div className="upload-subtext">JPG, PNG - أقل من 4MB</div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading && (
            <div className="loading-spinner" />
          )}

          {previewUrl && !loading && (
            <div className="preview-container">
              <img src={previewUrl} alt="Preview" className="preview-image" />
              <div className="enter-hint">
                <span>اضغط Enter للحل</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </div>
            </div>
          )}

          {renderSolution()}
        </>
      )}
    </div>
  );
};

export default ImageUpload;
