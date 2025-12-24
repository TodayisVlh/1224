import { ThreeElements } from '@react-three/fiber';
import { ColorTheme } from './constants';

export enum AppState {
  INTRO = 'INTRO',
  EXPERIENCE = 'EXPERIENCE'
}

export enum TreeMode {
  TREE = 'TREE',
  EXPLODE = 'EXPLODE'
}

export interface GestureData {
  isFist: boolean; // Changed from isPinching
  isOpen: boolean;
  handX: number; // Normalized 0-1
  handY: number; // Normalized 0-1
  detected: boolean;
}

export interface ParticleData {
  treePos: any; // Vector3
  explodePos: any; // Vector3
  scale: number;
  rotation: [number, number, number];
  // Color is now handled dynamically, removed from static data
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}