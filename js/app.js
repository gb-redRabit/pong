// Główny plik aplikacji Pong
import { game, controls, keys, audio } from "./modules/state.js";
import { CONFIG } from "./modules/config.js";
import {
  showScreen,
  updateMenuDisplay,
  setDifficulty,
  selectMode,
  setControlType,
  assignKey,
  setTheme,
  updateSettingsDisplay,
  setCanvas,
} from "./modules/ui.js";
import {
  startGame,
  initPositions,
  ballReset,
  checkGameMode,
  getRemainingTime,
  checkTargetHit,
  createFirework,
  triggerScreenShake,
} from "./modules/game.js";
import {
  spawnPowerup,
  checkPowerupCollision,
  updatePowerup,
  createParticles,
  updateParticles,
  spawnObstacle,
  updateObstacles,
  checkObstacleCollision,
  updateVisualEffects,
} from "./modules/powerups.js";

// Canvas
const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

// Ustaw canvas w modułach
setCanvas(canvas);

// Eksportuj funkcje do window dla onclick
window.showScreen = (id) => showScreen(id, canvas);
window.startGame = (mode) => startGame(mode, canvas);
window.setDifficulty = setDifficulty;
window.selectMode = selectMode;
window.setControlType = setControlType;
window.assignKey = assignKey;
window.setTheme = setTheme;

// AI Movement
function aiMovePad() {
  if (game.mode === "single" && game.frozenPlayer !== 2) {
    const aiSpeed = CONFIG.DIFFICULTY[game.difficulty].aiSpeed;
    const pad2Center = game.pad2Y + game.pad2Height / 2;
    const ballCenter = game.ballY + game.sizeBall / 2;

    if (pad2Center < ballCenter - 35) {
      game.pad2Y = Math.min(
        canvas.height - game.pad2Height,
        game.pad2Y + CONFIG.PAD_SPEED_BASE * aiSpeed
      );
    } else if (pad2Center > ballCenter + 35) {
      game.pad2Y = Math.max(0, game.pad2Y - CONFIG.PAD_SPEED_BASE * aiSpeed);
    }
  }
}

// Obsługa myszy
function calMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;

  if (controls.player1.type === "mouse" && game.frozenPlayer !== 1) {
    game.padY = Math.max(
      0,
      Math.min(canvas.height - game.padHeight, mouseY - game.padHeight / 2)
    );
  }

  if (
    game.mode === "two-player" &&
    controls.player2.type === "mouse" &&
    game.frozenPlayer !== 2
  ) {
    game.pad2Y = Math.max(
      0,
      Math.min(canvas.height - game.pad2Height, mouseY - game.pad2Height / 2)
    );
  }
}

// Obsługa kliknięć
function handleClick(e) {
  if (game.state === "paused") {
    game.state = "playing";
  } else if (game.state === "gameover") {
    showScreen("menuScreen", canvas);
  }
}

// Główna logika ruchu
function moveElements() {
  if (game.state !== "playing") return;

  // Sterowanie klawiaturą - Gracz 1
  if (controls.player1.type === "keyboard" && game.frozenPlayer !== 1) {
    const reversed = game.reversedPlayer === 1;
    if (keys[controls.player1.keyUp]) {
      game.padY = reversed
        ? Math.min(
            canvas.height - game.padHeight,
            game.padY + controls.player1.speed
          )
        : Math.max(0, game.padY - controls.player1.speed);
    }
    if (keys[controls.player1.keyDown]) {
      game.padY = reversed
        ? Math.max(0, game.padY - controls.player1.speed)
        : Math.min(
            canvas.height - game.padHeight,
            game.padY + controls.player1.speed
          );
    }
  }

  // Sterowanie klawiaturą - Gracz 2
  if (
    game.mode === "two-player" &&
    controls.player2.type === "keyboard" &&
    game.frozenPlayer !== 2
  ) {
    const reversed = game.reversedPlayer === 2;
    if (keys[controls.player2.keyUp]) {
      game.pad2Y = reversed
        ? Math.min(
            canvas.height - game.pad2Height,
            game.pad2Y + controls.player2.speed
          )
        : Math.max(0, game.pad2Y - controls.player2.speed);
    }
    if (keys[controls.player2.keyDown]) {
      game.pad2Y = reversed
        ? Math.max(0, game.pad2Y - controls.player2.speed)
        : Math.min(
            canvas.height - game.pad2Height,
            game.pad2Y + controls.player2.speed
          );
    }
  }

  aiMovePad();

  // Efekt slow motion
  const speedMultiplier = game.slowMotionActive ? 0.5 : 1;

  // Ruch piłki
  game.ballX += game.ballSpeedX * speedMultiplier;
  game.ballY += game.ballSpeedY * speedMultiplier;

  // Efekt magnesu
  if (game.magnetPlayer) {
    const magnetPadY = game.magnetPlayer === 1 ? game.padY : game.pad2Y;
    const magnetPadHeight =
      game.magnetPlayer === 1 ? game.padHeight : game.pad2Height;
    const magnetPadX =
      game.magnetPlayer === 1
        ? CONFIG.PAD_WIDTH
        : canvas.width - CONFIG.PAD_WIDTH;
    const magnetPadCenterY = magnetPadY + magnetPadHeight / 2;
    const ballCenterY = game.ballY + game.sizeBall / 2;

    // Przyciąganie piłki w kierunku Y rakietki
    const attractionStrength = 0.3;
    const distance = Math.abs(game.ballX - magnetPadX);
    if (distance < 200) {
      // Zakres magnesu
      const pull =
        (magnetPadCenterY - ballCenterY) *
        attractionStrength *
        (1 - distance / 200);
      game.ballSpeedY += pull;
    }
  }

  // Odbicia od góry i dołu
  if (game.ballY <= 0 || game.ballY + game.sizeBall >= canvas.height) {
    game.ballSpeedY = -game.ballSpeedY;
    createParticles(game.ballX, game.ballY);
    audio.hit.play().catch(() => {});
  }

  // Kolizja z lewą rakietką (gracz 1)
  if (
    game.ballX <= CONFIG.PAD_WIDTH &&
    game.ballY + game.sizeBall >= game.padY &&
    game.ballY <= game.padY + game.padHeight
  ) {
    // Ghost Pad - przechodzi przez piłkę 1x
    if (game.ghostPadPlayer === 1 && !game.ghostPadUsed) {
      game.ghostPadUsed = true;
      createParticles(game.ballX, game.ballY, 30);
      // Nie odbija piłki
    } else if (!game.shieldPlayer1) {
      game.ballSpeedX = Math.abs(game.ballSpeedX) * 1.05;
      const hitPos = (game.ballY - game.padY) / game.padHeight - 0.5;
      game.ballSpeedY = hitPos * 15;
      game.lastBallHitBy = 1; // Gracz 1 odbił
      createParticles(game.ballX, game.ballY);
      audio.hit.play().catch(() => {});
      // Screen shake przy mocnym uderzeniu
      if (Math.abs(game.ballSpeedX) > 8) {
        triggerScreenShake();
      }
    }
  }

  // Kolizja z prawą rakietką (gracz 2/AI)
  if (
    game.ballX + game.sizeBall >= canvas.width - CONFIG.PAD_WIDTH &&
    game.ballY + game.sizeBall >= game.pad2Y &&
    game.ballY <= game.pad2Y + game.pad2Height
  ) {
    // Ghost Pad - przechodzi przez piłkę 1x
    if (game.ghostPadPlayer === 2 && !game.ghostPadUsed) {
      game.ghostPadUsed = true;
      createParticles(game.ballX, game.ballY, 30);
      // Nie odbija piłki
    } else if (!game.shieldPlayer2) {
      game.ballSpeedX = -Math.abs(game.ballSpeedX) * 1.05;
      const hitPos = (game.ballY - game.pad2Y) / game.pad2Height - 0.5;
      game.ballSpeedY = hitPos * 15;
      game.lastBallHitBy = 2; // Gracz 2 odbił
      createParticles(game.ballX, game.ballY);
      audio.hit.play().catch(() => {});
      // Screen shake przy mocnym uderzeniu
      if (Math.abs(game.ballSpeedX) > 8) {
        triggerScreenShake();
      }
    }
  }

  // Punkt dla gracza 2
  if (game.ballX <= 0 && !game.shieldPlayer1) {
    game.aiScore++;
    audio.score.play().catch(() => {});
    createFirework((canvas.width / 4) * 3, canvas.height / 2, "#32f051");
    triggerScreenShake();
    ballReset(canvas);
    if (checkGameMode(canvas)) return;
  }

  // Punkt dla gracza 1
  if (game.ballX + game.sizeBall >= canvas.width && !game.shieldPlayer2) {
    game.plScore++;
    audio.score.play().catch(() => {});
    createFirework(canvas.width / 4, canvas.height / 2, "#32f051");
    triggerScreenShake();
    ballReset(canvas);
    if (checkGameMode(canvas)) return;
  }

  // Multi-ball
  game.balls.forEach((ball, index) => {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    if (ball.y <= 0 || ball.y >= canvas.height) {
      ball.speedY = -ball.speedY;
    }

    if (ball.x <= 0 || ball.x >= canvas.width) {
      game.balls.splice(index, 1);
    }
  });

  // Power-upy
  updatePowerup(canvas);
  updateParticles();

  // Przeszkody
  updateObstacles(canvas);
  checkObstacleCollision(canvas);

  // Aktualizuj całkowity czas gry
  if (game.gameStartTime) {
    game.totalGameTime = (Date.now() - game.gameStartTime) / 1000;
  }

  // Efekty wizualne
  updateVisualEffects();

  // TARGET PRACTICE - sprawdź trafienie w cel
  if (game.gameMode === "TARGET_PRACTICE") {
    if (
      checkTargetHit(
        { x: game.ballX, y: game.ballY, size: game.sizeBall },
        canvas
      )
    ) {
      triggerScreenShake();
    }
    game.shotsFired = game.plScore + game.aiScore;
  }

  // VOLLEYBALL - sprawdź odbicie od podłoża
  if (game.gameMode === "VOLLEYBALL") {
    if (game.ballY + game.sizeBall >= canvas.height) {
      game.ballSpeedY = -Math.abs(game.ballSpeedY) * 0.8;
      game.ballSpeedY += CONFIG.GAME_MODES.VOLLEYBALL.gravity || 0.3;
      game.groundBounces++;
      if (game.lastBallHitBy) {
        game.lastGroundBouncePlayer = game.lastBallHitBy;
      }
      createParticles(game.ballX, canvas.height - 10, 20);
    }
  }
}

// Rysowanie elementów
function drawElements() {
  // Screen shake effect
  ctx.save();
  if (game.screenShake.active) {
    ctx.translate(game.screenShake.offsetX, game.screenShake.offsetY);
  }

  // Tło
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Linia środkowa
  ctx.strokeStyle = "rgba(50, 240, 81, 0.3)";
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 15]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Rakietki
  ctx.fillStyle = "#32f051";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#32f051";
  ctx.fillRect(0, game.padY, CONFIG.PAD_WIDTH, game.padHeight);
  ctx.fillRect(
    canvas.width - CONFIG.PAD_WIDTH,
    game.pad2Y,
    CONFIG.PAD_WIDTH,
    game.pad2Height
  );

  // Efekt Shield - linia ochronna
  if (game.shieldPlayer1) {
    ctx.strokeStyle = "#ffaa00";
    ctx.lineWidth = 5;
    ctx.shadowBlur = 30;
    ctx.shadowColor = "#ffaa00";
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(CONFIG.PAD_WIDTH + 5, 0);
    ctx.lineTo(CONFIG.PAD_WIDTH + 5, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Animowane pulsujące punkty
    const time = Date.now() / 100;
    for (let i = 0; i < 10; i++) {
      const y = ((i * canvas.height) / 10 + time * 20) % canvas.height;
      ctx.fillStyle = "#ffaa00";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(CONFIG.PAD_WIDTH + 5, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (game.shieldPlayer2) {
    ctx.strokeStyle = "#ffaa00";
    ctx.lineWidth = 5;
    ctx.shadowBlur = 30;
    ctx.shadowColor = "#ffaa00";
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width - CONFIG.PAD_WIDTH - 5, 0);
    ctx.lineTo(canvas.width - CONFIG.PAD_WIDTH - 5, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Animowane pulsujące punkty
    const time = Date.now() / 100;
    for (let i = 0; i < 10; i++) {
      const y = ((i * canvas.height) / 10 + time * 20) % canvas.height;
      ctx.fillStyle = "#ffaa00";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(canvas.width - CONFIG.PAD_WIDTH - 5, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Efekt Magnet - pole przyciągające
  if (game.magnetPlayer) {
    const magnetX =
      game.magnetPlayer === 1
        ? CONFIG.PAD_WIDTH
        : canvas.width - CONFIG.PAD_WIDTH;
    const magnetY =
      game.magnetPlayer === 1
        ? game.padY + game.padHeight / 2
        : game.pad2Y + game.pad2Height / 2;

    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff00ff";

    // Rysuj koncentryczne okręgi
    for (let i = 1; i <= 3; i++) {
      const radius = 50 * i + ((Date.now() / 50) % 50);
      ctx.globalAlpha = 0.3 - i * 0.1;
      ctx.beginPath();
      ctx.arc(magnetX, magnetY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Efekt Ghost Pad - półprzezroczysta rakietka
  if (game.ghostPadPlayer === 1 && !game.ghostPadUsed) {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#aa00aa";
    ctx.shadowBlur = 30;
    ctx.shadowColor = "#aa00aa";
    ctx.fillRect(0, game.padY, CONFIG.PAD_WIDTH, game.padHeight);
    ctx.globalAlpha = 1;
  }

  if (game.ghostPadPlayer === 2 && !game.ghostPadUsed) {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#aa00aa";
    ctx.shadowBlur = 30;
    ctx.shadowColor = "#aa00aa";
    ctx.fillRect(
      canvas.width - CONFIG.PAD_WIDTH,
      game.pad2Y,
      CONFIG.PAD_WIDTH,
      game.pad2Height
    );
    ctx.globalAlpha = 1;
  }

  // Piłka - OKRĄGŁA
  if (!game.invisibleBall) {
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(
      game.ballX + game.sizeBall / 2,
      game.ballY + game.sizeBall / 2,
      game.sizeBall / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Multi-balls - OKRĄGŁE
  game.balls.forEach((ball) => {
    ctx.fillStyle = "#ff3";
    ctx.shadowColor = "#ff3";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, game.sizeBall / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Power-upy na planszy - RÓŻNE KSZTAŁTY
  game.powerups.forEach((powerup) => {
    const colors = {
      SPEED_UP: "#ff3",
      BIG_PAD: "#3f3",
      SMALL_PAD: "#f33",
      MULTI_BALL: "#3af",
      FREEZE: "#0ff",
      INVISIBLE: "#a0a",
      SHIELD: "#fa0",
      REVERSE: "#f0f",
      SLOW_MOTION: "#88f",
      MAGNET: "#f0f",
      GHOST_PAD: "#a0a",
    };
    ctx.fillStyle = colors[powerup.type] || "#fff";
    ctx.shadowColor = colors[powerup.type] || "#fff";
    ctx.shadowBlur = 20;

    ctx.beginPath();
    const centerX = powerup.x + powerup.size / 2;
    const centerY = powerup.y + powerup.size / 2;
    const radius = powerup.size / 2;

    // Różne kształty dla różnych power-upów
    switch (powerup.type) {
      case "SPEED_UP": // Trójkąt
        ctx.moveTo(centerX, centerY - radius);
        ctx.lineTo(centerX + radius, centerY + radius);
        ctx.lineTo(centerX - radius, centerY + radius);
        ctx.closePath();
        break;
      case "BIG_PAD": // Sześciokąt
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
      case "SMALL_PAD": // Kwadrat
        ctx.rect(powerup.x, powerup.y, powerup.size, powerup.size);
        break;
      case "MULTI_BALL": // Koło
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        break;
      case "FREEZE": // Gwiazda 4-ramienna
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI / 4) * i;
          const r = i % 2 === 0 ? radius : radius / 2;
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
      case "INVISIBLE": // Diament
        ctx.moveTo(centerX, centerY - radius);
        ctx.lineTo(centerX + radius, centerY);
        ctx.lineTo(centerX, centerY + radius);
        ctx.lineTo(centerX - radius, centerY);
        ctx.closePath();
        break;
      case "SHIELD": // Pięciokąt
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
      case "REVERSE": // Gwiazda 5-ramienna
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI / 5) * i;
          const r = i % 2 === 0 ? radius : radius / 2;
          const x = centerX + r * Math.cos(angle - Math.PI / 2);
          const y = centerY + r * Math.sin(angle - Math.PI / 2);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
      case "SLOW_MOTION": // Spirala
        for (let i = 0; i < 20; i++) {
          const angle = (Math.PI / 10) * i;
          const r = (radius / 20) * i;
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        break;
      case "MAGNET": // Krzyż magnetyczny
        ctx.moveTo(centerX - radius, centerY);
        ctx.lineTo(centerX + radius, centerY);
        ctx.moveTo(centerX, centerY - radius);
        ctx.lineTo(centerX, centerY + radius);
        ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
        break;
      case "GHOST_PAD": // Krzyżyk duchowy
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI / 4) * i;
          const innerR = i % 2 === 0 ? 0 : radius;
          const x = centerX + innerR * Math.cos(angle);
          const y = centerY + innerR * Math.sin(angle);
          if (i === 0) ctx.moveTo(centerX, centerY);
          ctx.lineTo(x, y);
          ctx.moveTo(centerX, centerY);
        }
        break;
    }
    ctx.fill();
  });

  // Przeszkody - BLOKI
  game.obstacles.forEach((obs) => {
    ctx.fillStyle = obs.type === "MOVING_BLOCK" ? "#f90" : "#666";
    ctx.shadowColor = obs.type === "MOVING_BLOCK" ? "#f90" : "#666";
    ctx.shadowBlur = 15;
    ctx.fillRect(obs.x, obs.y, obs.size, obs.size);

    // Dodaj krzyżyk na bloku
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(obs.x, obs.y);
    ctx.lineTo(obs.x + obs.size, obs.y + obs.size);
    ctx.moveTo(obs.x + obs.size, obs.y);
    ctx.lineTo(obs.x, obs.y + obs.size);
    ctx.stroke();
  });

  // Portale
  game.portals.forEach((portal) => {
    const time = Date.now() / 100;

    // Obszar bezpieczeństwa (strefa no-spawn)
    if (portal.safeZone) {
      ctx.fillStyle = "rgba(0, 255, 255, 0.05)";
      ctx.beginPath();
      ctx.arc(
        portal.x + portal.size / 2,
        portal.y + portal.size / 2,
        portal.safeZone,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.fillStyle = "#0ff";
    ctx.shadowColor = "#0ff";
    ctx.shadowBlur = 30;

    // Animowany wirujący portal
    ctx.save();
    ctx.translate(portal.x + portal.size / 2, portal.y + portal.size / 2);
    ctx.rotate(time * 0.1);

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i;
      const r1 = portal.size / 4;
      const r2 = portal.size / 2;
      ctx.beginPath();
      ctx.moveTo(r1 * Math.cos(angle), r1 * Math.sin(angle));
      ctx.lineTo(r2 * Math.cos(angle), r2 * Math.sin(angle));
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#0ff";
      ctx.stroke();
    }

    ctx.restore();
  });

  // Strefy wiatru
  game.windZones.forEach((wind) => {
    ctx.fillStyle = "rgba(150, 200, 255, 0.2)";
    ctx.fillRect(wind.x, wind.y, wind.width, wind.height);

    // Animowane strzałki wiatru
    const time = Date.now() / 100;
    const arrowY = (time * 5) % wind.height;
    for (let y = arrowY; y < wind.height; y += 30) {
      ctx.strokeStyle = "rgba(100, 150, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const arrowX = wind.x + (wind.direction > 0 ? 10 : wind.width - 10);
      const arrowEndX = arrowX + wind.direction * 30;
      ctx.moveTo(arrowX, wind.y + y);
      ctx.lineTo(arrowEndX, wind.y + y);
      ctx.lineTo(arrowEndX - wind.direction * 8, wind.y + y - 5);
      ctx.moveTo(arrowEndX, wind.y + y);
      ctx.lineTo(arrowEndX - wind.direction * 8, wind.y + y + 5);
      ctx.stroke();
    }
  });

  // Cele (targets)
  game.targets.forEach((target) => {
    if (!target.hit) {
      ctx.strokeStyle = "#ff0";
      ctx.shadowColor = "#ff0";
      ctx.shadowBlur = 20;
      ctx.lineWidth = 3;

      // Rysuj cel z koncentrycznymi okręgami
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(
          target.x + target.size / 2,
          target.y + target.size / 2,
          (target.size / 6) * i,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // Krzyżyk celowniczy
      ctx.beginPath();
      ctx.moveTo(target.x + target.size / 2 - 15, target.y + target.size / 2);
      ctx.lineTo(target.x + target.size / 2 + 15, target.y + target.size / 2);
      ctx.moveTo(target.x + target.size / 2, target.y + target.size / 2 - 15);
      ctx.lineTo(target.x + target.size / 2, target.y + target.size / 2 + 15);
      ctx.stroke();
    }
  });

  // Breakout Blocks - zniszczalne
  game.breakoutBlocks.forEach((block) => {
    const healthPercent = block.hits / block.maxHits;
    const red = Math.floor(255 * (1 - healthPercent));
    const green = Math.floor(200 * healthPercent);
    ctx.fillStyle = `rgb(${red}, ${green}, 100)`;
    ctx.shadowColor = `rgb(${red}, ${green}, 100)`;
    ctx.shadowBlur = 15;
    ctx.fillRect(block.x, block.y, block.size, block.size);

    // Numer trafień pozostałych
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px 'Courier New'";
    ctx.textAlign = "center";
    ctx.shadowBlur = 5;
    ctx.fillText(
      block.hits,
      block.x + block.size / 2,
      block.y + block.size / 2 + 7
    );

    // Ramka
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(block.x, block.y, block.size, block.size);
  });

  // Speed Zones - strefy przyspieszenia
  game.speedZones.forEach((zone) => {
    // Gradient tła
    const gradient = ctx.createRadialGradient(
      zone.x + zone.width / 2,
      zone.y + zone.height / 2,
      0,
      zone.x + zone.width / 2,
      zone.y + zone.height / 2,
      zone.width / 2
    );
    gradient.addColorStop(0, "rgba(255, 200, 0, 0.4)");
    gradient.addColorStop(1, "rgba(255, 100, 0, 0.1)");
    ctx.fillStyle = gradient;
    ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

    // Animowane strzałki przyspieszenia
    const time = Date.now() / 50;
    for (let i = 0; i < 3; i++) {
      const offset = (time + i * 30) % 90;
      ctx.strokeStyle = `rgba(255, 150, 0, ${0.8 - offset / 120})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(zone.x + 20, zone.y + zone.height / 2 + offset - 30);
      ctx.lineTo(zone.x + 40, zone.y + zone.height / 2 + offset - 30);
      ctx.lineTo(zone.x + 35, zone.y + zone.height / 2 + offset - 35);
      ctx.moveTo(zone.x + 40, zone.y + zone.height / 2 + offset - 30);
      ctx.lineTo(zone.x + 35, zone.y + zone.height / 2 + offset - 25);
      ctx.stroke();
    }

    // Napis
    ctx.fillStyle = "rgba(255, 200, 0, 0.6)";
    ctx.font = "bold 14px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("SPEED", zone.x + zone.width / 2, zone.y + zone.height / 2);
  });

  // Barriers - czasowe bariery
  game.barriers.forEach((barrier) => {
    const timeLeft = barrier.duration - (Date.now() - barrier.createdAt);
    const alpha = Math.min(1, timeLeft / 1000);

    // Migająca bariera
    const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(100, 200, 255, ${alpha * pulse * 0.5})`;
    ctx.shadowColor = "#6cf";
    ctx.shadowBlur = 20;
    ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);

    // Obramowanie
    ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(barrier.x, barrier.y, barrier.width, barrier.height);

    // Timer
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.font = "bold 10px 'Courier New'";
    ctx.textAlign = "center";
    ctx.save();
    ctx.translate(
      barrier.x + barrier.width / 2,
      barrier.y + barrier.height / 2
    );
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${Math.ceil(timeLeft / 1000)}s`, 0, 3);
    ctx.restore();
  });

  // Cząsteczki - okrągłe
  game.particles.forEach((p) => {
    ctx.fillStyle = `rgba(50, 240, 81, ${p.life / 30})`;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Fajerwerki
  game.fireworks.forEach((p) => {
    ctx.fillStyle = p.color.replace(")", `, ${p.life})`).replace("rgb", "rgba");
    ctx.shadowBlur = 10;
    ctx.shadowColor = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // TARGET PRACTICE - cele
  game.practiceTargets.forEach((target) => {
    ctx.fillStyle = target.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = target.color;
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
    ctx.fill();

    // Punkty w środku celu
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.shadowBlur = 0;
    ctx.fillText(`${target.points}`, target.x, target.y + 7);
  });

  ctx.shadowBlur = 0;

  // Wynik
  ctx.font = "bold 48px 'Courier New'";
  ctx.fillStyle = "#32f051";
  ctx.textAlign = "center";
  ctx.fillText(game.plScore, canvas.width / 4, 60);
  ctx.fillText(game.aiScore, (canvas.width * 3) / 4, 60);

  // Zegar - czas gry (środek, wyżej)
  ctx.font = "bold 20px 'Courier New'";
  ctx.textAlign = "center";
  const minutes = Math.floor(game.totalGameTime / 60);
  const seconds = Math.floor(game.totalGameTime % 60);
  ctx.fillStyle = "#32f051";
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#32f051";
  ctx.fillText(
    `⏱ ${minutes}:${seconds.toString().padStart(2, "0")}`,
    canvas.width / 2,
    30
  );

  // Time Attack timer (środek góra, zamiast zegara)
  if (game.gameMode === "TIME_ATTACK") {
    const timeStr = getRemainingTime();
    ctx.font = "bold 24px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ff3333";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ff3333";
    ctx.fillText(`⏰ ${timeStr}`, canvas.width / 2, 30);
  }

  // Target Practice - statystyki
  if (game.gameMode === "TARGET_PRACTICE") {
    const timeStr = getRemainingTime();
    ctx.font = "bold 20px 'Courier New'";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ff6b6b";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ff6b6b";
    ctx.fillText(`⏰ ${timeStr}`, 20, 40);
    ctx.fillStyle = "#feca57";
    ctx.fillText(`🎯 Trafienia: ${game.targetsHit}`, 20, 70);
    const accuracy =
      game.shotsFired > 0
        ? ((game.targetsHit / game.shotsFired) * 100).toFixed(1)
        : 0;
    ctx.fillStyle = "#48dbfb";
    ctx.fillText(`🎲 Celność: ${accuracy}%`, 20, 100);
  }

  // Volleyball - informacje o odbiciu od podłoża
  if (game.gameMode === "VOLLEYBALL") {
    ctx.font = "bold 18px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillStyle = "#32f051";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#32f051";
    ctx.fillText(
      `🏐 Odbicia od podłoża: ${game.groundBounces}`,
      canvas.width / 2,
      canvas.height - 30
    );
  }

  // Efekt Slow Motion - napis na ekranie
  if (game.slowMotionActive) {
    ctx.font = "bold 32px 'Courier New'";
    ctx.fillStyle = "rgba(136, 136, 255, 0.7)";
    ctx.textAlign = "center";
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#88f";
    ctx.fillText("⏱ SLOW MOTION", canvas.width / 2, canvas.height - 100);
  }

  // Aktywne power-upy na dole ekranu
  drawActivePowerups();
}

// Rysowanie aktywnych power-upów na dole
function drawActivePowerups() {
  const powerupHeight = 50;
  const powerupSize = 40;
  const bottomY = canvas.height - powerupHeight;

  const colors = {
    SPEED_UP: "#ff3",
    BIG_PAD: "#3f3",
    SMALL_PAD: "#f33",
    MULTI_BALL: "#3af",
    FREEZE: "#0ff",
    INVISIBLE: "#a0a",
    SHIELD: "#fa0",
    REVERSE: "#f0f",
    SLOW_MOTION: "#88f",
    MAGNET: "#f0f",
    GHOST_PAD: "#a0a",
  };

  // Power-up gracza 1 (lewy)
  if (game.player1Powerup) {
    drawPowerupIcon(
      100,
      canvas.height - powerupHeight / 2,
      powerupSize / 2,
      game.player1Powerup,
      colors[game.player1Powerup]
    );
    ctx.font = "bold 12px 'Courier New'";
    ctx.fillStyle = "#32f051";
    ctx.textAlign = "center";
    ctx.fillText("GRACZ 1", 100, canvas.height - 8);
  }

  // Power-up gracza 2 (prawy)
  if (game.player2Powerup) {
    drawPowerupIcon(
      canvas.width - 100,
      canvas.height - powerupHeight / 2,
      powerupSize / 2,
      game.player2Powerup,
      colors[game.player2Powerup]
    );
    ctx.font = "bold 12px 'Courier New'";
    ctx.fillStyle = "#32f051";
    ctx.textAlign = "center";
    ctx.fillText("GRACZ 2", canvas.width - 100, canvas.height - 8);
  }

  // Power-up globalny (środek)
  if (game.globalPowerup) {
    drawPowerupIcon(
      canvas.width / 2,
      canvas.height - powerupHeight / 2,
      powerupSize / 2,
      game.globalPowerup,
      colors[game.globalPowerup]
    );
    ctx.font = "bold 12px 'Courier New'";
    ctx.fillStyle = "#32f051";
    ctx.textAlign = "center";
    ctx.fillText("GLOBAL", canvas.width / 2, canvas.height - 8);
  }
}

// Rysowanie ikony power-upu
function drawPowerupIcon(x, y, radius, type, color) {
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.beginPath();

  switch (type) {
    case "SPEED_UP": // Trójkąt
      ctx.moveTo(x, y - radius);
      ctx.lineTo(x + radius, y + radius);
      ctx.lineTo(x - radius, y + radius);
      ctx.closePath();
      break;
    case "BIG_PAD": // Sześciokąt
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    case "SMALL_PAD": // Kwadrat
      ctx.rect(x - radius, y - radius, radius * 2, radius * 2);
      break;
    case "MULTI_BALL": // Koło
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      break;
    case "FREEZE": // Gwiazda 4-ramienna
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i;
        const r = i % 2 === 0 ? radius : radius / 2;
        const px = x + r * Math.cos(angle);
        const py = y + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    case "INVISIBLE": // Diament
      ctx.moveTo(x, y - radius);
      ctx.lineTo(x + radius, y);
      ctx.lineTo(x, y + radius);
      ctx.lineTo(x - radius, y);
      ctx.closePath();
      break;
    case "SHIELD": // Pięciokąt
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    case "REVERSE": // Gwiazda 5-ramienna
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 5) * i;
        const r = i % 2 === 0 ? radius : radius / 2;
        const px = x + r * Math.cos(angle - Math.PI / 2);
        const py = y + r * Math.sin(angle - Math.PI / 2);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    case "SLOW_MOTION": // Spirala
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI / 10) * i;
        const r = (radius / 20) * i;
        const px = x + r * Math.cos(angle);
        const py = y + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      break;
    case "MAGNET": // Krzyż magnetyczny
      ctx.moveTo(x - radius, y);
      ctx.lineTo(x + radius, y);
      ctx.moveTo(x, y - radius);
      ctx.lineTo(x, y + radius);
      ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
      break;
    case "GHOST_PAD": // X duchowy
      ctx.moveTo(x - radius, y - radius);
      ctx.lineTo(x + radius, y + radius);
      ctx.moveTo(x + radius, y - radius);
      ctx.lineTo(x - radius, y + radius);
      break;
  }
  ctx.fill();
  ctx.shadowBlur = 0;

  // Przywróć translate (zamknij screen shake)
  ctx.restore();
}

// Pauza
function drawPause() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "bold 64px 'Courier New'";
  ctx.fillStyle = "#32f051";
  ctx.textAlign = "center";
  ctx.fillText("PAUZA", canvas.width / 2, canvas.height / 2);
  ctx.font = "bold 24px 'Courier New'";
  ctx.fillText(
    "Kliknij aby kontynuować",
    canvas.width / 2,
    canvas.height / 2 + 50
  );
}

// Game Over
function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "bold 72px 'Courier New'";
  ctx.fillStyle = "#32f051";
  ctx.textAlign = "center";

  const winner = game.plScore > game.aiScore ? "GRACZ 1" : "GRACZ 2";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 50);
  ctx.font = "bold 36px 'Courier New'";
  ctx.fillText(`Wygrywa: ${winner}`, canvas.width / 2, canvas.height / 2 + 20);
  ctx.font = "bold 24px 'Courier New'";
  ctx.fillText(
    `Wynik: ${game.plScore} - ${game.aiScore}`,
    canvas.width / 2,
    canvas.height / 2 + 70
  );
  ctx.fillText(
    "Kliknij aby wrócić do menu",
    canvas.width / 2,
    canvas.height / 2 + 120
  );
}

// Główna pętla gry
function gameLoop() {
  if (game.state === "playing") {
    moveElements();
    drawElements();
  } else if (game.state === "paused") {
    drawElements();
    drawPause();
  } else if (game.state === "gameover") {
    drawElements();
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}

// Event listeners
window.addEventListener("resize", () => {
  if (game.state === "playing") {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initPositions(canvas);
  }
});

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  // Pauza
  if (e.key === "Escape" && game.state === "playing") {
    game.state = "paused";
  } else if (e.key === "Escape" && game.state === "paused") {
    game.state = "playing";
  }

  // Przypisywanie klawiszy w ustawieniach
  if (game.state === "settings" && game.settingsWaitingForKey) {
    e.preventDefault();
    const player = game.settingsSelectedPlayer === 1 ? "player1" : "player2";
    if (game.settingsWaitingForKey === "up") {
      controls[player].keyUp = e.key;
      localStorage.setItem(`p${game.settingsSelectedPlayer}KeyUp`, e.key);
    } else if (game.settingsWaitingForKey === "down") {
      controls[player].keyDown = e.key;
      localStorage.setItem(`p${game.settingsSelectedPlayer}KeyDown`, e.key);
    }
    game.settingsWaitingForKey = null;
    updateSettingsDisplay();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

canvas.addEventListener("mousemove", calMousePos);
canvas.addEventListener("click", handleClick);

// Inicjalizacja
initPositions(canvas);
updateMenuDisplay();
gameLoop();
