import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faImages, faTimes } from '@fortawesome/free-solid-svg-icons';
import './Camera.css';

const Camera = ({ onCapture, onClose, onFileSelect }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          aspectRatio: { ideal: 1 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('لا يمكن الوصول إلى الكاميرا. الرجاء التحقق من الإذن.');
    }
  };

  const handleCapture = () => {
    setIsCapturing(true);
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      const aspectRatio = video.videoWidth / video.videoHeight;
      
      const cropSize = Math.min(video.videoWidth, video.videoHeight) * 0.8;
      const cropX = (video.videoWidth - cropSize) / 2;
      const cropY = (video.videoHeight - cropSize) / 2;

      canvas.width = cropSize;
      canvas.height = cropSize;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        video,
        cropX, cropY, cropSize, cropSize,
        0, 0, cropSize, cropSize
      );

      canvas.toBlob(blob => {
        const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
        onCapture(file);
        setIsCapturing(false);
      }, 'image/jpeg');
    }
  };

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <>
      <div className="camera-overlay" onClick={onClose} />
      <div className="camera-container">
        <div className="camera-header">
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        {error ? (
          <div className="camera-error">{error}</div>
        ) : (
          <div className="camera-preview-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-preview"
            />
            <div className="camera-frame" />
            <div className="camera-controls">
              <button 
                className="capture-button" 
                onClick={handleCapture}
                disabled={isCapturing}
              >
                <FontAwesomeIcon icon={faCamera} />
              </button>
            </div>
            <div className="capture-hint">
              انقر لالتقاط الصورة
            </div>
          </div>
        )}

        <label className="import-button">
          <FontAwesomeIcon icon={faImages} />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </>
  );
};

export default Camera;
