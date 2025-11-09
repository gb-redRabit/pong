import { game, audio } from "./state.js";
import { CONFIG } from "./config.js";
import { showScreen } from "./ui.js";

export function startGame(mode, canvas) {
  if (
    !CONFIG.GAME_MODES[game.gameMode].enabled &&
    game.gameMode === "CAMPAIGN"
  ) {
    return;
  }

  game.mode = mode;
  game.state = "playing";
  game.plScore = 0;
  game.aiScore = 0;
  game.powerups = [];
  game.balls = [];
  game.activePowerup = null;
  game.frozenPlayer = null;
  game.invisibleBall = false;
  game.shieldPlayer1 = false;
  game.shieldPlayer2 = false;
  game.reversedPlayer = null;
  game.gameStartTime = Date.now();
  game.totalGameTime = 0;
  game.slowMotionActive = false;
  game.magnetPlayer = null;
  game.ghostPadPlayer = null;
  game.ghostPadUsed = false;
  game.obstacles = [];
  game.portals = [];
  game.windZones = [];
  game.targets = [];
  game.breakoutBlocks = [];
  game.speedZones = [];
  game.barriers = [];
  game.practiceTargets = [];
  game.fireworks = [];
  game.screenShake = { active: false, endTime: 0, offsetX: 0, offsetY: 0 };

  // Konfiguracja trybów specjalnych
  const modeConfig = CONFIG.GAME_MODES[game.gameMode];

  // TIME_ATTACK - ustaw limit czasu
  if (game.gameMode === "TIME_ATTACK") {
    game.timeAttackEndTime = Date.now() + modeConfig.duration * 1000;
  }

  // CHAOS_MODE - ustaw pierwszy spawn power-upu
  if (game.gameMode === "CHAOS_MODE") {
    game.nextChaosSpawn = Date.now() + modeConfig.powerupInterval;
  }

  // SURVIVAL - ustaw początkową prędkość
  if (game.gameMode === "SURVIVAL") {
    game.survivalSpeedMultiplier = 1.0;
  }

  // TARGET_PRACTICE - spawn cele
  if (game.gameMode === "TARGET_PRACTICE") {
    game.timeAttackEndTime = Date.now() + modeConfig.duration * 1000;
    game.practiceTargets = [];
    game.targetsHit = 0;
    game.shotsFired = 0;
    for (let i = 0; i < modeConfig.targetsToSpawn; i++) {
      spawnPracticeTarget(canvas);
    }
  }

  // VOLLEYBALL - reset zmiennych
  if (game.gameMode === "VOLLEYBALL") {
    game.groundBounces = 0;
    game.lastGroundBouncePlayer = null;
  }

  // Prędkość piłki zależna od trybu
  const baseSpeed = CONFIG.DIFFICULTY[game.difficulty].ballSpeed;
  const speedMultiplier = modeConfig.speedMultiplier || 1;
  game.ballSpeedX =
    baseSpeed * speedMultiplier * (Math.random() > 0.5 ? 1 : -1);
  game.ballSpeedY = (Math.random() - 0.5) * 8;

  initPositions(canvas);

  // Dostosuj rozmiar canvas do pełnego ekranu
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  showScreen("game", canvas);
}

export function initPositions(canvas) {
  game.ballX = canvas.width / 2;
  game.ballY = canvas.height / 2;
  game.sizeBall = canvas.width / CONFIG.BALL_SIZE_RATIO;
  game.padHeight = canvas.height / CONFIG.PAD_HEIGHT_RATIO;
  game.pad2Height = canvas.height / CONFIG.PAD_HEIGHT_RATIO;
  game.padY = canvas.height / 2 - game.padHeight / 2;
  game.pad2Y = canvas.height / 2 - game.pad2Height / 2;
}

export function ballReset(canvas) {
  game.ballX = canvas.width / 2;
  game.ballY = canvas.height / 2;

  const baseSpeed = CONFIG.DIFFICULTY[game.difficulty].ballSpeed;
  const modeConfig = CONFIG.GAME_MODES[game.gameMode];
  const speedMultiplier = modeConfig.speedMultiplier || 1;

  // SURVIVAL - zwiększaj prędkość przy każdym resecie
  if (game.gameMode === "SURVIVAL") {
    game.survivalSpeedMultiplier = (game.survivalSpeedMultiplier || 1.0) + 0.1;
    game.ballSpeedX =
      baseSpeed *
      speedMultiplier *
      game.survivalSpeedMultiplier *
      (Math.random() > 0.5 ? 1 : -1);
    game.ballSpeedY = (Math.random() - 0.5) * 8 * game.survivalSpeedMultiplier;
  } else {
    game.ballSpeedX =
      baseSpeed * speedMultiplier * (Math.random() > 0.5 ? 1 : -1);
    game.ballSpeedY = (Math.random() - 0.5) * 8;
  }
}

export function checkGameMode(canvas) {
  const modeConfig = CONFIG.GAME_MODES[game.gameMode];

  // TIME_ATTACK - sprawdź czy czas minął
  if (game.gameMode === "TIME_ATTACK") {
    if (Date.now() >= game.timeAttackEndTime) {
      endGame();
      return true;
    }
  }

  // Sprawdź wynik dla trybów z limitem punktów
  if (modeConfig.winScore) {
    if (
      game.plScore >= modeConfig.winScore ||
      game.aiScore >= modeConfig.winScore
    ) {
      endGame();
      return true;
    }
  }

  return false;
}

export function endGame() {
  game.state = "gameover";

  // Zapisz najlepszy wynik
  const finalScore = Math.max(game.plScore, game.aiScore);
  if (finalScore > game.highScore) {
    game.highScore = finalScore;
    localStorage.setItem("highScore", game.highScore);
  }

  // Zapisz grę do historii
  const gameRecord = {
    date: new Date().toISOString(),
    player1Name: game.player1Name,
    player2Name: game.player2Name,
    player1Score: game.plScore,
    player2Score: game.aiScore,
    winner: game.plScore > game.aiScore ? game.player1Name : game.player2Name,
    gameMode: game.gameMode,
    duration: game.totalGameTime,
    mode: game.mode,
  };

  game.gameHistory.unshift(gameRecord);
  if (game.gameHistory.length > 10) {
    game.gameHistory = game.gameHistory.slice(0, 10);
  }
  localStorage.setItem("gameHistory", JSON.stringify(game.gameHistory));

  // Wyczyść power-upy i przeszkody
  if (game.powerupTimer) {
    clearTimeout(game.powerupTimer);
  }
  game.powerups = [];
  game.balls = [];
  game.activePowerup = null;
  game.obstacles = [];
  game.portals = [];
  game.windZones = [];
  game.targets = [];
  game.breakoutBlocks = [];
  game.speedZones = [];
  game.barriers = [];
  game.practiceTargets = [];
  game.fireworks = [];
}

export function getRemainingTime() {
  if (game.gameMode !== "TIME_ATTACK" && game.gameMode !== "TARGET_PRACTICE")
    return null;

  const remaining = Math.max(0, game.timeAttackEndTime - Date.now());
  const seconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

// TARGET PRACTICE - spawn cel
export function spawnPracticeTarget(canvas) {
  const margin = 100;
  const target = {
    x: margin + Math.random() * (canvas.width - margin * 2),
    y: margin + Math.random() * (canvas.height - margin * 2),
    radius: 30 + Math.random() * 20,
    points: Math.floor(Math.random() * 3) + 1, // 1-3 punkty
    color: ["#ff6b6b", "#feca57", "#48dbfb"][Math.floor(Math.random() * 3)],
  };
  game.practiceTargets.push(target);
}

// Sprawdź trafienie w cel
export function checkTargetHit(ball, canvas) {
  for (let i = game.practiceTargets.length - 1; i >= 0; i--) {
    const target = game.practiceTargets[i];
    const dist = Math.hypot(ball.x - target.x, ball.y - target.y);
    if (dist < ball.size / 2 + target.radius) {
      game.targetsHit++;
      game.plScore += target.points;
      createFirework(target.x, target.y, target.color);
      game.practiceTargets.splice(i, 1);
      // Spawn nowy cel
      if (game.practiceTargets.length < 3) {
        spawnPracticeTarget(canvas);
      }
      return true;
    }
  }
  return false;
}

// FIREWORKS - fajerwerki
export function createFirework(x, y, color) {
  const particles = CONFIG.FIREWORK_PARTICLES || 50;
  for (let i = 0; i < particles; i++) {
    const angle = (Math.PI * 2 * i) / particles;
    const speed = 2 + Math.random() * 4;
    game.fireworks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

// SCREEN SHAKE - trzęsienie ekranu
export function triggerScreenShake() {
  game.screenShake.active = true;
  game.screenShake.endTime = Date.now() + CONFIG.SCREEN_SHAKE_DURATION;
}
