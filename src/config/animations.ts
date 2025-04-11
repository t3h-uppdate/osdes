import { Variants, Transition } from 'framer-motion';

// Shared animation variants for page transitions
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    // Example: Add a slight slide-up effect
    // y: 20,
  },
  in: {
    opacity: 1,
    // y: 0,
  },
  out: {
    opacity: 0,
    // y: -20,
  },
};

// Shared transition settings for pages
export const pageTransition: Transition = {
  type: 'tween', // Can be 'spring', 'tween', etc.
  ease: 'anticipate', // Easing function (e.g., 'linear', 'easeIn', 'easeInOut', 'circIn', 'anticipate')
  duration: 0.5, // Duration in seconds
};

import type { ISourceOptions } from '@tsparticles/engine';

export const spaceParticlesOptions: ISourceOptions = {
  fullScreen: {
    enable: true,
    zIndex: -1, // Ensure particles are behind other content
  },
  particles: {
    number: {
      value: 80, // Number of particles
      // Removed density block due to persistent TS errors
    },
    color: {
      value: '#ffffff', // Particle color
    },
    shape: {
      type: 'circle', // Particle shape
    },
    opacity: {
      value: { min: 0.1, max: 0.5 }, // Use min/max for randomness, assuming 0.5 was the intended max
      // Removed the incorrect 'random' object based on TS error and comparison with 'size' config
      animation: {
        enable: true,
        speed: 1,
        // minimumValue is typically part of the value range or animation settings if applicable
        // Removed minValue: 0.1 due to TS errors
        sync: false,
      },
    },
    size: {
      value: { min: 0.5, max: 3 }, // Changed value to an object with min/max for randomness
      // Removed the separate random block
      animation: {
        enable: false,
        speed: 40,
        // Removed minValue: 0.1 due to TS errors
        sync: false,
      },
    },
    line_linked: {
      enable: false, // Disable lines connecting particles for a more "space dust" feel
    },
    move: {
      enable: true,
      speed: 0.5, // Slow movement speed
      direction: 'none',
      random: true,
      straight: false,
      outModes: 'out', // Changed out_mode to outModes
      // Removed bounce: false, as it's not a direct property here
      attract: {
        enable: false,
        rotate: { // Changed rotateX/Y to rotate object
            x: 600,
            y: 1200
        }
      },
    },
  },
  interactivity: {
    detectsOn: 'canvas',
    events: {
      onHover: { // Changed onhover to onHover
        enable: false, // Disable hover effects for simplicity
      },
      onClick: { // Changed onclick to onClick (consistency)
        enable: false, // Disable click effects
      },
      // resize is directly under interactivity, not events
    },
    modes: {}, // Added modes object as it might be expected
  },
  resize: true, // Moved resize here
  detectRetina: true,
};
