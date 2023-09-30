const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 4;
let ballSpeedY = 6;
let sizeBall = canvas.width / 100;

let aiLevel = 10;

let plScore = 0,
  aiScore = 0;

const winSorce = 3;

let padHeight = canvas.height / 5;
let padY = canvas.height / 2 - padHeight / 2;
let pad2Y = canvas.height / 2 - padHeight / 2;
const padDistFromEdge = 10;
const padThickness = 10;

let playGame = false;

var audio = new Audio("./music/sound.wav");
console.log(audio);
window.addEventListener("resize", () => {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  sizeBall = canvas.width / 75;
  padHeight = canvas.height / 7;
  padY = canvas.height / 2 - padHeight / 2;
  pad2Y = canvas.height / 2 - padHeight / 2;
});

window.onload = () => {
  canvas.addEventListener("mousedown", handlClick);
  canvas.addEventListener(
    "touchmove",
    (e) => {
      let mousePos = calMousePos(e.targetTouches[0]);
      padY = mousePos.y - padHeight / 2;
    },
    false
  );
  canvas.addEventListener("mousemove", (e) => {
    let mousePos = calMousePos(e);
    padY = mousePos.y - padHeight / 2;
  });
  setInterval(() => {
    moveElements();
    drawElements();
  }, 1000 / 60);
};

const handlClick = () => {
  if (!playGame) {
    playGame = !playGame;
    plScore = 0;
    aiScore = 0;
  }
};

const calMousePos = (e) => {
  let gameRect = canvas.getBoundingClientRect();
  let root = document.documentElement;

  let mouseX = e.clientX - gameRect.left - root.scrollLeft;
  let mouseY = e.clientY - gameRect.top - root.scrollTop;
  return { x: mouseX, y: mouseY };
};

const ballReset = () => {
  if (plScore >= winSorce || aiScore >= winSorce) {
    playGame = false;
  }
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = -ballSpeedX;
  ballSpeedY = 0;
};

const aiMovePad = () => {
  let padCenter = pad2Y + padHeight / 2;
  if (padCenter < ballY - aiLevel) {
    pad2Y += 12;
  } else if (padCenter > ballY + aiLevel) {
    pad2Y -= 12;
  }
};

const moveElements = () => {
  if (!playGame) return;

  aiMovePad();

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballX > canvas.width - 10) {
    plScore++;
    ballReset();
  }

  if (ballX + 10 < 0) {
    aiScore++;
    ballReset();
  }

  if (ballY > canvas.height - 10) {
    ballSpeedY = -ballSpeedY;
    audio.play();
  }

  if (ballY - 10 < 0) {
    ballSpeedY = -ballSpeedY;
    audio.play();
  }

  let padTop = padY;
  let padBottom = padY + padHeight;
  let padLeft = padDistFromEdge;
  let padRight = padDistFromEdge + padThickness + sizeBall;

  if (
    ballY >= padTop &&
    ballY <= padBottom &&
    ballX >= padLeft &&
    ballX <= padRight
  ) {
    audio.play();
    ballSpeedX = -ballSpeedX;
    let diffY = ballY - (padY + padHeight / 2);
    ballSpeedY = diffY * 0.23;
  }

  let pad2Top = pad2Y;
  let pad2Bottom = pad2Y + padHeight;
  let pad2Left = canvas.width - padDistFromEdge - padThickness - sizeBall;
  let pad2Right = canvas.width - padDistFromEdge;

  if (
    ballY >= pad2Top &&
    ballY <= pad2Bottom &&
    ballX >= pad2Left &&
    ballX <= pad2Right
  ) {
    audio.play();
    ballSpeedX = -ballSpeedX;
    let diffY = ballY - (pad2Y + padHeight / 2);
    ballSpeedY = diffY * 0.23;
  }
};

const drawElements = () => {
  drawRect(0, 0, canvas.width, canvas.height, "#000");

  if (!playGame) {
    let text;
    if (plScore >= winSorce) {
      text = "Wygrałeś";
    } else if (aiScore >= winSorce) {
      text = "Przegrałeś";
    }
    ctx.fillStyle = "#fff";
    ctx.font = "30px Poppins";
    ctx.fillText(
      "Kliknij aby grać",
      canvas.width / 2 - 125,
      canvas.height / 2 - 50
    );
    if (plScore > 1 || aiScore > 1)
      ctx.fillText(text, canvas.width / 2 - 75, canvas.height / 2 + 50);
    return;
  } else {
    ctx.className = "red";
    drawCircle(ballX, ballY, sizeBall, "#32f051");

    drawRect(padDistFromEdge, padY, padThickness, padHeight, "#14b32e");
    drawRect(
      canvas.width - padThickness - padDistFromEdge,
      pad2Y,
      padThickness,
      padHeight,
      "#14b32e"
    );

    ctx.font = "50px Poppins";
    ctx.fillText(plScore, canvas.width / 8, canvas.height / 10);
    ctx.fillText(aiScore, (canvas.width / 8) * 7, canvas.height / 10);

    drawNet();
  }
};
const drawNet = () => {
  for (let i = 0; i < canvas.height; i += 35) {
    drawRect(canvas.width / 2 - 1, i, 2, 20, "#14b32e");
  }
};
const drawRect = (x, y, w, h, c) => {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
};

const drawCircle = (x, y, r, c) => {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
};
