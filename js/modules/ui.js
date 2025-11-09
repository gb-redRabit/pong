import { game, controls, keys } from "./state.js";
import { CONFIG } from "./config.js";

// Globalny canvas - będzie ustawiony z app.js
let globalCanvas = null;

export function setCanvas(canvas) {
  globalCanvas = canvas;
}

export function showScreen(screenId, canvas = globalCanvas) {
  if (!canvas) {
    console.error("Canvas not available in showScreen");
    return;
  }

  const gameContainer = document.querySelector(".game-container");

  // Ukryj wszystkie ekrany
  document
    .querySelectorAll(".menu-screen")
    .forEach((s) => s.classList.remove("active"));
  canvas.classList.remove("active");

  // Pokaż wybrany ekran
  if (screenId === "game") {
    canvas.classList.add("active");
    game.state = "playing";
    gameContainer.classList.add("playing");
  } else {
    gameContainer.classList.remove("playing");

    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.add("active");
      if (screenId === "menuScreen") {
        game.state = "menu";
        updateMenuDisplay();
      } else if (screenId === "settingsScreen") {
        game.state = "settings";
        updateSettingsDisplay();
      } else if (screenId === "modeScreen") {
        game.state = "modeSelect";
        updateModeDisplay();
      }
    }
  }
}

export function updateMenuDisplay() {
  const hsDisplay = document.getElementById("highScoreDisplay");
  if (hsDisplay) {
    hsDisplay.textContent = game.highScore;
  }

  const modeDisplay = document.getElementById("currentModeDisplay");
  if (modeDisplay) {
    const mode = CONFIG.GAME_MODES[game.gameMode];
    modeDisplay.textContent = mode.name.toUpperCase();
  }

  document.querySelectorAll(".diff-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  const activeDiffBtn = Array.from(document.querySelectorAll(".diff-btn")).find(
    (btn) => {
      const span = btn.querySelector("span");
      return (
        span &&
        span.textContent.includes(
          CONFIG.DIFFICULTY[game.difficulty].name.toUpperCase()
        )
      );
    }
  );
  if (activeDiffBtn) activeDiffBtn.classList.add("active");
}

export function updateModeDisplay() {
  document.querySelectorAll(".mode-item").forEach((card) => {
    card.classList.remove("active");
  });
}

export function updateSettingsDisplay() {
  const p1Settings = document.getElementById("player1Settings");
  const p2Settings = document.getElementById("player2Settings");

  if (p1Settings) {
    p1Settings.innerHTML = `
      <div class="btn-grid two-col" style="margin-bottom: 1rem;">
        <button class="menu-btn ${
          controls.player1.type === "mouse" ? "" : "secondary"
        }" onclick="setControlType(1, 'mouse')">
          🖱️ MYSZ
        </button>
        <button class="menu-btn ${
          controls.player1.type === "keyboard" ? "" : "secondary"
        }" onclick="setControlType(1, 'keyboard')">
          ⌨️ KLAWIATURA
        </button>
      </div>
      ${
        controls.player1.type === "keyboard"
          ? `
        <div class="btn-grid two-col" style="margin-bottom: 1rem;">
          <button class="menu-btn secondary" onclick="assignKey(1, 'up')">
            GÓRA: ${controls.player1.keyUp}
          </button>
          <button class="menu-btn secondary" onclick="assignKey(1, 'down')">
            DÓŁ: ${controls.player1.keyDown}
          </button>
        </div>
      `
          : ""
      }
    `;
  }

  if (p2Settings) {
    p2Settings.innerHTML = `
      <div class="btn-grid two-col" style="margin-bottom: 1rem;">
        <button class="menu-btn ${
          controls.player2.type === "mouse" ? "" : "secondary"
        }" onclick="setControlType(2, 'mouse')">
          🖱️ MYSZ
        </button>
        <button class="menu-btn ${
          controls.player2.type === "keyboard" ? "" : "secondary"
        }" onclick="setControlType(2, 'keyboard')">
          ⌨️ KLAWIATURA
        </button>
      </div>
      ${
        controls.player2.type === "keyboard"
          ? `
        <div class="btn-grid two-col" style="margin-bottom: 1rem;">
          <button class="menu-btn secondary" onclick="assignKey(2, 'up')">
            GÓRA: ${controls.player2.keyUp}
          </button>
          <button class="menu-btn secondary" onclick="assignKey(2, 'down')">
            DÓŁ: ${controls.player2.keyDown}
          </button>
        </div>
      `
          : ""
      }
    `;
  }
}

export function setDifficulty(level) {
  game.difficulty = level;
  updateMenuDisplay();
}

export function selectMode(mode) {
  game.gameMode = mode;
  showScreen("menuScreen", globalCanvas);
}

export function setControlType(player, type) {
  const controlKey = player === 1 ? "player1" : "player2";
  controls[controlKey].type = type;
  localStorage.setItem(`p${player}ControlType`, type);
  updateSettingsDisplay();
}

export function assignKey(player, direction) {
  game.settingsWaitingForKey = direction;
  game.settingsSelectedPlayer = player;
  alert(`Naciśnij klawisz dla ruchu ${direction === "up" ? "GÓRA" : "DÓŁ"}`);
}

export function setTheme(themeName) {
  game.theme = themeName;
  updateThemeCSS();
}

export async function updateThemeCSS() {
  const { themes } = await import("./config.js");
  const theme = themes[game.theme];
  const root = document.documentElement;
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--secondary", theme.secondary);
  root.style.setProperty("--bg", theme.bg);
}
