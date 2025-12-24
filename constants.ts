import { Color } from 'three';

// Color Palettes
export interface ColorTheme {
  name: string;
  light: Color;
  main: Color;
  accent: Color;
  glow: string; // Hex for lights
}

export const THEMES: Record<string, ColorTheme> = {
  PINK: {
    name: 'PINK',
    light: new Color('#FFB7C5'),
    main: new Color('#FF69B4'),
    accent: new Color('#E0B0FF'),
    glow: '#FF69B4'
  },
  GREEN: {
    name: 'GREEN',
    light: new Color('#98FB98'), // Pale Green
    main: new Color('#2E8B57'), // Sea Green
    accent: new Color('#F0E68C'), // Khaki/Gold
    glow: '#32CD32'
  },
  RED: {
    name: 'RED',
    light: new Color('#FFA07A'), // Light Salmon
    main: new Color('#DC143C'), // Crimson
    accent: new Color('#FFD700'), // Gold
    glow: '#FF0000'
  },
  BLUE: {
    name: 'BLUE',
    light: new Color('#87CEFA'), // Light Sky Blue
    main: new Color('#4169E1'), // Royal Blue
    accent: new Color('#E0FFFF'), // Light Cyan
    glow: '#00BFFF'
  },
  PURPLE: {
    name: 'PURPLE',
    light: new Color('#D8BFD8'), // Thistle
    main: new Color('#9400D3'), // Dark Violet
    accent: new Color('#00FFFF'), // Aqua
    glow: '#8A2BE2'
  }
};

// Common Colors
export const COLORS = {
  bg: '#050103',
  white: new Color('#FFFFFF'),
  gem: new Color('#F0F8FF'),
};

// Counts
export const LEAF_COUNT = 5000;
export const GEM_COUNT = 1500;
export const RIBBON_COUNT = 800;

// Animation
export const LERP_SPEED = 0.08;
export const ROTATION_SPEED = 0.2;

// Audio - Jingle Bells (Kevin MacLeod) - Creative Commons
export const BG_MUSIC_URL = "https://upload.wikimedia.org/wikipedia/commons/e/e9/Jingle_Bells_-_Kevin_MacLeod.mp3";