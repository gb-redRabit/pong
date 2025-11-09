import { game, audio } from "./state.js";
import { CONFIG } from "./config.js";

// Power-upy
export function spawnPowerup(canvas) {
  if (game.powerups.length >= 3) return;

  const types = CONFIG.POWERUP_TYPES;
  const type = types[Math.floor(Math.random() * types.length)];

  game.powerups.push({
    x: Math.random() * (canvas.width - 100) + 50,
    y: Math.random() * (canvas.height - 100) + 50,
    type: type,
    size: CONFIG.POWERUP_SIZE,
    baseSize: CONFIG.POWERUP_SIZE,
    spawnTime: Date.now(), // Czas spawnu
  });
}

export function checkPowerupCollision(canvas) {
  game.powerups.forEach((powerup, index) => {
    if (
      game.ballX < powerup.x + powerup.size &&
      game.ballX + game.sizeBall > powerup.x &&
      game.ballY < powerup.y + powerup.size &&
      game.ballY + game.sizeBall > powerup.y
    ) {
      activatePowerup(powerup.type, canvas, game.lastBallHitBy);
      game.powerups.splice(index, 1);
      audio.power.play();
    }
  });
}

export function activatePowerup(type, canvas, caughtBy) {
  game.activePowerup = type;

  // Powerupy globalne (wpływają na wszystkich)
  const globalPowerups = ["SPEED_UP", "MULTI_BALL", "INVISIBLE", "SLOW_MOTION"];
  // Powerupy dla gracza (wpływają na jednego gracza)
  const playerPowerups = [
    "BIG_PAD",
    "SMALL_PAD",
    "FREEZE",
    "REVERSE",
    "SHIELD",
    "MAGNET",
    "GHOST_PAD",
  ];

  // Przypisz do odpowiedniej kategorii
  if (globalPowerups.includes(type)) {
    game.globalPowerup = type;
  } else if (caughtBy === 1) {
    game.player1Powerup = type;
  } else if (caughtBy === 2) {
    game.player2Powerup = type;
  }

  switch (type) {
    case "SPEED_UP":
      game.ballSpeedX *= 1.5;
      game.ballSpeedY *= 1.5;
      break;
    case "BIG_PAD":
      if (caughtBy === 1) {
        game.padHeight *= 1.5;
      } else if (caughtBy === 2) {
        game.pad2Height *= 1.5;
      }
      break;
    case "SMALL_PAD":
      // Zmniejsza rakietkę przeciwnika
      if (caughtBy === 1) {
        game.pad2Height *= 0.6;
      } else if (caughtBy === 2) {
        game.padHeight *= 0.6;
      }
      break;
    case "MULTI_BALL":
      for (let i = 0; i < 2; i++) {
        game.balls.push({
          x: game.ballX,
          y: game.ballY,
          speedX: (Math.random() - 0.5) * 10,
          speedY: (Math.random() - 0.5) * 10,
        });
      }
      break;
    case "FREEZE":
      // Zamraża przeciwnika
      if (caughtBy === 1) {
        game.frozenPlayer = 2;
      } else if (caughtBy === 2) {
        game.frozenPlayer = 1;
      }
      break;
    case "INVISIBLE":
      game.invisibleBall = true;
      break;
    case "SHIELD":
      if (caughtBy === 1) {
        game.shieldPlayer1 = true;
      } else if (caughtBy === 2) {
        game.shieldPlayer2 = true;
      }
      break;
    case "REVERSE":
      // Odwraca sterowanie przeciwnika
      if (caughtBy === 1) {
        game.reversedPlayer = 2;
      } else if (caughtBy === 2) {
        game.reversedPlayer = 1;
      }
      break;
    case "SLOW_MOTION":
      // Spowolnienie gry
      game.slowMotionActive = true;
      break;
    case "MAGNET":
      // Rakietka przyciąga piłkę
      game.magnetPlayer = caughtBy;
      break;
    case "GHOST_PAD":
      // Rakietka przechodzi przez piłkę 1x
      game.ghostPadPlayer = caughtBy;
      game.ghostPadUsed = false;
      break;
  }

  if (game.powerupTimer) {
    clearTimeout(game.powerupTimer);
  }

  game.powerupTimer = setTimeout(() => {
    resetPowerup(canvas, type, caughtBy);
  }, CONFIG.POWERUP_DURATION);
}

export function resetPowerup(canvas, type, caughtBy) {
  // Wyczyść odpowiednie powerupy
  if (game.globalPowerup === type) {
    game.globalPowerup = null;
  }
  if (game.player1Powerup === type) {
    game.player1Powerup = null;
  }
  if (game.player2Powerup === type) {
    game.player2Powerup = null;
  }

  if (type === "BIG_PAD") {
    game.padHeight = canvas.height / CONFIG.PAD_HEIGHT_RATIO;
    game.pad2Height = canvas.height / CONFIG.PAD_HEIGHT_RATIO;
  }
  if (type === "SMALL_PAD") {
    game.padHeight = canvas.height / CONFIG.PAD_HEIGHT_RATIO;
    game.pad2Height = canvas.height / CONFIG.PAD_HEIGHT_RATIO;
  }
  if (type === "FREEZE") {
    game.frozenPlayer = null;
  }
  if (type === "INVISIBLE") {
    game.invisibleBall = false;
  }
  if (type === "SHIELD") {
    game.shieldPlayer1 = false;
    game.shieldPlayer2 = false;
  }
  if (type === "REVERSE") {
    game.reversedPlayer = null;
  }
  if (type === "SLOW_MOTION") {
    game.slowMotionActive = false;
  }
  if (type === "MAGNET") {
    game.magnetPlayer = null;
  }
  if (type === "GHOST_PAD") {
    game.ghostPadPlayer = null;
    game.ghostPadUsed = false;
  }

  game.activePowerup = null;
}

export function updatePowerup(canvas) {
  // Aktualizuj rozmiar power-upów (3x w ciągu 20 sekund)
  game.powerups.forEach((powerup) => {
    const elapsed = (Date.now() - powerup.spawnTime) / 1000; // sekundy
    const growthDuration = 20; // 20 sekund
    const maxScale = 3; // 3x większy

    if (elapsed < growthDuration) {
      // Liniowy wzrost od 1x do 3x w ciągu 20 sekund
      const scale = 1 + ((maxScale - 1) * elapsed) / growthDuration;
      powerup.size = powerup.baseSize * scale;
    } else {
      // Maksymalny rozmiar
      powerup.size = powerup.baseSize * maxScale;
    }
  });

  // Sprawdź tryb Chaos Mode
  if (game.gameMode === "CHAOS_MODE") {
    if (Date.now() >= game.nextChaosSpawn) {
      spawnPowerup(canvas);
      // Co 3 power-up, dodaj przeszkodę
      if (game.powerups.length % 3 === 0 && Math.random() > 0.5) {
        spawnObstacle(canvas);
      }
      game.nextChaosSpawn =
        Date.now() + CONFIG.GAME_MODES.CHAOS_MODE.powerupInterval;
    }
  } else {
    // Normalny spawn power-upów
    if (
      Date.now() - game.lastPowerupSpawn > CONFIG.POWERUP_SPAWN_INTERVAL &&
      game.powerups.length < 2
    ) {
      spawnPowerup(canvas);
      game.lastPowerupSpawn = Date.now();
    }
  }

  checkPowerupCollision(canvas);
}

// Cząsteczki
export function createParticles(x, y, count = 15) {
  for (let i = 0; i < count; i++) {
    game.particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 30,
    });
  }
}

export function updateParticles() {
  game.particles = game.particles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    return p.life > 0;
  });
}

// ========== PRZESZKODY ==========

export function spawnObstacle(canvas) {
  if (game.obstacles.length >= CONFIG.MAX_OBSTACLES) return;

  const types = CONFIG.OBSTACLE_TYPES;
  const type = types[Math.floor(Math.random() * types.length)];

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const offsetX = (Math.random() - 0.5) * 300;
  const offsetY = (Math.random() - 0.5) * 200;

  if (type === "PORTAL") {
    // Tworzymy parę portali z obszarem bezpieczeństwa
    const safeZone = 80; // Obszar bezpieczeństwa wokół portali
    const portal1 = {
      type: "PORTAL",
      x: centerX + offsetX,
      y: centerY + offsetY,
      size: CONFIG.OBSTACLE_SIZE,
      pairId: Date.now(),
      safeZone: safeZone,
    };
    const portal2 = {
      type: "PORTAL",
      x: centerX - offsetX,
      y: centerY - offsetY,
      size: CONFIG.OBSTACLE_SIZE,
      pairId: Date.now(),
      safeZone: safeZone,
    };

    // Sprawdź czy portale nie kolidują z istniejącymi przeszkodami
    const isSafe = !game.obstacles.some((obs) => {
      const dist1 = Math.hypot(obs.x - portal1.x, obs.y - portal1.y);
      const dist2 = Math.hypot(obs.x - portal2.x, obs.y - portal2.y);
      return dist1 < safeZone || dist2 < safeZone;
    });

    if (isSafe) {
      game.portals.push(portal1, portal2);
    }
  } else if (type === "WIND") {
    game.windZones.push({
      type: "WIND",
      x: centerX + offsetX,
      y: centerY + offsetY,
      width: 100,
      height: 150,
      direction: Math.random() > 0.5 ? 1 : -1, // 1 = prawo, -1 = lewo
    });
  } else if (type === "TARGET") {
    game.targets.push({
      type: "TARGET",
      x: centerX + offsetX,
      y: centerY + offsetY,
      size: CONFIG.OBSTACLE_SIZE,
      hit: false,
    });
  } else if (type === "MOVING_BLOCK") {
    game.obstacles.push({
      type: "MOVING_BLOCK",
      x: centerX,
      y: centerY + offsetY,
      size: CONFIG.OBSTACLE_SIZE,
      speedX: CONFIG.MOVING_SPEED * (Math.random() > 0.5 ? 1 : -1),
      speedY: CONFIG.MOVING_SPEED * (Math.random() > 0.5 ? 1 : -1),
    });
  } else if (type === "BREAKOUT_BLOCK") {
    // Zniszczalne bloki - wymagają kilku trafień
    game.breakoutBlocks.push({
      type: "BREAKOUT_BLOCK",
      x: centerX + offsetX,
      y: centerY + offsetY,
      size: CONFIG.OBSTACLE_SIZE,
      hits: CONFIG.BREAKOUT_BLOCK_HITS,
      maxHits: CONFIG.BREAKOUT_BLOCK_HITS,
    });
  } else if (type === "SPEED_ZONE") {
    // Strefa przyspieszająca
    game.speedZones.push({
      type: "SPEED_ZONE",
      x: centerX + offsetX,
      y: centerY + offsetY,
      width: 120,
      height: 120,
      multiplier: CONFIG.SPEED_ZONE_MULTIPLIER,
    });
  } else if (type === "BARRIER") {
    // Czasowa bariera
    game.barriers.push({
      type: "BARRIER",
      x: centerX + offsetX,
      y: centerY + offsetY,
      width: 10,
      height: 150,
      createdAt: Date.now(),
      duration: CONFIG.BARRIER_DURATION,
    });
  } else {
    // BLOCK
    game.obstacles.push({
      type: "BLOCK",
      x: centerX + offsetX,
      y: centerY + offsetY,
      size: CONFIG.OBSTACLE_SIZE,
    });
  }
}

export function updateObstacles(canvas) {
  // Aktualizuj ruchome przeszkody
  game.obstacles.forEach((obs) => {
    if (obs.type === "MOVING_BLOCK") {
      obs.x += obs.speedX;
      obs.y += obs.speedY;

      // Odbij od krawędzi
      if (obs.x <= 50 || obs.x >= canvas.width - 50) {
        obs.speedX = -obs.speedX;
      }
      if (obs.y <= 50 || obs.y >= canvas.height - 50) {
        obs.speedY = -obs.speedY;
      }
    }
  });
}

export function checkObstacleCollision(canvas) {
  // Kolizja z blokami
  game.obstacles.forEach((obs) => {
    if (
      game.ballX < obs.x + obs.size &&
      game.ballX + game.sizeBall > obs.x &&
      game.ballY < obs.y + obs.size &&
      game.ballY + game.sizeBall > obs.y
    ) {
      // Odbij piłkę
      const ballCenterX = game.ballX + game.sizeBall / 2;
      const ballCenterY = game.ballY + game.sizeBall / 2;
      const obsCenterX = obs.x + obs.size / 2;
      const obsCenterY = obs.y + obs.size / 2;

      const dx = ballCenterX - obsCenterX;
      const dy = ballCenterY - obsCenterY;

      if (Math.abs(dx) > Math.abs(dy)) {
        game.ballSpeedX = -game.ballSpeedX;
      } else {
        game.ballSpeedY = -game.ballSpeedY;
      }

      createParticles(game.ballX, game.ballY, 20);
    }
  });

  // Kolizja z portalami
  game.portals.forEach((portal, index) => {
    if (
      game.ballX < portal.x + portal.size &&
      game.ballX + game.sizeBall > portal.x &&
      game.ballY < portal.y + portal.size &&
      game.ballY + game.sizeBall > portal.y
    ) {
      // Znajdź drugi portal z tą samą parą
      const otherPortal = game.portals.find(
        (p, i) => p.pairId === portal.pairId && i !== index
      );
      if (otherPortal) {
        game.ballX = otherPortal.x;
        game.ballY = otherPortal.y;
        createParticles(otherPortal.x, otherPortal.y, 30);
        audio.power.play();
      }
    }
  });

  // Wpływ wiatru
  game.windZones.forEach((wind) => {
    if (
      game.ballX > wind.x &&
      game.ballX < wind.x + wind.width &&
      game.ballY > wind.y &&
      game.ballY < wind.y + wind.height
    ) {
      game.ballSpeedX += wind.direction * CONFIG.WIND_STRENGTH * 0.1;
    }
  });

  // Kolizja z celami
  game.targets.forEach((target) => {
    if (
      !target.hit &&
      game.ballX < target.x + target.size &&
      game.ballX + game.sizeBall > target.x &&
      game.ballY < target.y + target.size &&
      game.ballY + game.sizeBall > target.y
    ) {
      target.hit = true;
      // Bonus punktów dla ostatniego gracza który odbił
      if (game.lastBallHitBy === 1) {
        game.plScore += CONFIG.TARGET_POINTS;
      } else if (game.lastBallHitBy === 2) {
        game.aiScore += CONFIG.TARGET_POINTS;
      }
      createParticles(target.x, target.y, 50);
      audio.score.play();

      // Usuń trafiony cel po chwili
      setTimeout(() => {
        game.targets = game.targets.filter((t) => t !== target);
      }, 100);
    }
  });

  // Kolizja z Breakout Blocks - zniszczalne
  game.breakoutBlocks.forEach((block, index) => {
    if (
      game.ballX < block.x + block.size &&
      game.ballX + game.sizeBall > block.x &&
      game.ballY < block.y + block.size &&
      game.ballY + game.sizeBall > block.y
    ) {
      block.hits--;

      // Odbij piłkę
      const ballCenterX = game.ballX + game.sizeBall / 2;
      const ballCenterY = game.ballY + game.sizeBall / 2;
      const blockCenterX = block.x + block.size / 2;
      const blockCenterY = block.y + block.size / 2;
      const dx = ballCenterX - blockCenterX;
      const dy = ballCenterY - blockCenterY;

      if (Math.abs(dx) > Math.abs(dy)) {
        game.ballSpeedX = -game.ballSpeedX;
      } else {
        game.ballSpeedY = -game.ballSpeedY;
      }

      createParticles(game.ballX, game.ballY, 30);
      audio.hit.play();

      // Usuń jeśli zniszczony
      if (block.hits <= 0) {
        game.breakoutBlocks.splice(index, 1);
        createParticles(block.x, block.y, 50);
        audio.power.play();
      }
    }
  });

  // Speed Zone - przyspieszenie
  game.speedZones.forEach((zone) => {
    if (
      game.ballX > zone.x &&
      game.ballX < zone.x + zone.width &&
      game.ballY > zone.y &&
      game.ballY < zone.y + zone.height
    ) {
      // Zwiększ prędkość stopniowo
      game.ballSpeedX *= 1.02;
      game.ballSpeedY *= 1.02;
    }
  });

  // Barrier - odbicie od bariery
  game.barriers.forEach((barrier) => {
    // Usuń jeśli minął czas
    if (Date.now() - barrier.createdAt > barrier.duration) {
      game.barriers = game.barriers.filter((b) => b !== barrier);
      return;
    }

    if (
      game.ballX < barrier.x + barrier.width &&
      game.ballX + game.sizeBall > barrier.x &&
      game.ballY < barrier.y + barrier.height &&
      game.ballY + game.sizeBall > barrier.y
    ) {
      game.ballSpeedX = -game.ballSpeedX;
      createParticles(game.ballX, game.ballY, 15);
      audio.hit.play();
    }
  });
}

// UPDATE EFEKTÓW WIZUALNYCH
export function updateVisualEffects() {
  // Screen shake
  if (game.screenShake.active) {
    if (Date.now() < game.screenShake.endTime) {
      const intensity = CONFIG.SCREEN_SHAKE_INTENSITY;
      game.screenShake.offsetX = (Math.random() - 0.5) * intensity;
      game.screenShake.offsetY = (Math.random() - 0.5) * intensity;
    } else {
      game.screenShake.active = false;
      game.screenShake.offsetX = 0;
      game.screenShake.offsetY = 0;
    }
  }

  // Fireworks
  game.fireworks = game.fireworks.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1; // grawitacja
    p.life -= 0.02;
    return p.life > 0;
  });

  // Aktualizuj animacje shielda
  game.shieldAnimations = game.shieldAnimations.filter(
    (anim) => Date.now() - anim.startTime < 500
  );
}
