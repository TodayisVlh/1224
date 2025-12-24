import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, MathUtils, Vector3, Shape, Color } from 'three';
import { TreeMode } from '../types';
import { COLORS, THEMES, ColorTheme, LEAF_COUNT, GEM_COUNT, RIBBON_COUNT } from '../constants';

const tempObject = new Object3D();
const tempVec3 = new Vector3();
const tempColor = new Color();

interface DreamTreeProps {
  mode: TreeMode;
  rotationOffset: number;
  theme: ColorTheme;
}

const StarGeometry = () => {
  const shape = useMemo(() => {
    const s = new Shape();
    const points = 5;
    const outerRadius = 1.2;
    const innerRadius = 0.5;
    
    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2; // Rotate to point up
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
    return s;
  }, []);

  const extrudeSettings = {
    steps: 1,
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 2
  };

  return <extrudeGeometry args={[shape, extrudeSettings]} />;
};

const generateParticles = (count: number, type: 'leaf' | 'gem' | 'ribbon') => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    
    // TREE SHAPE
    let x = 0, y = 0, z = 0;
    let scale = 1;

    if (type === 'leaf') {
      const angle = t * Math.PI * 40; 
      const radius = (1 - t) * 8 + Math.random() * 1.5; 
      y = (t * 16) - 8; 
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      scale = Math.random() * 0.15 + 0.05; 
    } else if (type === 'gem') {
      const angle = Math.random() * Math.PI * 2;
      const h = Math.random(); 
      const radius = (1 - h) * 7; 
      y = (h * 16) - 8;
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      scale = Math.random() * 0.2 + 0.1;
    } else if (type === 'ribbon') {
      // Reverted to cleaner, simple spiral ribbon
      const rotations = 3.5; 
      const angle = t * Math.PI * 2 * rotations; 
      
      const radius = (1 - t) * 9 + 1; 
      y = (t * 16) - 8;

      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      
      scale = 0.12;
    }

    // EXPLODE SHAPE
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const r = 10 + Math.random() * 10;
    const ex = r * Math.sin(phi) * Math.cos(theta);
    const ey = r * Math.sin(phi) * Math.sin(theta);
    const ez = r * Math.cos(phi);

    particles.push({
      treePos: new Vector3(x, y, z),
      explodePos: new Vector3(ex, ey, ez),
      scale,
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0]
    });
  }
  return particles;
};

export const DreamTree: React.FC<DreamTreeProps> = ({ mode, rotationOffset, theme }) => {
  const leavesRef = useRef<InstancedMesh>(null);
  const gemsRef = useRef<InstancedMesh>(null);
  const ribbonRef = useRef<InstancedMesh>(null);
  const groupRef = useRef<Object3D>(null);

  const leavesData = useMemo(() => generateParticles(LEAF_COUNT, 'leaf'), []);
  const gemsData = useMemo(() => generateParticles(GEM_COUNT, 'gem'), []);
  const ribbonData = useMemo(() => generateParticles(RIBBON_COUNT, 'ribbon'), []);

  // Update Colors when Theme Changes
  useEffect(() => {
    // 1. Leaves
    if (leavesRef.current) {
      for (let i = 0; i < leavesData.length; i++) {
        // Randomly pick between main and light theme colors
        const isMain = Math.random() > 0.5;
        tempColor.copy(isMain ? theme.main : theme.light);
        // Add slight variance
        leavesRef.current.setColorAt(i, tempColor);
      }
      leavesRef.current.instanceColor!.needsUpdate = true;
    }

    // 2. Gems
    if (gemsRef.current) {
      for (let i = 0; i < gemsData.length; i++) {
        const isAccent = Math.random() > 0.7;
        tempColor.copy(isAccent ? theme.accent : COLORS.gem);
        gemsRef.current.setColorAt(i, tempColor);
      }
      gemsRef.current.instanceColor!.needsUpdate = true;
    }

    // 3. Ribbon (Always white)
    if (ribbonRef.current) {
      for (let i = 0; i < ribbonData.length; i++) {
        ribbonRef.current.setColorAt(i, COLORS.white);
      }
      ribbonRef.current.instanceColor!.needsUpdate = true;
    }

  }, [theme, leavesData, gemsData, ribbonData]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, groupRef.current.rotation.y + rotationOffset * 0.1, 0.1);
    }

    const targetFactor = mode === TreeMode.EXPLODE ? 1 : 0;
    const currentFactor = MathUtils.lerp(
      leavesRef.current?.userData.factor || 0, 
      targetFactor, 
      delta * 2
    );
    
    if (leavesRef.current) leavesRef.current.userData.factor = currentFactor;

    const updateInstances = (ref: React.RefObject<InstancedMesh>, data: any[]) => {
        if (!ref.current) return;
        const centerFactor = leavesRef.current?.userData.factor || 0;

        for (let i = 0; i < data.length; i++) {
            const { treePos, explodePos, scale, rotation } = data[i];
            tempVec3.lerpVectors(treePos, explodePos, centerFactor);
            tempVec3.y += Math.sin(state.clock.elapsedTime + treePos.x) * 0.05;

            tempObject.position.copy(tempVec3);
            tempObject.rotation.set(
                rotation[0] + state.clock.elapsedTime * 0.2, 
                rotation[1] + state.clock.elapsedTime * 0.1, 
                rotation[2]
            );
            tempObject.scale.setScalar(scale);
            tempObject.updateMatrix();
            ref.current.setMatrixAt(i, tempObject.matrix);
        }
        ref.current.instanceMatrix.needsUpdate = true;
    }

    updateInstances(leavesRef, leavesData);
    updateInstances(gemsRef, gemsData);
    updateInstances(ribbonRef, ribbonData);
  });

  return (
    <group ref={groupRef} position={[0, -2, 0]}>
      {/* Leaves */}
      <instancedMesh ref={leavesRef} args={[undefined, undefined, LEAF_COUNT]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial roughness={0.4} metalness={0.6} />
      </instancedMesh>

      {/* Gems */}
      <instancedMesh ref={gemsRef} args={[undefined, undefined, GEM_COUNT]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial roughness={0.1} metalness={0.9} emissive={theme.accent} emissiveIntensity={0.5} />
      </instancedMesh>

      {/* Ribbon */}
      <instancedMesh ref={ribbonRef} args={[undefined, undefined, RIBBON_COUNT]}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={COLORS.white} roughness={0.1} metalness={1} emissive={COLORS.white} emissiveIntensity={2} />
      </instancedMesh>

      {/* Top Star - adapts to theme */}
      <mesh position={[0, 8.5, 0]}>
        <StarGeometry />
        <meshStandardMaterial 
          color="#FFF" 
          emissive={theme.accent} 
          emissiveIntensity={2} 
          roughness={0}
          metalness={1}
        />
        <pointLight intensity={10} distance={15} color={theme.glow} />
      </mesh>
    </group>
  );
};