// src/config/settings.js - FIXED VERSION
export const AppSettings = {
  // Star Settings
  STARS: {
    SIZE: 6, // Base star size in pixels
    CURRENT_USER_SIZE: 8, // Current user star size (larger for identification)
    MIN_DISTANCE: 8, // Minimum distance between stars in percentage
    SPAWN_ANIMATION_DURATION: 2000, // ms for spawn animation
    GLOW_DURATION: 3000, // ms for glow effect after spawn
    BACKGROUND_STARS_COUNT: 300,
  },
  
  // Position Settings
  POSITIONS: {
    MIN_RADIUS: 20, // Minimum distance from center (%)
    MAX_RADIUS: 45, // Maximum distance from center (%)
    POSITION_ATTEMPTS: 100, // Max attempts to find non-overlapping position
  },
  
  // Firewood Animation
  FIREWOOD: {
    SIZE: 200, // px
    SPARK_COUNT: 15, // Number of sparks during spawn
  },
  
  // Message System
  MESSAGES: {
    RATE_LIMIT_MINUTES: 30,
    MESSAGE_DURATION: 5000,
    MAX_MESSAGE_LENGTH: 140,
  },
  
  // Real-time Updates
  REALTIME: {
    USER_UPDATE_INTERVAL: 5000, // ms between user list updates
  }
};

// Make settings globally accessible for debugging
if (typeof window !== 'undefined') {
  window.CosmicFireSettings = AppSettings;
}