import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import { DreamTree } from './DreamTree';
import { Effects } from './Effects';
import { TreeMode } from '../types';
import { ColorTheme } from '../constants';

interface ExperienceProps {
  mode: TreeMode;
  onCanvasClick: () => void;
  gestureRotation: number;
  theme: ColorTheme;
}

export const Experience: React.FC<ExperienceProps> = ({ mode, onCanvasClick, gestureRotation, theme }) => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 25], fov: 35 }}
      dpr={[1, 2]} // Performance optimization
      onClick={onCanvasClick}
      className="cursor-pointer"
    >
      <color attach="background" args={['#050103']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.5} 
        penumbra={1} 
        intensity={20} 
        color={theme.glow} 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={5} color={theme.accent} />
      
      <Environment preset="city" />

      <group position={[0, -2, 0]}>
        <DreamTree mode={mode} rotationOffset={gestureRotation} theme={theme} />
      </group>

      <ContactShadows 
        resolution={1024} 
        scale={50} 
        blur={2} 
        opacity={0.5} 
        far={10} 
        color="#000000" 
      />

      <Effects />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        maxPolarAngle={Math.PI / 2 + 0.1} 
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  );
};