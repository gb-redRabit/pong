// Konfiguracja gry
export const CONFIG = {
  PAD_HEIGHT_RATIO: 6,
  PAD_WIDTH: 15,
  BALL_SIZE_RATIO: 55,
  PAD_SPEED_BASE: 8,
  PAD_SPEED_SLOW: 6,
  PAD_SPEED_FAST: 10,
  WINNING_SCORE: 5,
  POWERUP_DURATION: 5000,
  POWERUP_SPAWN_INTERVAL: 15000,
  POWERUP_SIZE: 30,
  POWERUP_CHANCE: 0.01,
  MAX_BALL_SPEED: 20,
  BALL_ACCELERATION: 0.001,

  DIFFICULTY: {
    EASY: {
      name: "Łatwy",
      desc: "Łatwy, Wolne AI",
      aiSpeed: 0.4,
      ballSpeed: 5,
    },
    MEDIUM: {
      name: "Średni",
      desc: "Średni, Normalne AI",
      aiSpeed: 0.7,
      ballSpeed: 7,
    },
    HARD: {
      name: "Trudny",
      desc: "Trudny, Szybkie AI",
      aiSpeed: 1.0,
      ballSpeed: 9,
    },
  },

  GAME_MODES: {
    CLASSIC: {
      name: "Classic",
      enabled: true,
      winScore: 5,
      description: "Klasyczna gra do 5 punktów",
      speedMultiplier: 1,
    },
    TIME_ATTACK: {
      name: "Time Attack",
      enabled: true,
      duration: 180,
      description: "Maksymalna liczba punktów w 3 minuty",
      speedMultiplier: 1.2,
    },
    FIRST_TO_10: {
      name: "First to 10",
      enabled: true,
      winScore: 10,
      description: "Pierwszy do 10 punktów wygrywa",
      speedMultiplier: 1,
    },
    SPEED_MODE: {
      name: "Speed Mode",
      enabled: true,
      winScore: 5,
      description: "Piłka zawsze bardzo szybka",
      speedMultiplier: 1.8,
    },
    CHAOS_MODE: {
      name: "Chaos Mode",
      enabled: true,
      winScore: 7,
      description: "Losowe power-upy co 5 sekund",
      speedMultiplier: 1.1,
      powerupInterval: 5000,
    },
    SURVIVAL: {
      name: "Survival",
      enabled: true,
      description: "Piłka przyspiesza bez limitu",
      speedMultiplier: 1,
      infiniteAcceleration: true,
    },
    TARGET_PRACTICE: {
      name: "Target Practice",
      enabled: true,
      duration: 60,
      description: "Trafiaj w cele przez 60 sekund",
      speedMultiplier: 1,
      targetsToSpawn: 5,
      pointsPerTarget: 10,
    },
    VOLLEYBALL: {
      name: "Volleyball",
      enabled: true,
      winScore: 15,
      description: "Piłka musi odbić się od podłoża",
      speedMultiplier: 1,
      gravity: 0.3,
    },
    CAMPAIGN: {
      name: "Kampania",
      enabled: false,
      description: "Dostępne w przyszłości",
    },
  },

  POWERUP_TYPES: [
    "SPEED_UP",
    "BIG_PAD",
    "SMALL_PAD",
    "MULTI_BALL",
    "FREEZE",
    "INVISIBLE",
    "SHIELD",
    "REVERSE",
    "SLOW_MOTION",
    "MAGNET",
    "GHOST_PAD",
  ],

  // Przeszkody
  OBSTACLE_TYPES: [
    "BLOCK",
    "PORTAL",
    "WIND",
    "TARGET",
    "MOVING_BLOCK",
    "BREAKOUT_BLOCK",
    "SPEED_ZONE",
    "BARRIER",
  ],

  OBSTACLE_SIZE: 40,
  MAX_OBSTACLES: 8,
  PORTAL_PAIR_DISTANCE: 300,
  PORTAL_SAFE_ZONE: 80,
  WIND_STRENGTH: 2,
  TARGET_POINTS: 10,
  MOVING_SPEED: 2,
  BREAKOUT_BLOCK_HITS: 3,
  SPEED_ZONE_MULTIPLIER: 1.5,
  BARRIER_DURATION: 3000,
};

// Motywy kolorystyczne
export const themes = {
  neon: {
    name: "Neon",
    primary: "#32f051",
    secondary: "#14b32e",
    bg: "#000",
  },
  retro: {
    name: "Retro",
    primary: "#ff6b35",
    secondary: "#f7931e",
    bg: "#1a1a2e",
  },
  dark: {
    name: "Ciemny",
    primary: "#00d9ff",
    secondary: "#0099cc",
    bg: "#0a0a0a",
  },
  light: {
    name: "Jasny",
    primary: "#2196F3",
    secondary: "#1976D2",
    bg: "#f5f5f5",
  },
  matrix: {
    name: "Matrix",
    primary: "#00ff41",
    secondary: "#008f11",
    bg: "#0d0208",
  },
  sunset: {
    name: "Sunset",
    primary: "#ff6b6b",
    secondary: "#ff8e53",
    bg: "#1a1423",
  },
  ocean: {
    name: "Ocean",
    primary: "#00d4ff",
    secondary: "#0081a7",
    bg: "#001219",
  },
};

// Efekty wizualne
export const SCREEN_SHAKE_INTENSITY = 8;
export const SCREEN_SHAKE_DURATION = 300;
export const FIREWORK_PARTICLES = 50;
export const FIREWORK_DURATION = 1500;
