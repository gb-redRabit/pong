// Stan gry
export const game = {
  state: "menu",
  mode: "single",
  gameMode: "CLASSIC",
  difficulty: "MEDIUM",
  theme: "neon",
  plScore: 0,
  aiScore: 0,
  highScore: parseInt(localStorage.getItem("highScore")) || 0,
  ballX: 0,
  ballY: 0,
  ballSpeedX: 7,
  ballSpeedY: 5,
  sizeBall: 10,
  padY: 0,
  pad2Y: 0,
  padHeight: 100,
  pad2Height: 100,
  particles: [],
  powerups: [],
  activePowerup: null,
  powerupTimer: null,
  lastPowerupSpawn: Date.now(),
  balls: [],
  frozenPlayer: null,
  invisibleBall: false,
  shieldPlayer1: false,
  shieldPlayer2: false,
  reversedPlayer: null,
  gameStartTime: 0,
  totalGameTime: 0,
  timeAttackEndTime: 0,
  nextChaosSpawn: 0,
  survivalSpeedMultiplier: 1.0,
  settingsWaitingForKey: null,
  settingsSelectedPlayer: 1,
  player1Powerup: null,
  player2Powerup: null,
  globalPowerup: null,
  lastBallHitBy: null, // 1 = gracz1, 2 = gracz2
  slowMotionActive: false,
  magnetPlayer: null, // 1 lub 2 - który gracz ma magnes
  ghostPadPlayer: null, // 1 lub 2 - który gracz ma ghost pad
  ghostPadUsed: false,
  obstacles: [],
  portals: [],
  windZones: [],
  targets: [],
  shieldAnimations: [], // Animacje efektów wizualnych
  breakoutBlocks: [],
  speedZones: [],
  barriers: [],
  player1Name: localStorage.getItem("player1Name") || "GRACZ 1",
  player2Name: localStorage.getItem("player2Name") || "GRACZ 2",
  player1Color: localStorage.getItem("player1Color") || "#32f051",
  player2Color: localStorage.getItem("player2Color") || "#32f051",
  gameHistory: JSON.parse(localStorage.getItem("gameHistory") || "[]"),
  // Nowe efekty wizualne
  screenShake: { active: false, endTime: 0, offsetX: 0, offsetY: 0 },
  fireworks: [],
  // Target Practice
  practiceTargets: [],
  targetsHit: 0,
  shotsFired: 0,
  // Volleyball
  groundBounces: 0,
  lastGroundBouncePlayer: null,
};

// Ustawienia sterowania
export const controls = {
  player1: {
    type: localStorage.getItem("p1ControlType") || "keyboard",
    keyUp: localStorage.getItem("p1KeyUp") || "w",
    keyDown: localStorage.getItem("p1KeyDown") || "s",
    speed: parseFloat(localStorage.getItem("p1Speed")) || 8,
  },
  player2: {
    type: localStorage.getItem("p2ControlType") || "keyboard",
    keyUp: localStorage.getItem("p2KeyUp") || "ArrowUp",
    keyDown: localStorage.getItem("p2KeyDown") || "ArrowDown",
    speed: parseFloat(localStorage.getItem("p2Speed")) || 8,
  },
};

// Stan klawiszy
export const keys = {};

// Audio
export const audio = {
  hit: new Audio("./music/sound.wav"),
  score: new Audio("./music/score.wav"),
  power: new Audio("./music/power.wav"),
};

// Ustawienia audio
audio.hit.volume = 0.3;
audio.score.volume = 0.4;
audio.power.volume = 0.5;
