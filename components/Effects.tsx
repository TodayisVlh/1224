import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export const Effects: React.FC = () => {
  return (
    <EffectComposer disableNormalPass>
      <Bloom 
        luminanceThreshold={1.2} // Only very bright things glow
        mipmapBlur 
        intensity={1.5} 
        radius={0.6} 
      />
      <Vignette 
        eskil={false} 
        offset={0.1} 
        darkness={0.6} 
      />
    </EffectComposer>
  );
};