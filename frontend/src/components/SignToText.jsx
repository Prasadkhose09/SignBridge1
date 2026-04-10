import React, { useRef, useState, useEffect } from 'react';
import { Camera, Square, Activity } from 'lucide-react';
import { fetchPrediction, resetPrediction } from '../services/api';

const FPS          = 15;
const INTERVAL_MS  = 1000 / FPS;
const JPEG_QUALITY = 0.5;
const CAPTURE_W    = 320;
const CAPTURE_H    = 240;

const SignToText = ({ isSystemReady }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState('System Ready');
  const [statusType, setStatusType] = useState('active'); // '', 'active', 'error'
  const [predictedSign, setPredictedSign] = useState('--');
  const [confidence, setConfidence] = useState('0%');
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const streamRef = useRef(null);
  const sequenceNumberRef = useRef(0);
  const pendingRequestRef = useRef(false);
  const lastSentTimeRef = useRef(0);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Setup offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = CAPTURE_W;
    canvas.height = CAPTURE_H;
    offscreenCanvasRef.current = canvas;

    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
     if (!isSystemReady && status !== 'Backend Unavailable') {
        setStatus('Connecting...');
        setStatusType('');
     } else if (isSystemReady && !isStreaming) {
        setStatus('System Ready');
        setStatusType('active');
     }
  }, [isSystemReady, isStreaming]);

  const updateUI = (result) => {
    if (!result.success) return;

    if (result.requiresMoreFrames) {
        setProgress({ current: result.progress || 0, total: result.total || 30 });
        const handHint = result.handDetected === false ? ' (Show Hand)' : ' (Wait...)';
        setStatus(`Initializing... ${result.progress || 0}/${result.total || 10}${handHint}`);
        setStatusType('');
        return;
    }

    if (result.predictedSign || result.mappedWord) {
        const word = result.mappedWord || result.predictedSign;
        setPredictedSign(word);
        const conf = result.confidence ? Math.round(result.confidence * 100) + '%' : '';
        setConfidence(conf);
        setProgress({ current: 10, total: 10 });
        setStatus(`✓ ${word} (${conf})`);
        setStatusType('active');
    } else {
        const handStatus = result.handDetected ? 'Hand Detected ✓' : 'Show Hand';
        const conf = result.confidence ? Math.round(result.confidence * 100) + '%' : '';
        setConfidence(conf || '0%');
        setStatus(`${handStatus} | Analyzing...`);
        setStatusType('');
        setProgress({ current: 0, total: 0 });
    }
  };

  const processFrame = async (timestamp) => {
    if (!streamRef.current) return;
    
    // Draw to main canvas
    if (canvasRef.current && videoRef.current) {
         const ctx = canvasRef.current.getContext('2d');
         ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    if (!pendingRequestRef.current && (timestamp - lastSentTimeRef.current >= INTERVAL_MS)) {
        lastSentTimeRef.current = timestamp;
        await sendFrameToBackend();
    }
    
    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  const sendFrameToBackend = async () => {
      pendingRequestRef.current = true;
      try {
          const offscreenCtx = offscreenCanvasRef.current.getContext('2d');
          if (!videoRef.current) return;
          
          offscreenCtx.drawImage(videoRef.current, 0, 0, CAPTURE_W, CAPTURE_H);
          const frameData = offscreenCanvasRef.current.toDataURL('image/jpeg', JPEG_QUALITY);
          
          const result = await fetchPrediction(frameData, sequenceNumberRef.current++);
          if (result) {
              updateUI(result);
          }
      } catch (e) {
          console.error(e);
      } finally {
          pendingRequestRef.current = false;
      }
  };

  const startCamera = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: 'user' }
        });
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
            if (canvasRef.current && videoRef.current) {
                 canvasRef.current.width = videoRef.current.videoWidth;
                 canvasRef.current.height = videoRef.current.videoHeight;
            }
            setIsStreaming(true);
            setStatus('Camera Active');
            setStatusType('active');
            animationFrameRef.current = requestAnimationFrame(processFrame);
        };
    } catch {
        alert('Could not access camera. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
      }
      if (videoRef.current) {
          videoRef.current.srcObject = null;
      }
      if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
      }
      setIsStreaming(false);
      setStatus('Camera Stopped');
      setStatusType('');
      setProgress({ current: 0, total: 0 });
      resetPrediction();
  };

  const progressPercentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="grid-layout">
        <div className="main-panel">
            <div className="video-container">
                <video ref={videoRef} className="video-element" autoPlay playsInline muted></video>
                <canvas ref={canvasRef} className="canvas-element"></canvas>
                <div className={`status-badge ${statusType}`}>
                    <Activity size={16} />
                    {status}
                </div>
            </div>

            <div className="controls-panel">
                {!isStreaming ? (
                    <button className="btn btn-primary" onClick={startCamera}>
                       <Camera size={20} /> Start Camera
                    </button>
                ) : (
                    <button className="btn btn-danger" onClick={stopCamera}>
                       <Square size={20} /> Stop Camera
                    </button>
                )}
            </div>
        </div>

        <div className="results-panel">
            <div className="result-card glass-panel">
                <h3>Predicted Sign</h3>
                <div className="prediction-text">{predictedSign}</div>
                
                {progress.total > 0 && progress.current < progress.total && (
                    <div className="progress-container">
                        <div className="progress-bar">
                             <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                        <span className="progress-label">{progress.current}/{progress.total}</span>
                    </div>
                )}
            </div>
            
            <div className="result-card glass-panel">
                <h3>Confidence</h3>
                <div className="confidence-text">{confidence}</div>
            </div>
        </div>
    </div>
  );
};

export default SignToText;
