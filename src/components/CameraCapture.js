import React, { useState } from 'react';
import Webcam from 'react-webcam';

function CameraCapture({ onProblemUpdate }) {
  const [isCameraActive, setIsCameraActive] = useState(true);
  const webcamRef = React.useRef(null);

  const videoConstraints = {
    width: 720,
    height: 1280,
    facingMode: "environment"
  };

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    // Here we'll add logic to process the image and extract math expression
    processImage(imageSrc);
  }, [webcamRef]);

  const processImage = async (imageSrc) => {
    // Here we'll integrate with OCR service to extract math expression
    console.log('Processing image...');
    // For demonstration, we'll just log the action
    onProblemUpdate('Processing captured image...');
  };

  return (
    <div className="camera-capture">
      <div className="camera-container">
        {isCameraActive && (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="camera-preview"
          />
        )}
        <div className="capture-frame">
          <div className="corner top-left"></div>
          <div className="corner top-right"></div>
          <div className="corner bottom-left"></div>
          <div className="corner bottom-right"></div>
        </div>
      </div>
      <div className="camera-controls">
        <button onClick={() => setIsCameraActive(!isCameraActive)} className="control-btn">
          {isCameraActive ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
        </button>
        <button onClick={capture} className="control-btn capture">
          التقاط
        </button>
      </div>
    </div>
  );
}

export default CameraCapture;
