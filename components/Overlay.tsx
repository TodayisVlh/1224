import React from 'react';
import { AppState, TreeMode } from '../types';

interface OverlayProps {
  appState: AppState;
  onStart: () => void;
  onGestureToggle: () => void;
  isGestureMode: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  onMusicUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  webcamRef: React.RefObject<HTMLVideoElement>;
  gestureData: { detected: boolean; isFist: boolean; x: number; y: number } | null;
  treeMode: TreeMode;
}

export const Overlay: React.FC<OverlayProps> = ({
  appState,
  onStart,
  onGestureToggle,
  isGestureMode,
  isMuted,
  onMuteToggle,
  onMusicUpload,
  webcamRef,
  gestureData,
  treeMode
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8">
      {/* Header / Music Control */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
           <h1 className="text-pink-300 text-2xl font-bold tracking-widest serif">DREAMY XMAS</h1>
           <p className="text-white/50 text-xs mt-1 font-light tracking-wide">INTERACTIVE WEBGL EXPERIENCE</p>
        </div>
        <div className="flex gap-2">
          <label className="text-white/70 hover:text-white border border-white/20 px-4 py-2 rounded-full text-xs uppercase transition-colors backdrop-blur-md bg-black/20 cursor-pointer flex items-center">
             <span>Change Music</span>
             <input 
               type="file" 
               accept="audio/*" 
               onChange={onMusicUpload}
               className="hidden" 
             />
          </label>
          <button 
            onClick={onMuteToggle}
            className="text-white/70 hover:text-white border border-white/20 px-4 py-2 rounded-full text-xs uppercase transition-colors backdrop-blur-md bg-black/20"
          >
            {isMuted ? "Unmute" : "Mute"}
          </button>
        </div>
      </div>

      {/* Intro Screen */}
      {appState === AppState.INTRO && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
          <div className="text-center space-y-8 max-w-md p-8 border border-white/10 rounded-2xl bg-white/5 shadow-2xl shadow-pink-900/20">
            <h2 className="text-6xl text-white serif italic text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
              Dreamy
              <br />
              <span className="not-italic font-bold">Xmas</span>
            </h2>
            <div className="flex flex-col gap-4">
              <button 
                onClick={onStart}
                className="bg-white text-black hover:bg-pink-100 py-3 px-8 rounded-full font-bold tracking-wider transition-transform hover:scale-105"
              >
                ENTER EXPERIENCE
              </button>
              <button 
                onClick={() => { onGestureToggle(); onStart(); }}
                className="border border-pink-400/50 text-pink-200 hover:bg-pink-900/30 py-3 px-8 rounded-full font-semibold text-sm tracking-wide transition-colors"
              >
                ENTER WITH GESTURE CAM
              </button>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">
              Experience requires a modern GPU.<br/>Gesture mode uses camera to detect hand movements.
            </p>
          </div>
        </div>
      )}

      {/* In-Experience UI */}
      {appState === AppState.EXPERIENCE && (
        <div className="flex justify-between items-end w-full">
           <div className="text-white/60 text-sm">
              <p>Current State: <span className="text-pink-400 font-bold">{treeMode}</span></p>
              <p className="text-xs opacity-50 mt-1">Click anywhere to toggle or use Gestures</p>
           </div>

           {/* Gesture Camera View */}
           {isGestureMode && (
             <div className="relative pointer-events-auto">
                <div className="w-48 h-36 rounded-xl overflow-hidden border-2 border-pink-500/30 shadow-lg bg-black">
                   <video 
                     ref={webcamRef} 
                     autoPlay 
                     playsInline 
                     muted
                     className="w-full h-full object-cover transform -scale-x-100" 
                   />
                </div>
                {gestureData?.detected && (
                  <div className="absolute top-2 left-2 bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs backdrop-blur-md border border-green-500/30">
                    Hand Detected
                  </div>
                )}
                {/* Gesture hints */}
                <div className="absolute -top-20 right-0 text-right text-xs text-pink-200/80 space-y-1">
                   <p>✊ FIST: Tree</p>
                   <p>✋ OPEN: Explode</p>
                   <p>👋 MOVE: Rotate</p>
                </div>
             </div>
           )}
        </div>
      )}
      
      {/* Custom Gesture Cursor */}
      {isGestureMode && gestureData?.detected && (
        <div 
          className="fixed w-8 h-8 pointer-events-none z-50 transition-all duration-75 ease-out"
          style={{ 
             left: `${gestureData.x * 100}%`, 
             top: `${gestureData.y * 100}%`,
             transform: 'translate(-50%, -50%)'
          }}
        >
          <div className={`w-full h-full border-2 rounded-full transition-colors duration-300 ${gestureData.isFist ? 'border-pink-500 bg-pink-500/20 scale-75' : 'border-white bg-white/10 scale-100'}`} />
        </div>
      )}
    </div>
  );
};