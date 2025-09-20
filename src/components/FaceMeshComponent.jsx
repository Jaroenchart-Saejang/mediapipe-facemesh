import React, { useRef, useEffect, useState, useCallback } from 'react';

const FaceMeshComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const controlsRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // MediaPipe instances
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);
  const fpsControlRef = useRef(null);
  const controlPanelRef = useRef(null);
  
  // Configuration state
  const [config, setConfig] = useState({
    selfieMode: true,
    maxNumFaces: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  const onResultsFaceMesh = useCallback((results) => {
    if (!canvasRef.current) return;
    
    setIsLoaded(true);
    setIsLoading(false);
    
    const canvasCtx = canvasRef.current.getContext('2d');
    if (fpsControlRef.current) {
      fpsControlRef.current.tick();
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(
      results.image, 0, 0, canvasRef.current.width, canvasRef.current.height
    );
    
    if (results.multiFaceLandmarks && window.drawConnectors) {
      for (const landmarks of results.multiFaceLandmarks) {
        window.drawConnectors(
          canvasCtx, landmarks, window.FACEMESH_TESSELATION,
          {color: '#C0C0C070', lineWidth: 1}
        );
        window.drawConnectors(
          canvasCtx, landmarks, window.FACEMESH_RIGHT_EYE,
          {color: '#FF3030'}
        );
        window.drawConnectors(
          canvasCtx, landmarks, window.FACEMESH_RIGHT_EYEBROW,
          {color: '#FF3030'}
        );
        window.drawConnectors(
          canvasCtx, landmarks, window.FACEMESH_LEFT_EYE,
          {color: '#30FF30'}
        );
        window.drawConnectors(
          canvasCtx, landmarks, window.FACEMESH_LEFT_EYEBROW,
          {color: '#30FF30'}
        );
        window.drawConnectors(
          canvasCtx, landmarks, window.FACEMESH_FACE_OVAL,
          {color: '#E0E0E0'}
        );
        window.drawConnectors(
          canvasCtx, landmarks, window.FACEMESH_LIPS,
          {color: '#E0E0E0'}
        );
      }
    }
    canvasCtx.restore();
  }, []);

  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        // Wait for MediaPipe libraries to load
        await new Promise((resolve) => {
          const checkLibraries = () => {
            if (window.FaceMesh && window.Camera && window.ControlPanel && window.FPS) {
              resolve();
            } else {
              setTimeout(checkLibraries, 100);
            }
          };
          checkLibraries();
        });

        // Initialize FPS control
        fpsControlRef.current = new window.FPS();

        // Initialize Face Mesh
        faceMeshRef.current = new window.FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.1/${file}`;
          }
        });
        faceMeshRef.current.onResults(onResultsFaceMesh);
        faceMeshRef.current.setOptions(config);

        // Initialize Camera
        if (videoRef.current) {
          cameraRef.current = new window.Camera(videoRef.current, {
            onFrame: async () => {
              if (faceMeshRef.current && videoRef.current) {
                await faceMeshRef.current.send({image: videoRef.current});
              }
            },
            width: 480,
            height: 480
          });
          await cameraRef.current.start();
        }

        // Initialize Control Panel
        if (controlsRef.current) {
          controlPanelRef.current = new window.ControlPanel(controlsRef.current, config)
            .add([
              new window.StaticText({title: 'MediaPipe Face Mesh'}),
              fpsControlRef.current,
              new window.Toggle({title: 'Selfie Mode', field: 'selfieMode'}),
              new window.Slider({
                title: 'Max Number of Faces',
                field: 'maxNumFaces',
                range: [1, 4],
                step: 1
              }),
              new window.Slider({
                title: 'Min Detection Confidence',
                field: 'minDetectionConfidence',
                range: [0, 1],
                step: 0.01
              }),
              new window.Slider({
                title: 'Min Tracking Confidence',
                field: 'minTrackingConfidence',
                range: [0, 1],
                step: 0.01
              }),
            ])
            .on(options => {
              setConfig(options);
              if (videoRef.current) {
                videoRef.current.classList.toggle('selfie', options.selfieMode);
              }
              if (faceMeshRef.current) {
                faceMeshRef.current.setOptions(options);
              }
            });
        }

      } catch (error) {
        console.error('Failed to initialize MediaPipe:', error);
        setIsLoading(false);
      }
    };

    initializeMediaPipe();

    // Cleanup function
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
    };
  }, [onResultsFaceMesh, config]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex items-center">
          <div className="text-xl font-bold">MediaPipe Face Mesh Demo</div>
          <div className="ml-8 flex space-x-4">
            <a href="#" className="hover:text-blue-200">Face</a>
            <a href="#" className="hover:text-blue-200 font-bold">Face Mesh</a>
            <a href="#" className="hover:text-blue-200">Hands</a>
            <a href="#" className="hover:text-blue-200">Pose</a>
            <a href="#" className="hover:text-blue-200">Holistic</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto mt-6 px-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Webcam Input */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-500 text-white px-4 py-2 font-semibold">
              Webcam Input
            </div>
            <div className="p-4 flex justify-center">
              <video
                ref={videoRef}
                className={`w-full max-w-md rounded-lg ${config.selfieMode ? 'scale-x-[-1]' : ''}`}
                style={{ maxHeight: '480px' }}
                autoPlay
                muted
                playsInline
              />
            </div>
          </div>

          {/* MediaPipe Output */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-500 text-white px-4 py-2 font-semibold">
              MediaPipe Face Mesh
            </div>
            <div className="p-4 flex justify-center">
              <canvas
                ref={canvasRef}
                className="border rounded-lg"
                width={480}
                height={480}
              />
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-lg">Loading MediaPipe...</span>
            </div>
          </div>
        )}

        {/* Controls (Hidden but needed for MediaPipe) */}
        <div ref={controlsRef} className="mt-6" />
      </div>

      {/* Load MediaPipe Scripts */}
      <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.1/camera_utils.js" />
      <script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils@0.1/control_utils.js" />
      <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.1/drawing_utils.js" />
      <script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.1/face_mesh.js" />
    </div>
  );
};

export default FaceMeshComponent;