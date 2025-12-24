import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { AppState, TreeMode } from './types';
import { BG_MUSIC_URL, THEMES, ColorTheme } from './constants';
import { initializeHandLandmarker, detectHands, calculateGesture } from './services/gestureService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);
  const [treeMode, setTreeMode] = useState<TreeMode>(TreeMode.TREE);
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(THEMES.PINK);
  const [isGestureMode, setIsGestureMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false); 
  const [gestureData, setGestureData] = useState<{ detected: boolean; isFist: boolean; x: number; y: number } | null>(null);
  const [gestureRotation, setGestureRotation] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>(0);

  // Music setup
  useEffect(() => {
    const audio = new Audio(BG_MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, []);

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.play().catch(() => {});
      setIsMuted(false);
    } else {
      audioRef.current.pause();
      setIsMuted(true);
    }
  };

  const handleMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && audioRef.current) {
      const fileUrl = URL.createObjectURL(file);
      audioRef.current.src = fileUrl;
      if (!isMuted || appState === AppState.EXPERIENCE) {
        audioRef.current.play().catch(() => {});
        setIsMuted(false);
      }
    }
  };

  const handleStart = () => {
    setAppState(AppState.EXPERIENCE);
    if (!isMuted && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio autoplay blocked", e));
    }
  };

  const changeTheme = useCallback(() => {
    const keys = Object.keys(THEMES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    setCurrentTheme(THEMES[randomKey]);
  }, []);

  const toggleTreeMode = useCallback(() => {
    setTreeMode(prev => {
      if (prev === TreeMode.EXPLODE) {
        // Changing to TREE, change color
        changeTheme();
        return TreeMode.TREE;
      } else {
        return TreeMode.EXPLODE;
      }
    });
  }, [changeTheme]);

  // Gesture Logic Loop
  const gestureLoop = useCallback((time: number) => {
    if (isGestureMode && videoRef.current && videoRef.current.readyState >= 2) {
      const result = detectHands(videoRef.current, time);
      
      if (result && result.landmarks && result.landmarks.length > 0) {
        const gesture = calculateGesture(result.landmarks);
        
        if (gesture) {
          const cursorX = 1 - gesture.x; 
          
          setGestureData({ 
            detected: true, 
            isFist: gesture.isFist, 
            x: cursorX, 
            y: gesture.y 
          });

          // 1. Mode Switching Logic
          if (gesture.isFist && treeMode !== TreeMode.TREE) {
             changeTheme(); // Change color on gesture trigger too
             setTreeMode(TreeMode.TREE);
          } else if (gesture.isOpen && treeMode !== TreeMode.EXPLODE) {
             setTreeMode(TreeMode.EXPLODE);
          }

          // 2. Rotation Logic (X movement)
          const rotationFactor = (cursorX - 0.5) * 2; 
          if (Math.abs(rotationFactor) > 0.2) {
             setGestureRotation(rotationFactor);
          } else {
             setGestureRotation(0);
          }

        }
      } else {
        setGestureData(prev => prev ? { ...prev, detected: false } : null);
        setGestureRotation(0);
      }
    }
    requestRef.current = requestAnimationFrame(gestureLoop);
  }, [isGestureMode, treeMode, changeTheme]);

  // Initialize Gesture Camera
  useEffect(() => {
    if (isGestureMode) {
      const startCamera = async () => {
        try {
          await initializeHandLandmarker();
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play().then(() => {
                    requestRef.current = requestAnimationFrame(gestureLoop);
                }).catch(e => console.error("Video play failed", e));
            };
          }
        } catch (err) {
          console.error("Camera init failed", err);
          setIsGestureMode(false);
          alert("Could not access camera. Please allow permissions.");
        }
      };
      startCamera();
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isGestureMode, gestureLoop]);

  return (
    <div className="w-full h-full relative">
      <Overlay 
        appState={appState}
        onStart={handleStart}
        onGestureToggle={() => setIsGestureMode(true)}
        isGestureMode={isGestureMode}
        isMuted={isMuted}
        onMuteToggle={toggleMute}
        onMusicUpload={handleMusicUpload}
        webcamRef={videoRef}
        gestureData={gestureData}
        treeMode={treeMode}
      />
      <Experience 
        mode={treeMode} 
        onCanvasClick={toggleTreeMode}
        gestureRotation={gestureRotation}
        theme={currentTheme}
      />
    </div>
  );
};

export default App;