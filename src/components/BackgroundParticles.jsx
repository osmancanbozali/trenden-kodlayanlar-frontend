// src/components/FancyParticles.jsx
import React from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const FancyParticles = () => {
  const particlesInit = async (engine) => {
    console.log('✅ Engine loaded');
    await loadFull(engine);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        background: { color: 'transparent' },
        particles: {
          number: { value: 40 },
          color: { value: '#ffffff' },
          links: {
            enable: true,
            distance: 100,
            color: '#ffffff',
            opacity: 0.2,
            width: 1,
          },
          opacity: { value: 0.4, random: true },
          size: { value: 2, random: true },
          move: {
            enable: true,
            speed: 0.6,
            outModes: { default: 'out' },
          },
        },
      }}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
};

export default FancyParticles;
