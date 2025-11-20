// src/config/settings.js - CENTRALIZED CONFIGURATION
export const AppSettings = {
  // ========================
  // STAR SETTINGS
  // ========================
  STARS: {
    SIZE: 6,                    // Base star size in pixels for other users
    CURRENT_USER_SIZE: 8,       // Current user star size (larger for identification)
    MIN_DISTANCE: 8,            // Minimum distance between stars in percentage
    SPAWN_ANIMATION_DURATION: 2000,  // ms for spawn animation
    GLOW_DURATION: 3000,        // ms for glow effect after spawn
    BACKGROUND_STARS_COUNT: 300, // Number of background stars
  },
  
  // ========================
  // POSITION SETTINGS
  // ========================
  POSITIONS: {
    MIN_RADIUS: 20,             // Minimum distance from center (%)
    MAX_RADIUS: 45,             // Maximum distance from center (%)
    POSITION_ATTEMPTS: 100,     // Max attempts to find non-overlapping position
  },
  
  // ========================
  // MESSAGE SYSTEM SETTINGS
  // ========================
  MESSAGES: {
    RATE_LIMIT_SECONDS: 8,      // Cooldown between messages (seconds) - TEST WITH 8s
    TOOLTIP_DURATION: 5000,     // How long tooltip bubbles stay visible (ms)
    MAX_MESSAGE_LENGTH: 50,     // Character limit for messages
    MESSAGE_HISTORY_LIMIT: 30,  // Number of messages to show in history
  },
  
  // ========================
  // TOOLTIP BUBBLE SETTINGS
  // ========================
  TOOLTIPS: {
    VERTICAL_OFFSET: 12,        // Distance from star in percentage
    HORIZONTAL_OFFSET: 8,       // Edge adjustment in percentage
    BUBBLE_MAX_WIDTH: 280,      // Maximum bubble width in pixels
    BUBBLE_MIN_WIDTH: 120,      // Minimum bubble width in pixels
  },
  
  // ========================
  // ANIMATION SETTINGS
  // ========================
  ANIMATIONS: {
    FADE_IN_DURATION: 300,      // Tooltip fade in duration (ms)
    FADE_OUT_DURATION: 300,     // Tooltip fade out duration (ms)
    GLOW_PULSE_DURATION: 2000,  // Bubble glow animation duration (ms)
  },
  
  // ========================
  // REAL-TIME SETTINGS
  // ========================
  REALTIME: {
    USER_UPDATE_INTERVAL: 5000, // ms between user list updates
    POLLING_INTERVAL: 10000,    // ms between database polls
  },
  
  // ========================
  // FIREWOOD ANIMATION
  // ========================
  FIREWOOD: {
    SIZE: 200,                  // px size of firewood animation
    SPARK_COUNT: 15,            // Number of sparks during spawn
  },
  
  // ========================
  // UI/UX SETTINGS
  // ========================
  UI: {
    MESSAGE_INPUT_OPACITY: 0.1, // Background opacity of message input
    SIDEBAR_OPACITY: 0.95,      // Background opacity of message history sidebar
    DEBUG_MODE: false,          // Show debug information
  }
};

// Make settings globally accessible for debugging
if (typeof window !== 'undefined') {
  window.CosmicFireSettings = AppSettings;
  console.log('🎛️ CosmicFire Settings Loaded:', AppSettings);
}