import { DotLottie } from "https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web/+esm";
import { createMatrixBricks } from "../helpers/createMatrixBricks.js";
import { createMatrixStairsRight } from "../helpers/createMatrixStairsRight.js";
import { createMatrixStairsLeft } from "../helpers/createMatrixStairsLeft.js";


window.addEventListener("DOMContentLoaded", () => {
  const music = new Audio("./assets/music/retro-music.mp3");
  music.loop = true;
  music.volume = 0.4;

  // Автовоспроизведение по нажатию (в некоторых браузерах без взаимодействия не играет)
  document.addEventListener(
    "click",
    () => {
      music.play();
    },
    { once: true }
  );
});

let isGameOver = false;
const gameOverScreen = document.createElement("div");
gameOverScreen.id = "game-over-screen";
gameOverScreen.style.position = "fixed";
gameOverScreen.style.top = "0";
gameOverScreen.style.left = "0";
gameOverScreen.style.width = "100vw";
gameOverScreen.style.height = "100vh";
gameOverScreen.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
gameOverScreen.style.display = "flex";
gameOverScreen.style.flexDirection = "column";
gameOverScreen.style.justifyContent = "center";
gameOverScreen.style.alignItems = "center";
gameOverScreen.style.color = "#fff";
gameOverScreen.style.fontSize = "48px";
gameOverScreen.style.fontFamily = "monospace";
gameOverScreen.style.zIndex = "9999";
gameOverScreen.style.display = "none";
gameOverScreen.innerHTML = `
  <div>💀 GAME OVER</div>
  <button id="restart-button" style="
    margin-top: 20px;
    padding: 10px 20px;
    font-size: 20px;
    cursor: pointer;
  ">Restart</button>
`;

document.body.appendChild(gameOverScreen);

function showGameOver() {
  isGameOver = true;
  gameOverScreen.style.display = "flex";
  animation.goToAndStop(3, true); // например, поза проигрыша
}

document.getElementById("restart-button").addEventListener("click", () => {
  gameOverScreen.style.display = "none";
  resetGame(); // твоя логика обнуления
  isGameOver = false;
  requestAnimationFrame(gameLoop);
});

function resetHeroPosition() {
  // например, ставим в (1,1)
  let playerX = 15;
  let playerY = 10;

  canvas.style.left = `${playerX * cellWidth}px`;
  canvas.style.top = `${playerY * cellHeight - canvas.offsetHeight}px`;

  animation.goToAndStop(2, true); // стоячая поза
}

function checkPlayerHitByBot(botObj) {
  const playerLeft = parseFloat(canvas.style.left);
  const playerTop = parseFloat(canvas.style.top);
  const playerWidth = canvas.offsetWidth;
  const playerHeight = canvas.offsetHeight;
  console.log("Player", playerLeft, playerTop);
  const botLeft = parseFloat(botObj.canvas.style.left);
  const botTop = parseFloat(botObj.canvas.style.top);
  const botWidth = botObj.canvas.offsetWidth;
  const botHeight = botObj.canvas.offsetHeight;
  const padding = 0; // или 0.5, или 1 — регулируй
  console.log("Bot", botLeft, botTop);
  let difX = Math.abs(playerLeft - botLeft);
  let difY = Math.abs(playerTop - botTop);
  const isTouching = difX < 10 && difY < 10;
  //   (playerLeft - botLeft < 10 || botLeft - playerLeft < 10) &&
  //   // playerLeft > botLeft &&
  //   (playerTop - botTop < 10 || botTop - playerTop < 10);
  // // + botHeight &&
  //   playerTop + playerHeight - 20 >= botTop;

  return isTouching;
}
// ===================Panel======================================
const uiPanel = document.createElement("div");
uiPanel.id = "ui-panel";
uiPanel.style.position = "absolute";
uiPanel.style.top = "10px";
uiPanel.style.left = "10px";
uiPanel.style.right = "10px";
uiPanel.style.height = "30px";
uiPanel.style.zIndex = "3000";
uiPanel.style.display = "flex";
uiPanel.style.justifyContent = "space-between";
uiPanel.style.padding = "5px 20px";
uiPanel.style.fontFamily = "monospace";
uiPanel.style.fontSize = "20px";
uiPanel.style.color = "#fff";
uiPanel.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

document.body.appendChild(uiPanel);

uiPanel.innerHTML = `
  <div id="score">SCORE: 0</div>
  <div id="best">BEST: 0</div>
  <div id="rest">REST: 3</div>
`;
let score = 0;
let bestScore = 0;
let rest = 3;

function updateScore(points) {
  score += points;
  if (score > bestScore) bestScore = score;

  document.getElementById("score").textContent = `SCORE: ${score}`;
  document.getElementById("best").textContent = `BEST: ${bestScore}`;
}

function loseLife() {
  rest--;
  if (rest < 0) rest = 0;
  document.getElementById("rest").textContent = `REST: ${rest}`;

  if (rest === 0) {
    showGameOver(); // Показываем "Game Over"
  } else {
    isGameOver = true; // или другая флаговая переменная для паузы игры

    // Добавляем задержку 3 секунды перед сбросом позиции героя и возобновлением игры
    setTimeout(() => {
      resetHeroPosition(); // возвращаем героя на старт
      isGameOver = false; // снимаем блокировку
      requestAnimationFrame(gameLoop); // возобновляем игровой цикл
    }, 3000);
    resetHeroPosition(); // Перемещаем героя в начальную точку
  }
}

function resetGame() {
  // Перезагрузить страницу, чтобы все инициализировалось заново
  window.location.reload();

  score = 0;
  rest = 3;
  updateScore(0); // обновит обе строки
  document.getElementById("rest").textContent = `REST: ${rest}`;
}
// const restEl = document.createElement("div");
// restEl.id = "rest";
// restEl.textContent = "REST: 3";
// restEl.style.position = "absolute";
// restEl.style.top = "0";
// restEl.style.right = "20px";
// restEl.style.color = "#fff";
// restEl.style.fontSize = "20px";
// restEl.style.fontFamily = "monospace";
// restEl.style.zIndex = "2000";
// document.body.appendChild(restEl);

// =============================================================
const matrix = document.querySelector(".matrix");
const cols = 32; // по горизонтали (x)
const rows = 21; // по вертикали (y)

// Создаём пустую матрицу (заполняем div-ами-заглушками)
const cells = [];
for (let i = 0; i < cols * rows; i++) {
  const cell = document.createElement("div");
  cell.className = "cell";
  matrix.appendChild(cell);
  cells.push(cell);
}

// Функция для вставки brick-pair по координатам
function createBricksAt(...coords) {
  coords.forEach(([x, y]) => {
    if (y < 0 || y >= cols || x < 0 || x >= rows) return; // защита от выхода за границы

    const index = x * cols + y;
    const pair = document.createElement("div");
    pair.className = "brick-pair";
    pair.innerHTML = `
      <div class="brick1"></div>
      <div class="brick2"></div>
    `;
    cells[index].innerHTML = ""; // очищаем ячейку
    cells[index].appendChild(pair);
  });
}

createBricksAt(
  [0, 0],
  [0, 31],
  [1, 0],
  [1, 31],
  [2, 0],
  [2, 7],
  [2, 8],
  [2, 9],
  [2, 10],
  [2, 11],
  [2, 12],
  [2, 13],
  [2, 14],
  [2, 15],
  [2, 16],
  [2, 17],
  [2, 18],
  [2, 19],
  [2, 20],
  [2, 21],
  [2, 22],
  [2, 23],
  [2, 24],
  [2, 31],
  [3, 0],
  [3, 1],
  [3, 2],

  [3, 5],
  [3, 6],
  [3, 7],
  [3, 24],
  [3, 25],
  [3, 26],
  [3, 29],
  [3, 30],
  [3, 31],
  [4, 0],
  [4, 31],
  [5, 0],
  [5, 31],
  [6, 0],
  [6, 1],
  [6, 4],
  [6, 5],
  [6, 6],
  [6, 7],
  [6, 8],
  [6, 9],

  [6, 22],
  [6, 23],
  [6, 24],
  [6, 25],
  [6, 26],
  [6, 27],
  [6, 30],
  [6, 31],
  [7, 0],
  [7, 31],
  [8, 0],
  [8, 31],
  [9, 0],
  [9, 31],
  [10, 0],

  [10, 3],
  [10, 4],
  [10, 5],
  [10, 6],
  [10, 7],
  [10, 8],
  [10, 9],
  [10, 10],
  [10, 11],
  [10, 14],
  [10, 15],
  [10, 16],
  [10, 17],

  [10, 20],
  [10, 21],
  [10, 22],
  [10, 23],
  [10, 24],
  [10, 25],
  [10, 26],
  [10, 27],
  [10, 28],
  [10, 31],
  [11, 0],
  [11, 31],
  [12, 0],
  [12, 31],
  [13, 0],
  [13, 31],
  [14, 0],
  [14, 31],
  [15, 0],
  [15, 4],
  [15, 5],
  [15, 8],
  [15, 9],
  [15, 10],
  [15, 11],
  [15, 20],
  [15, 21],
  [15, 22],
  [15, 23],
  [15, 26],
  [15, 27],
  [15, 31],
  [16, 0],
  [16, 14],
  [16, 15],
  [16, 16],
  [16, 17],
  [16, 31],
  [17, 0],
  [17, 31],
  [18, 0],
  [18, 1],
  [18, 3],
  [18, 28],
  [18, 29],
  [18, 30],
  [18, 31],
  [19, 0],
  [19, 4],
  [19, 5],
  [19, 26],
  [19, 27],
  [19, 28],
  [19, 29],
  [19, 30],
  [19, 31],
  [20, 0],
  [20, 1],
  [20, 2],
  [20, 3],
  [20, 4],
  [20, 5],
  [20, 6],
  [20, 7],
  [20, 8],
  [20, 9],
  [20, 10],
  [20, 11],
  [20, 12],
  [20, 13],
  [20, 14],
  [20, 15],
  [20, 16],
  [20, 17],
  [20, 18],
  [20, 19],
  [20, 20],
  [20, 21],
  [20, 22],
  [20, 23],
  [20, 24],
  [20, 25],
  [20, 26],
  [20, 27],
  [20, 28],
  [20, 29],
  [20, 30],
  [20, 31]

  // в верхнем левом углу // в центре // в нижнем правом углу
);
// stair - top - fragment;
function createStairTopRight(...coords) {
  coords.forEach(([x, y]) => {
    if (y < 0 || y >= cols || x < 0 || x >= rows) return; // защита от выхода за границы

    const index = x * cols + y;
    const stairTopRight = document.createElement("div");
    stairTopRight.className = "stair-top-fragment-right";
    stairTopRight.innerHTML = `
      <div class="top-bar"></div>
      <div class="top-triangle"></div>
      <div class="top-square"></div>
      <div class="bottom-triangle"></div>
      <div class="bottom-square"></div>
      <div class="bottom-bar"></div>
    `;
    cells[index].innerHTML = ""; // очищаем ячейку
    cells[index].appendChild(stairTopRight);
  });
}

createStairTopRight([3, 3], [6, 2], [10, 18], [15, 6]);

function createStairTopLeft(...coords) {
  coords.forEach(([x, y]) => {
    if (y < 0 || y >= cols || x < 0 || x >= rows) return; // защита от выхода за границы

    const index = x * cols + y;
    const stairTopLeft = document.createElement("div");
    stairTopLeft.className = "stair-top-fragment-left";
    stairTopLeft.innerHTML = `
        <div class="top-bar"></div>
        <div class="top-triangle"></div>
        <div class="top-square"></div>
        <div class="bottom-triangle"></div>
        <div class="bottom-square"></div>
        <div class="bottom-bar"></div>
      `;
    cells[index].innerHTML = ""; // очищаем ячейку
    cells[index].appendChild(stairTopLeft);
  });
}

createStairTopLeft([3, 27], [6, 28], [10, 12], [15, 24]);

function createStairRight(...coords) {
  coords.forEach(([x, y]) => {
    if (y < 0 || y >= cols || x < 0 || x >= rows) return; // защита от выхода за границы

    const index = x * cols + y;
    const stairRight = document.createElement("div");
    stairRight.className = "stair-fragment-right";
    stairRight.innerHTML = `
        <div class="top-bar"></div>
        <div class="top-triangle"></div>
        <div class="top-square"></div>
        <div class="bottom-triangle"></div>
        <div class="bottom-square"></div>
        <div class="bottom-bar"></div>
      `;
    cells[index].innerHTML = ""; // очищаем ячейку
    cells[index].appendChild(stairRight);
  });
}
createStairRight(
  [4, 4],
  [5, 5],
  [7, 3],
  [8, 4],
  [9, 5],
  [11, 19],
  [12, 20],
  [13, 21],
  [14, 22],
  [16, 7],
  [17, 8],
  [18, 9],
  [19, 10]
);

function createStairLeft(...coords) {
  coords.forEach(([x, y]) => {
    if (y < 0 || y >= cols || x < 0 || x >= rows) return; // защита от выхода за границы

    const index = x * cols + y;
    const stairLeft = document.createElement("div");
    stairLeft.className = "stair-fragment-left";
    stairLeft.innerHTML = `
          <div class="top-bar"></div>
          <div class="top-triangle"></div>
          <div class="top-square"></div>
          <div class="bottom-triangle"></div>
          <div class="bottom-square"></div>
          <div class="bottom-bar"></div>
        `;
    cells[index].innerHTML = ""; // очищаем ячейку
    cells[index].appendChild(stairLeft);
  });
}
createStairLeft(
  [4, 26],
  [5, 25],
  [7, 27],
  [8, 26],
  [9, 25],
  [11, 11],
  [12, 10],
  [13, 9],
  [14, 8],
  [16, 23],
  [17, 22],
  [18, 21],
  [19, 20]
);
const cellWidth = cells[0].offsetWidth;
// const cellWidth = 22;
console.log("cellWidth", cellWidth); // ширина одной ячейки
const cellHeight = cells[0].offsetHeight;
// const cellHeight = 24;
console.log("cellHeight", cellHeight); // ширина одной ячейки
// ------------------------Portal---------------------------

const canvas = document.createElement("div");
canvas.id = "lottie-player";
canvas.style.position = "absolute";
canvas.style.width = "55px";
canvas.style.height = "55px";
canvas.style.zIndex = "1000";

// canvas.style.left = "100px";
// // canvas.style.top = "100px";
// cells[(15, 16)].appendChild(canvas);
matrix.appendChild(canvas);

const animation = lottie.loadAnimation({
  container: canvas,
  renderer: "canvas",
  loop: true, // бег цикличный
  autoplay: false, // не запускаем сразу
  path: "./assets/player.json",
  rendererSettings: {
    clearCanvas: true,
    scaleMode: "noScale",
  },
});

// const hero = {
//   canvas: canvas,
//   animation: animation,
//   isFrozen: false,
// };
canvas.style.visibility = "hidden"; // скрыть, но Lottie всё равно отрисует

// canvas.style.display = "none";

const portalCanvas = document.createElement("div");
portalCanvas.style.position = "absolute";
portalCanvas.style.width = "70px";
portalCanvas.style.height = "70px";
// badCanvas.style.left = "100px";
// badCanvas.style.top = "100px";
portalCanvas.style.zIndex = "2001";
matrix.appendChild(portalCanvas);
const xP = 15; // строка
const yP = 7; // столбец

// canvas.style.left = `${y * cellWidth - (animationWidth - cellWidth) / 2}px`;

// canvas.style.top = `${(x + 1) * cellHeight - animationHeight}px`;
// const offsetX = (animationWidth - cellWidth) / 2;
// canvas.style.left = `${y * cellWidth - offsetX}px`;
portalCanvas.style.left = `${xP * cellWidth}px`;
portalCanvas.style.top = `${yP * cellHeight + 20}px`;

const portalAnimation = lottie.loadAnimation({
  container: portalCanvas,
  renderer: "canvas",
  loop: false,
  autoplay: false,
  path: "./assets/door.json",
  rendererSettings: {
    clearCanvas: true,
    scaleMode: "noScale",
  },
});

const portal = {
  canvas: portalCanvas,
  animation: portalAnimation,
};

portal.canvas.style.display = "block";
// canvas.style.display = "block";

portalAnimation.addEventListener("DOMLoaded", () => {
  console.log("DOMLoaded event fired");
  const totalFrames = portalAnimation.totalFrames;
  portalAnimation.setSpeed(-0.25);
  portalAnimation.goToAndPlay(totalFrames, true);
  console.log("showing portal now");
  canvas.style.visibility = "visible";
  // hero.canvas.style.display = "block";
});

// запуск после портала
portalAnimation.addEventListener("complete", () => {
  console.log("🌀 portal complete");

  portal.canvas.style.display = "none";
  portalCanvas.remove();
});

// const matrixEl = document.querySelector(".matrix");
// const rectEl = matrixEl.getBoundingClientRect();

// console.log(`🟦 Матрица занимает на экране:`);
// console.log(`Ширина: ${rectEl.width}px`);
// console.log(`Высота: ${rectEl.height}px`);
// --------------begin position----------------------

// const cellWidth = 21; // ширина .cell
// const cellHeight = 26; // высота .cell

const targetCellIndex = 9 * cols + 16;
const targetCell = cells[targetCellIndex];

// const rect = targetCell.getBoundingClientRect();

const animationWidth = 55; // px
const animationHeight = 55; // px
const computedTop = parseFloat(getComputedStyle(canvas).top);
console.log("computedTop", computedTop);
const adjustedTop = computedTop + animationHeight;
console.log("adjustedTop", computedTop);
// canvas.style.left = `${rect.left}px`;

// canvas.style.top = `${rect.bottom - animationHeight}px`;
// canvas.style.display = "none";
// ================================begin position ===========
animation.addEventListener("DOMLoaded", () => {
  animation.goToAndStop(2, true); // стартовая поза (стоя)
});

// let posX = rect.left;
// let posY = rect.bottom - animationHeight;
let running = false;
let direction = "right"; // 'right' или 'left'
let moveSpeed = 5; // скорость движения в пикселях

const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
};

let isJumping = false;
const jumpHeight = 55;
const jumpDuration = 600;

const x = 8; // строка
const y = 15; // строка

// canvas.style.display = "block";
// canvas.style.left = `${y * cellWidth - (animationWidth - cellWidth) / 2}px`;

// canvas.style.top = `${(x + 1) * cellHeight - animationHeight}px`;
// const offsetX = (animationWidth - cellWidth) / 2;
// canvas.style.left = `${y * cellWidth - offsetX}px`;
canvas.style.left = `${y * cellWidth}px`;
canvas.style.top = `${x * cellHeight}px`;

const jumpDistance = cellWidth * 4;
// const row = Math.floor(adjustedTop / cellHeight);
// const col = Math.floor(computedTop / cellWidth);

const playerLeft = parseFloat(canvas.style.left);
const playerTop = parseFloat(canvas.style.top);

// const playerCol = Math.floor(playerLeft / cellWidth);
// const playerRow = Math.floor((playerTop + animationHeight) / cellHeight); // "ноги"
// // нижняя точка

function fixCurrentPotitionY() {
  // const compLeft = parseFloat(getComputedStyle(canvas).left);
  const compTop = parseFloat(getComputedStyle(canvas).top);
  const adjTop = compTop + animationHeight;

  const rowComp = Math.floor(adjTop / cellHeight);
  // const colComp = Math.floor(compLeft / cellWidth);

  // console.log("rowComp", rowComp);
  // const centerLeft = compLeft + canvas.offsetWidth / 2;
  // const colComp = Math.floor(centerLeft / cellWidth);
  // const centerX = (colComp - 1) * cellWidth + 9;
  //   (colComp + 1) * cellWidth + cellWidth / 2 - canvas.offsetWidth / 2;
  // const centerX = colComp * cellWidth + cellWidth / 2 - canvas.offsetWidth / 2;
  // console.log("centerX", centerX);
  const centerY = (rowComp - 2) * cellHeight;
  // console.log("centerY", centerY);

  // Центрируем персонажа
  // canvas.style.left = `${Math.round(centerX)}px`;
  // console.log("COOOOOOOOR XXXX", canvas.style.left);

  canvas.style.top = `${Math.round(centerY)}px`;
}

function fixCurrentPotitionX() {
  const compLeft = parseFloat(getComputedStyle(canvas).left);
  // const compTop = parseFloat(getComputedStyle(canvas).top);
  // const adjTop = compTop + animationHeight;

  // const rowComp = Math.floor(adjTop / cellHeight);
  // const colComp = Math.floor(compLeft / cellWidth);

  // console.log("rowComp", rowComp);
  const centerLeft = compLeft + canvas.offsetWidth / 2;
  const colComp = Math.floor(centerLeft / cellWidth);
  const centerX = (colComp - 1) * cellWidth + 9;
  //   (colComp + 1) * cellWidth + cellWidth / 2 - canvas.offsetWidth / 2;
  // const centerX = colComp * cellWidth + cellWidth / 2 - canvas.offsetWidth / 2;
  console.log("centerX", centerX);
  // const centerY = (rowComp - 2) * cellHeight;
  // console.log("centerY", centerY);

  // Центрируем персонажа
  canvas.style.left = `${Math.round(centerX)}px`;
  // console.log("COOOOOOOOR XXXX", canvas.style.left);

  // canvas.style.top = `${Math.round(centerY)}px`;
}

let coll;
let roww;
let swordImg;
function logCurrentCellPosition() {
  const computedLeft = parseFloat(getComputedStyle(canvas).left);
  //   console.log("computedLeft", computedLeft);
  const computedTop = parseFloat(getComputedStyle(canvas).top);

  const adjustedTop = computedTop + animationHeight;
  const centerLeft = computedLeft + canvas.offsetWidth / 2;

  coll = Math.floor(centerLeft / cellWidth);
  roww = Math.floor(adjustedTop / cellHeight);

  console.log(`Player is at cell: ( ${roww}, ${coll})`);
}

const matrixBricks = createMatrixBricks();
const matrixStairsRight = createMatrixStairsRight();
const matrixStairsLeft = createMatrixStairsLeft();

isJumping = false;
// let keys = {
//   ArrowRight: false,
//   ArrowLeft: false,
//   Space: false,
// };

let hasJumpDirection = false;

window.addEventListener("keydown", (e) => {
  if (e.code in keys) keys[e.code] = true;
  // if (e.code in keys) {
  //   keys[e.code] = true;
  //   console.log("Нажата клавиша:", e.code, keys);
  // }

  // Прыжок начинается
  if (e.code === "Space" && !hasSword && !isJumping && !isFallingNow) {
    if (isOnStair) {
      // console.log("🚫 Нельзя прыгать на лестнице");
      return;
    }
    isJumping = true;
    jumpStartTime = performance.now();
    initialTopPosition = parseFloat(canvas.style.top);
    initialLeftPosition = parseFloat(canvas.style.left);

    // Определяем jump-направление только один раз
    if (keys.ArrowRight) {
      horizontalDistance = jumpDistance;
      hasJumpDirection = true;
      direction = "right";
      canvas.style.transform = "scaleX(1)";
    } else if (keys.ArrowLeft) {
      horizontalDistance = -jumpDistance;
      hasJumpDirection = true;
      direction = "left";
      canvas.style.transform = "scaleX(-1)";
    } else {
      horizontalDistance = 0; // вертикальный прыжок
      hasJumpDirection = false;
    }

    animation.goToAndStop(5, true); // поза прыжка
  }
  // Бросок меча по пробелу, если он есть
  if (e.code === "Space" && hasSword && !isJumping && !isFallingNow) {
    throwSword();
  }

  // Во время прыжка — НЕЛЬЗЯ менять направление
  if (!isJumping && !isFallingNow) {
    if (e.code === "ArrowRight") {
      direction = "right";
      canvas.style.transform = "scaleX(1)";
    } else if (e.code === "ArrowLeft") {
      direction = "left";
      canvas.style.transform = "scaleX(-1)";
    }
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code in keys) {
    keys[e.code] = false;

    //     // Оновлюємо напрямок при відпусканні, без зміни running
    //     if (e.code === "ArrowRight" || e.code === "ArrowLeft") {
    //       if (keys.ArrowLeft) {
    //         direction = "left";
    //         canvas.style.transform = "scaleX(-1)";
    //       } else if (keys.ArrowRight) {
    //         direction = "right";
    //         canvas.style.transform = "scaleX(1)";
    //       }
    //     }
  }
});
let frameCount = 0;
let isFallingNow = false;
const brickSize = 24;

let jumpStartTime = 0;
let initialTopPosition = 0;
let initialLeftPosition = 0;

let jumpDirection = null;
let horizontalDistance = 0;
let isOnStair = false;
let directionStairs = null;

let directionBot;
// let direct;
// =====================Bad Boy=============================
function fixCurrentPositionBot() {
  const compLeft = parseFloat(getComputedStyle(bot.canvas).left);
  const compTop = parseFloat(getComputedStyle(bot.canvas).top);
  const adjTop = compTop + 55;

  const rowComp = Math.floor(adjTop / cellHeight);
  const colComp = Math.floor(compLeft / cellWidth);

  console.log("rowComp____________________", rowComp);

  const centerX =
    (colComp + 1) * cellWidth + cellWidth / 2 - bot.canvas.offsetWidth / 2;
  const centerY = (rowComp - 2) * cellHeight;
  // console.log("centerY", centerY);

  // Центрируем персонажа
  // canvas.style.left = `${Math.round(centerX)}px`;
  // console.log("COOOOOOOOR XXXX", canvas.style.left);

  //   bot.canvas.style.top = `${Math.round(centerY)}px`;
  // canvas.style.top = `${Math.round(centerY)}px`;
  bot.canvas.style.top = `${Math.round(centerY)}px`;
  currentTopB = parseFloat(bot.canvas.style.top);

  console.log(" bot.canvas.style.top", bot.canvas.style.top);
  // console.log("COOOOOOOOR YYYY", canvas.style.top);
}

function fixCurrentPositionBotSecond() {
  const compLeft = parseFloat(getComputedStyle(botSecond.canvas).left);
  const compTop = parseFloat(getComputedStyle(botSecond.canvas).top);
  const adjTop = compTop + 55;

  const rowComp = Math.floor(adjTop / cellHeight);
  const colComp = Math.floor(compLeft / cellWidth);

  console.log("rowComp____________________", rowComp);

  const centerX =
    (colComp + 1) * cellWidth +
    cellWidth / 2 -
    botSecond.canvas.offsetWidth / 2;
  const centerY = (rowComp - 2) * cellHeight;
  // console.log("centerY", centerY);

  // Центрируем персонажа
  // canvas.style.left = `${Math.round(centerX)}px`;
  // console.log("COOOOOOOOR XXXX", canvas.style.left);

  //   bot.canvas.style.top = `${Math.round(centerY)}px`;
  // canvas.style.top = `${Math.round(centerY)}px`;
  botSecond.canvas.style.top = `${Math.round(centerY)}px`;
  currentTopB = parseFloat(botSecond.canvas.style.top);

  console.log(" botSecond.canvas.style.top", botSecond.canvas.style.top);
  // console.log("COOOOOOOOR YYYY", canvas.style.top);
}

function fixSwordX() {
  if (!swordImg) return;

  const swordRect = swordImg.getBoundingClientRect();
  const matrixRect = matrix.getBoundingClientRect();

  // Получаем координаты меча относительно matrix
  const relativeLeft = swordRect.left - matrixRect.left;
  const relativeTop = swordRect.top - matrixRect.top;

  const col = Math.floor(relativeLeft / cellWidth);
  const row = Math.floor(relativeTop / cellHeight);
  console.log("row______________________________- col", row + 1, col);

  // Центруем меч в ячейке
  const centerX =
    (col + 1) * cellWidth + cellWidth / 2 - swordImg.offsetWidth / 2;
  const centerY = (row + 1) * cellHeight + cellHeight / 2;

  swordImg.style.left = `${Math.round(centerX)}px`;
  //   swordImg.style.top = `${Math.round(centerY)}px`;

  // Обновляем текущую координату если нужно где-то ещё
  currentTopB = centerY;

  console.log("Меч центрирован в ячейке:", row, col);
}

function fixSwordY() {
  if (!swordImg) return;

  const swordRect = swordImg.getBoundingClientRect();
  const matrixRect = matrix.getBoundingClientRect();

  // Получаем координаты меча относительно matrix
  const relativeLeft = swordRect.left - matrixRect.left;
  const relativeTop = swordRect.top - matrixRect.top;

  const col = Math.floor(relativeLeft / cellWidth);
  const row = Math.floor(relativeTop / cellHeight);
  console.log("row______________________________- col", row + 1, col);

  // Центруем меч в ячейке
  const centerX =
    (col + 1) * cellWidth + cellWidth / 2 - swordImg.offsetWidth / 2;
  const centerY = (row + 1) * cellHeight + cellHeight / 2;

  //   swordImg.style.left = `${Math.round(centerX)}px`;
  swordImg.style.top = `${Math.round(centerY)}px`;

  // Обновляем текущую координату если нужно где-то ещё
  currentTopB = centerY;

  console.log("Меч центрирован в ячейке:", row, col);
}
function logPositionSword() {
  const left = parseFloat(swordImg.style.left);
  const top = parseFloat(swordImg.style.top);

  const col = Math.floor(left / cellWidth) + 1;
  const row = Math.floor(top / cellHeight) + 1;

  console.log(`🗡️ Меч — X: ${left}px (${col}), Y: ${top}px (${row})`);
}

function logBotCellPosition(bot) {
  if (!bot || !bot.canvas) return;

  const computedLeft = parseFloat(getComputedStyle(bot.canvas).left);
  const computedTop = parseFloat(getComputedStyle(bot.canvas).top);

  const adjustedTop = computedTop;
  const centerLeft = computedLeft + bot.canvas.offsetWidth / 2;

  const colB = Math.floor(centerLeft / cellWidth) - 1;
  const rowB = Math.floor(adjustedTop / cellHeight) + 1;

  // const computedLeft = parseFloat(getComputedStyle(canvas).left);
  console.log("centerLeft", computedLeft);
  // const computedTop = parseFloat(getComputedStyle(canvas).top);

  // const adjustedTop = computedTop + animationHeight;
  // const centerLeft = computedLeft + canvas.offsetWidth / 2;

  // coll = Math.floor(centerLeft / cellWidth);
  // roww = Math.floor(adjustedTop / cellHeight);

  console.log(`Bot is above cell: (row: ${rowB}, col: ${colB})`);
  // const currentUpRight =
  //   matrixStairsRight[rowB - 1]?.[colB - 1] === 1 &&
  //   matrixStairsRight[rowB - 2]?.[colB - 2] === 1;
  // console.log("directionBot", bot.state.directionBot);
  // console.log(
  //   "currentUpRight",
  //   matrixStairsRight[rowB - 1]?.[colB - 1],
  //   matrixStairsRight[rowB - 2]?.[colB - 2]
  // );

  // let currentEndDown = matrixStairsRight[rowB]?.[colB - 1] === 1;
  // let currentEndDownTest = matrixStairsRight[rowB]?.[colB] === 1;
  // let currentEndDownTestNext = matrixBricks[rowB]?.[colB] === 1;
  // console.log(currentEndDown, currentEndDownTest, currentEndDownTestNext);
  // //   console.log("direct", direct);
  return { rowB, colB };
}

function logBotSecondCellPosition(botSecond) {
  if (!botSecond || !botSecond.canvas) return;

  const computedLeft = parseFloat(getComputedStyle(botSecond.canvas).left);
  const computedTop = parseFloat(getComputedStyle(botSecond.canvas).top);

  const adjustedTop = computedTop;
  const centerLeft = computedLeft + botSecond.canvas.offsetWidth / 2;

  const colB = Math.floor(centerLeft / cellWidth) - 1;
  const rowB = Math.floor(adjustedTop / cellHeight) + 1;

  // const computedLeft = parseFloat(getComputedStyle(canvas).left);
  console.log("centerLeft", computedLeft);
  // const computedTop = parseFloat(getComputedStyle(canvas).top);

  // const adjustedTop = computedTop + animationHeight;
  // const centerLeft = computedLeft + canvas.offsetWidth / 2;

  // coll = Math.floor(centerLeft / cellWidth);
  // roww = Math.floor(adjustedTop / cellHeight);

  console.log(`BotSecond is above cell: (row: ${rowB}, col: ${colB})`);
  // const currentUpRight =
  //   matrixStairsRight[rowB - 1]?.[colB - 1] === 1 &&
  //   matrixStairsRight[rowB - 2]?.[colB - 2] === 1;
  // console.log("directionBot", bot.state.directionBot);
  // console.log(
  //   "currentUpRight",
  //   matrixStairsRight[rowB - 1]?.[colB - 1],
  //   matrixStairsRight[rowB - 2]?.[colB - 2]
  // );

  // let currentEndDown = matrixStairsRight[rowB]?.[colB - 1] === 1;
  // let currentEndDownTest = matrixStairsRight[rowB]?.[colB] === 1;
  // let currentEndDownTestNext = matrixBricks[rowB]?.[colB] === 1;
  // console.log(currentEndDown, currentEndDownTest, currentEndDownTestNext);
  // //   console.log("direct", direct);
  return { rowB, colB };
}

// ==============================================

// const badCanvas = document.getElementById("bad-canvas");
const badCanvas = document.createElement("div");
badCanvas.style.position = "absolute";
badCanvas.style.width = "55px";
badCanvas.style.height = "55px";
badCanvas.style.zIndex = "1000";
matrix.appendChild(badCanvas);
const xB = 26; // строка
const yB = 1; // столбец

const badSecondCanvas = document.createElement("div");
badSecondCanvas.style.position = "absolute";
badSecondCanvas.style.width = "55px";
badSecondCanvas.style.height = "55px";
badSecondCanvas.style.zIndex = "1000";
matrix.appendChild(badSecondCanvas);
const xBS = 15; // строка
const yBS = 18; // столбец

badCanvas.style.left = `${xB * cellWidth}px`;
badCanvas.style.top = `${yB * cellHeight}px`;

badSecondCanvas.style.left = `${xBS * cellWidth}px`;
badSecondCanvas.style.top = `${yBS * cellHeight}px`;

const badAnimation = lottie.loadAnimation({
  container: badCanvas,
  renderer: "canvas",
  loop: true,
  autoplay: true,
  path: "./assets/badBoy.json",
  rendererSettings: {
    clearCanvas: true,
    scaleMode: "noScale",
  },
});

const badSecondAnimation = lottie.loadAnimation({
  container: badSecondCanvas,
  renderer: "canvas",
  loop: true,
  autoplay: true,
  path: "./assets/badBoy.json",
  rendererSettings: {
    clearCanvas: true,
    scaleMode: "noScale",
  },
});

const bot = {
  canvas: badCanvas,
  animation: badAnimation,
};

const botSecond = {
  canvas: badSecondCanvas,
  animation: badSecondAnimation,
};

function addBotLabel(botCanvas, name) {
  const label = document.createElement("div");
  label.textContent = name;
  label.style.position = "absolute";
  label.style.left = "50%";
  label.style.top = "-20px"; // немного выше бота
  label.style.transform = "translateX(-50%)";
  label.style.color = "red";
  label.style.fontSize = "14px";
  label.style.fontWeight = "bold";
  label.style.zIndex = "10";
  label.style.pointerEvents = "none";
  botCanvas.appendChild(label);
}

// Добавляем подписи
addBotLabel(badCanvas, "Repin");
addBotLabel(badSecondCanvas, "Repeta");

// const boomAnimation = lottie.loadAnimation({
//   container: boomCanvas,
//   renderer: "canvas",
//   loop: true,
//   autoplay: true,
//   path: "./assets/boom.json",
//   rendererSettings: {
//     clearCanvas: true,
//     scaleMode: "noScale",
//   },
// });

// const boom = {
//   canvas: boomCanvas,
//   animation: boomAnimation,
// };

// locityBadY = 1.5; // швидкість по Y

let onStairB = false;
let isFallingBot = false;
let direct;

let currentTopB;
let isBrickBellowR = false;
let isBrickBellowL = false;
// let isBrickBellowRMov = false;

let onStairBSecond = false;
let isFallingBotSecond = false;
let directSecond;

// badCanvas.style.animation = "fadeInParts 5s ease-out forwards";
// setTimeout(() => {
//   bot.state.isAppearing = false;
// }, 5000);

function updateBotPosition(bot, timestamp) {
  if (!bot) return;

  if (!bot.state) {
    bot.state = {
      directionBot: Math.random() < 0.5 ? "left" : "right",
      isJumping: false,
      isFallingBot: false,
      running: false,
      jumpStartTime: 0,
      jumpDuration: 600,
      jumpHeight: 50,
      horizontalDistance: 80,
      jumpDirection: null,
      initialTop: 0,
      initialLeft: 0,
      logicStair: "",
      //   isAppearing: true,
    };
  }
  //   if (bot.state.isAppearing) return;

  logBotCellPosition(bot);

  const position = logBotCellPosition(bot);
  if (!position) return;

  const { rowB, colB } = position;

  const gravity = 5;
  const moveSpeed = 5;
  let dx = 0;
  let dy = 0;

  isBrickBellowR =
    matrixBricks?.[rowB + 1]?.[colB + 1] === 0 &&
    matrixStairsRight?.[rowB + 1]?.[colB + 1] === 0 &&
    matrixStairsLeft?.[rowB + 1]?.[colB + 1] === 0 &&
    matrixBricks?.[rowB + 1]?.[colB] === 1;

  // isBrickBellowRMov =
  //   matrixBricks?.[rowB + 1]?.[colB + 1] === 0 &&
  //   matrixStairsRight?.[rowB + 1]?.[colB + 1] === 0 &&
  //   matrixStairsLeft?.[rowB + 1]?.[colB + 1] === 0;

  isBrickBellowL =
    matrixBricks?.[rowB + 1]?.[colB] === 0 &&
    matrixStairsRight?.[rowB + 1]?.[colB] === 0 &&
    matrixStairsLeft?.[rowB + 1]?.[colB] === 0 &&
    matrixBricks?.[rowB + 1]?.[colB + 1] === 1;

  // matrixBricks?.[rowB + 2]?.[colB] === 0;
  // matrixStairsLeft?.[rowB + 2]?.[colB] === 0;
  // matrixBricks?.[rowB + 1]?.[colB + 2] === 0 &&
  // matrixBricks?.[rowB + 1]?.[colB + 3] === 0 &&
  console.log(
    "isBrickBellowR",
    isBrickBellowR,
    rowB,
    colB,
    matrixBricks?.[rowB + 1]?.[colB + 1],
    matrixStairsRight?.[rowB + 1]?.[colB + 1],
    matrixStairsLeft?.[rowB + 1]?.[colB + 1],
    matrixBricks?.[rowB + 1]?.[colB]
  );

  let wallR =
    (matrixBricks?.[rowB]?.[colB + 2] ||
      matrixBricks?.[rowB - 1]?.[colB + 2]) &&
    !matrixBricks?.[rowB - 2]?.[colB + 2] &&
    !matrixBricks?.[rowB - 1]?.[colB + 2];

  let wallL =
    (matrixBricks?.[rowB]?.[colB - 1] ||
      matrixBricks?.[rowB - 1]?.[colB - 1]) &&
    !matrixBricks?.[rowB - 2]?.[colB - 1] &&
    !matrixBricks?.[rowB - 1]?.[colB - 1];
  // console.log(
  //   "WALLR",
  //   matrixBricks?.[rowB]?.[colB + 2],
  //   matrixBricks?.[rowB - 1]?.[colB + 2],
  //   matrixBricks?.[rowB - 2]?.[colB + 2]
  // );
  // console.log(
  //   "WALLLeft",
  //   matrixBricks?.[rowB]?.[colB - 1],
  //   matrixBricks?.[rowB - 1]?.[colB - 1],
  //   matrixBricks?.[rowB - 2]?.[colB - 1],
  //   matrixBricks?.[rowB - 1]?.[colB - 1]
  // );

  // console.log("WALLLeft", wallL);
  // console.log(bot.state.directionBot);
  // console.log("isBrickBellowRMov", isBrickBellowR);
  // console.log(rowB, colB);
  // console.log("ROWWSS", roww, rowB);
  if (
    !onStairB &&
    !bot.state.isFallingBot &&
    (((rowB === 14 || rowB === 13) && (colB === 26 || colB === 3)) ||
      (rowB === 19 && colB === 16) ||
      ((rowB === 9 || rowB === 8) && colB === 16) ||
      ((rowB === 9 || rowB === 8) && (colB === 8 || colB === 21)) ||
      ((rowB === 4 || rowB === 5) && (colB === 8 || colB === 21)) ||
      ((rowB === 2 || rowB === 1) && colB === 16))
  ) {
    if (roww < rowB + 1) {
      fixCurrentPositionBot();
      bot.state.logicStair = "up";
      if (
        ((rowB === 14 || rowB === 13) && (colB === 26 || colB === 3)) ||
        ((rowB === 4 || rowB === 3) && (colB === 7 || colB === 21))
      ) {
        bot.state.directionBot =
          bot.state.directionBot === "left" ? "right" : "left";
        // fixCurrentPositionBot();
      }
      fixCurrentPositionBot();
      // console.log(roww, rowB);
      // console.log("STATUSSSSS________________Up", bot.state.logicStair);
    } else if (roww > rowB + 3) {
      bot.state.logicStair = "down";
      // bot.state.directionBot =
      //   bot.state.directionBot === "left" ? "right" : "left";
      // console.log(roww, rowB);
      // console.log("STATUSSSSS________________Down", bot.state.logicStair);
    } else if (roww === rowB + 2 || roww === rowB + 1 || roww === rowB + 3) {
      console.log(roww, rowB);
      bot.state.logicStair = "direct";
      if ((rowB === 14 || rowB === 13) && (colB === 26 || colB === 3)) {
        bot.state.directionBot =
          bot.state.directionBot === "left" ? "right" : "left";
      }
      fixCurrentPositionBot();
      // console.log("STATUSSSSS________________Direct", bot.state.logicStair);
    }
    logBotCellPosition(bot);
  }

  // console.log("isBrickBellow__________0000000", isBrickBellowR);
  if (
    !bot.state.isJumping &&
    !bot.state.isFallingBot &&
    !onStairB &&
    ((isBrickBellowR && bot.state.directionBot === "right") ||
      (isBrickBellowL && bot.state.directionBot === "left") ||
      ((wallR || (colB === 25 && rowB === 1)) &&
        bot.state.directionBot === "right") ||
      ((wallL || (colB === 5 && rowB === 1)) &&
        bot.state.directionBot === "left"))
  ) {
    const jumpChance = 1;
    if (Math.random() < jumpChance) {
      // console.log("Jump00000000000000000___0000000000000000");
      // console.log("Running", running);
      //    && isBrickBellow === 1) {
      bot.state.isJumping = true;
      bot.state.jumpStartTime = timestamp;
      bot.state.initialTop = parseFloat(bot.canvas.style.top) || 0;
      bot.state.initialLeft = parseFloat(bot.canvas.style.left) || 0;
      bot.state.jumpDirection = bot.state.directionBot;
    }
  }

  // Если бот прыгает — обновляем позицию прыжка
  if (bot.state.isJumping) {
    const elapsed = timestamp - bot.state.jumpStartTime;
    const progress = Math.min(elapsed / bot.state.jumpDuration, 1);
    const angle = progress * Math.PI;

    const offsetY = Math.sin(angle) * bot.state.jumpHeight;
    const offsetX =
      bot.state.horizontalDistance *
      progress *
      (bot.state.jumpDirection === "right" ? 1 : -1);

    const newTop = bot.state.initialTop - offsetY;
    const newLeft = bot.state.initialLeft + offsetX;

    const colIndex = Math.floor(newLeft / cellWidth);
    if (colIndex <= 0 || colIndex >= 29) {
      bot.state.isJumping = false;
      bot.state.isFallingBot = true;
      fixCurrentPositionBot();
      return;
    }

    bot.canvas.style.top = `${newTop}px`;
    bot.canvas.style.left = `${newLeft}px`;

    const canvasBottom = newTop + bot.canvas.offsetHeight;
    // const col = Math.floor(newLeft / brickSize);
    const rowBelow = Math.floor(canvasBottom / brickSize);

    const col =
      bot.state.jumpDirection === "right"
        ? Math.floor((newLeft + bot.canvas.offsetWidth) / cellWidth)
        : Math.floor(newLeft / cellWidth);
    if (
      matrixBricks?.[rowBelow]?.[col] === 1 &&
      progress > 0.5 &&
      angle > Math.PI / 2
    ) {
      // console.log(matrixBricks?.[rowBelow]?.[col]);
      bot.canvas.style.top = `${
        rowBelow * cellHeight - bot.canvas.offsetHeight
      }px`;
      bot.state.isJumping = false;
      bot.state.isFallingBot = true;
      // isBrickBellow = false;

      fixCurrentPositionBot();
    }

    if (progress >= 1) {
      bot.state.isJumping = false;
      bot.state.isFallingBot = true;
      // isBrickBellow = false;

      fixCurrentPositionBot();
    }
    // logBotCellPosition(bot);
    return; // не выполняем остальной код движения во время прыжка
  }

  // ... здесь твоя текущая логика движения бота ...

  // -------------------------------------------------------------
  if (!bot.state.isJumping) {
    logBotCellPosition(bot);
    // console.log("I am here>>>>>>>>>>>>>>>>>>>>>>>>");
    // Случайное изменение направления
    // console.log("isBrickBellowRMov", isBrickBellowRMov);
    // if (!isBrickBellowRMov && !onStairB && Math.random() < 0.01) {
    //   //   bot.state.directionBot = Math.random() < 0.5 ? "left" : "right";
    //   bot.state.directionBot =
    //     bot.state.directionBot === "left" ? "right" : "left";
    // }

    // Движение по X (только если не падает)
    // !bot.state.isFallingBot &&
    if (!onStairB && !isFallingBot) {
      //   console.log("Moving");
      if (bot.state.directionBot === "right") {
        dx = moveSpeed;

        bot.canvas.style.transform = "scaleX(1)";
      } else {
        dx = -moveSpeed;

        bot.canvas.style.transform = "scaleX(-1)";
      }
    }
    const currentLeft = parseFloat(bot.canvas.style.left);
    currentTopB = parseFloat(bot.canvas.style.top);
    //   const newLeftB = currentLeft + dx;
    //   const newTopB = currentTop + dy;

    const rowB = Math.floor(
      (currentTopB + bot.canvas.offsetHeight) / cellHeight
    );
    // console.log("wwwwrowwwwwwwww", rowB);
    const colB = Math.floor(currentLeft / cellWidth);

    // console.log("direct", direct);
    const currentDownRight =
      matrixStairsRight[rowB]?.[colB + 1] === 1 &&
      matrixStairsRight[rowB + 1]?.[colB + 2] === 1;

    if (
      currentDownRight &&
      bot.state.directionBot === "right" &&
      bot.state.logicStair === "down"
      // && bot.state.logicStair
    ) {
      direct = "DR";
      onStairB = true;
      // console.log("onStairB", onStairB);

      // console.log(currentDownRight && bot.state.directionBot === "right");

      // console.log(direct);
    }
    // console.log("currentDownRight", currentDownRight);
    const currentUpRight =
      matrixStairsRight[rowB - 1]?.[colB] === 1 &&
      matrixStairsRight[rowB - 2]?.[colB - 1] === 1;

    if (
      currentUpRight &&
      bot.state.directionBot === "left" &&
      bot.state.logicStair === "up"
    ) {
      direct = "UR";
      onStairB = true;

      // console.log(currentUpRight && bot.state.directionBot === "left");

      // console.log(direct);
    }
    // console.log("currentUpRight", currentUpRight);
    const currentDownLeft =
      matrixStairsLeft[rowB]?.[colB + 2] === 1 &&
      matrixStairsLeft[rowB + 1]?.[colB + 1] === 1;

    if (
      currentDownLeft &&
      bot.state.directionBot === "left" &&
      bot.state.logicStair === "down"
    ) {
      direct = "DL";
      onStairB = true;
      // console.log("onStairB", onStairB);

      // console.log(currentDownLeft && bot.state.directionBot === "left");

      // console.log(direct);
    }
    // console.log("currentDownLeft", currentDownLeft);
    const currentUpLeft =
      matrixStairsLeft[rowB - 1]?.[colB + 2] === 1 &&
      matrixStairsLeft[rowB - 2]?.[colB + 3] === 1;

    if (
      currentUpLeft &&
      bot.state.directionBot === "right" &&
      bot.state.logicStair === "up"
    ) {
      direct = "UL";
      onStairB = true;

      // console.log(currentUpLeft && bot.state.directionBot === "rigth");

      // console.log(direct);
    }
    //   console.log("currentUpLeft", currentUpLeft);
    // Рішення — рухатись по сходах?
    const shouldClimb = 1;
    // = Math.random() < 0.5; // випадкове рішення
    // && !bot.state.isFallingBot

    if (shouldClimb === 1 && onStairB) {
      if (direct === "DR") {
        dx = moveSpeed;
        dy = moveSpeed;
        bot.canvas.style.transform = "scaleX(1)";
        let currentEndDown = matrixStairsRight[rowB]?.[colB] === 1;
        let currentEndDownTest = matrixStairsRight[rowB]?.[colB + 1] === 1;
        let currentEndDownTestNext = matrixBricks[rowB]?.[colB + 1] === 1;

        if (!currentEndDown && !currentEndDownTest && currentEndDownTestNext) {
          onStairB = false;
          direct = null;
          // console.log("direct", direct);
          currentEndDown = null;
          currentEndDownTest = null;
          currentEndDownTestNext = null;
        }
      } else if (direct === "UR") {
        // console.log(
        //   "currentUpRightrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
        //   currentUpRight
        // );
        dx = -moveSpeed;
        dy = -moveSpeed;
        bot.canvas.style.transform = "scaleX(-1)";

        let currentEndUp = matrixStairsRight[rowB]?.[colB + 1] === 1;
        let nextEndUp = matrixStairsRight[rowB - 1]?.[colB] === 0;
        // console.log(currentEndUp, nextEndUp);
        if (currentEndUp && nextEndUp) {
          // console.log("Result", currentEndUp && nextEndUp);
          onStairB = false;
          direct = null;
          currentEndUp = null;
          nextEndUp = null;
          fixCurrentPositionBot();
        }
      } else if (direct === "DL") {
        // console.log("currentDownLeft", currentDownLeft);
        dx = -moveSpeed;
        dy = moveSpeed;
        bot.canvas.style.transform = "scaleX(-1)";

        let currentEndUp = matrixStairsLeft[rowB]?.[colB + 2] === 1;
        let nextEndUp = matrixStairsLeft[rowB + 1]?.[colB + 2] === 1;
        let nextEndUpNext = matrixBricks[rowB]?.[colB + 1] === 1;
        if (!currentEndUp && !nextEndUp && nextEndUpNext) {
          onStairB = false;
          direct = null;
          currentEndUp = null;
          nextEndUp = null;
          nextEndUpNext = null;

          fixCurrentPositionBot();
        }
      } else if (direct === "UL") {
        // console.log("i am on stair!!!!!!!!!!!!!!!!!!!!!!!!");
        // console.log("currentUpLeft", currentUpLeft);
        dx = moveSpeed;
        dy = -moveSpeed;
        bot.canvas.style.transform = "scaleX(1)";
        let currentEndDown = matrixStairsLeft[rowB - 1]?.[colB + 2] === 1;
        let currentEndDownTest = matrixStairsLeft[rowB]?.[colB + 1] === 1;
        let currentEndDownTestNext = matrixBricks[rowB]?.[colB + 1] === 1;

        if (!currentEndDown && !currentEndDownTest && currentEndDownTestNext) {
          onStairB = false;
          direct = null;
          currentEndDown = null;
          currentEndDownTest = null;
          currentEndDownTestNext = null;

          fixCurrentPositionBot();
          isBrickBellowR = false;
        }

        //   console.log("dy", dy);
      }
    } else {
      onStairB = false;
      direct = null;
      // Стандартний рух
      // dx = bot.state.direction === "right" ? moveSpeed : -moveSpeed;
      // console.log(bot.state.direction);
      logBotCellPosition(bot);
      bot.canvas.style.transform =
        bot.state.directionBot === "right" ? "scaleX(1)" : "scaleX(-1)";
    }
    const newLeftB = currentLeft + dx;
    const newTopB = currentTopB + dy;

    bot.canvas.style.top = `${newTopB}px`;

    isFallingBot =
      matrixBricks?.[rowB]?.[colB + 1] === 0 &&
      matrixStairsRight?.[rowB]?.[colB + 1] === 0 &&
      matrixStairsLeft?.[rowB]?.[colB + 1] === 0;
    // console.log(
    //   matrixBricks?.[rowB]?.[colB],
    //   matrixStairsRight?.[rowB]?.[colB],
    //   matrixStairsLeft?.[rowB]?.[colB]
    // );
    // isBrickBellow =
    //   matrixBricks?.[rowB]?.[colB + 1] === 0 &&
    //   matrixStairsRight?.[rowB]?.[colB + 1] === 0 &&
    //   matrixStairsLeft?.[rowB]?.[colB + 1] === 0;
    // console.log("isBrickBellow_3333", isBrickBellow);

    // const jumpChance = 0.04;
    // if (Math.random() < jumpChance) {
    //   bot.state.isJumping = true;
    //   bot.state.jumpStartTime = timestamp;
    //   bot.state.initialTop = parseFloat(bot.canvas.style.top) || 0;
    //   bot.state.initialLeft = parseFloat(bot.canvas.style.left) || 0;
    //   bot.state.jumpDirection = bot.state.directionBot;
    // }

    bot.canvas.style.top = currentTopB;
    if (isFallingBot && !onStairB) {
      // console.log("fallingggggggggggggggggggggggggggggggg");

      const currentTopB = parseFloat(bot.canvas.style.top);
      // console.log(currentTop);
      // console.log(dx);
      bot.canvas.style.top = `${currentTopB + gravity}px`;
      // console.log(bot.canvas.style.top);

      bot.state.isFallingBot = true;
      bot.animation.goToAndStop(3, true);
      // fixCurrentPositionBot;
      // isBrickBellow = false;
    } else {
      if (bot.state.isFallingBot) {
        bot.state.isFallingBot = false;

        bot.animation.goToAndStop(2, true);
        fixCurrentPositionBot();
      } else {
        // fixCurrentPotition();
        bot.animation.play();
      }

      // Движение только если НЕ падает
      // bot.canvas.style.left = `${newLeftB}px`;
      // bot.canvas.style.top = `${newTopB}px`;
    }

    //   const newLeftB = currentLeft + dx;
    bot.canvas.style.left = `${newLeftB}px`;

    const computedLeft = parseFloat(getComputedStyle(bot.canvas).left);
    // const computedTop = parseFloat(getComputedStyle(bot.canvas).top);

    // const adjustedTop = computedTop;
    const centerLeft = computedLeft;
    // + bot.canvas.offsetWidth / 2;

    const colIndex = Math.floor(centerLeft / cellWidth);
    // const rowB = Math.floor(adjustedTop / cellHeight);

    const nextColB = dx > 0 ? colB + 1 : dx < 0 ? colB - 1 : colB;
    const nextRowB = rowB - 1;
    // Проверка границ
    // const colIndex = Math.floor(newLeftB / cellWidth);
    if (
      (colIndex < 0 ||
        colIndex > 29 ||
        matrixBricks[nextRowB]?.[nextColB + 1] === 1) &&
      // ||
      // matrixBricks[nextRowB - 1]?.[nextColB + 1] === 1)
      !onStairB
    ) {
      // fixCurrentPositionBot();
      // console.log("WALLLLLLLLLLLLL", matrixBricks[nextRowB]?.[nextColB]);
      // console.log(
      //   "colIndex",
      //   colIndex,
      //   matrixBricks[nextRowB]?.[nextColB + 1],
      //   matrixBricks[nextRowB - 1]?.[nextColB + 1]
      // );
      bot.state.directionBot =
        bot.state.directionBot === "left" ? "right" : "left";

      return;
    }
  }
}

function updateBotSecondPosition(botSecond, timestamp) {
  if (!botSecond) return;

  if (!botSecond.state) {
    botSecond.state = {
      directionBot: Math.random() < 0.5 ? "left" : "right",
      isJumping: false,
      isFallingBotSecond: false,
      running: false,
      jumpStartTime: 0,
      jumpDuration: 600,
      jumpHeight: 50,
      horizontalDistance: 80,
      jumpDirection: null,
      initialTop: 0,
      initialLeft: 0,
      logicStair: "",
    };
  }
  logBotSecondCellPosition(botSecond);

  const position = logBotSecondCellPosition(botSecond);
  if (!position) return;

  const { rowB, colB } = position;

  const gravity = 5;
  const moveSpeed = 4;
  let dx = 0;
  let dy = 0;

  isBrickBellowR =
    matrixBricks?.[rowB + 1]?.[colB + 1] === 0 &&
    matrixStairsRight?.[rowB + 1]?.[colB + 1] === 0 &&
    matrixStairsLeft?.[rowB + 1]?.[colB + 1] === 0 &&
    matrixBricks?.[rowB + 1]?.[colB] === 1;

  // isBrickBellowRMov =
  //   matrixBricks?.[rowB + 1]?.[colB + 1] === 0 &&
  //   matrixStairsRight?.[rowB + 1]?.[colB + 1] === 0 &&
  //   matrixStairsLeft?.[rowB + 1]?.[colB + 1] === 0;

  isBrickBellowL =
    matrixBricks?.[rowB + 1]?.[colB] === 0 &&
    matrixStairsRight?.[rowB + 1]?.[colB] === 0 &&
    matrixStairsLeft?.[rowB + 1]?.[colB] === 0 &&
    matrixBricks?.[rowB + 1]?.[colB + 1] === 1;

  // matrixBricks?.[rowB + 2]?.[colB] === 0;
  // matrixStairsLeft?.[rowB + 2]?.[colB] === 0;
  // matrixBricks?.[rowB + 1]?.[colB + 2] === 0 &&
  // matrixBricks?.[rowB + 1]?.[colB + 3] === 0 &&
  console.log(
    "isBrickBellowR",
    isBrickBellowR,
    rowB,
    colB,
    matrixBricks?.[rowB + 1]?.[colB + 1],
    matrixStairsRight?.[rowB + 1]?.[colB + 1],
    matrixStairsLeft?.[rowB + 1]?.[colB + 1],
    matrixBricks?.[rowB + 1]?.[colB]
  );

  let wallR =
    (matrixBricks?.[rowB]?.[colB + 2] ||
      matrixBricks?.[rowB - 1]?.[colB + 2]) &&
    !matrixBricks?.[rowB - 2]?.[colB + 2] &&
    !matrixBricks?.[rowB - 1]?.[colB + 2];

  let wallL =
    (matrixBricks?.[rowB]?.[colB - 1] ||
      matrixBricks?.[rowB - 1]?.[colB - 1]) &&
    !matrixBricks?.[rowB - 2]?.[colB - 1] &&
    !matrixBricks?.[rowB - 1]?.[colB - 1];
  console.log(
    "WALLR",
    matrixBricks?.[rowB]?.[colB + 2],
    matrixBricks?.[rowB - 1]?.[colB + 2],
    matrixBricks?.[rowB - 2]?.[colB + 2]
  );
  console.log(
    "WALLLeft",
    matrixBricks?.[rowB]?.[colB - 1],
    matrixBricks?.[rowB - 1]?.[colB - 1],
    matrixBricks?.[rowB - 2]?.[colB - 1],
    matrixBricks?.[rowB - 1]?.[colB - 1]
  );

  // console.log("WALLLeft", wallL);
  // console.log(bot.state.directionBot);
  // console.log("isBrickBellowRMov", isBrickBellowR);
  console.log(rowB, colB);
  console.log("ROWWSS", roww, rowB);
  if (
    !onStairBSecond &&
    !botSecond.state.isFallingBotSecond &&
    (((rowB === 14 || rowB === 13) && (colB === 26 || colB === 3)) ||
      (rowB === 19 && colB === 16) ||
      ((rowB === 9 || rowB === 8) && colB === 16) ||
      ((rowB === 9 || rowB === 8) && (colB === 8 || colB === 21)) ||
      ((rowB === 4 || rowB === 3) && (colB === 8 || colB === 21)) ||
      ((rowB === 2 || rowB === 1) && colB === 16))
  ) {
    if (roww < rowB + 1) {
      fixCurrentPositionBotSecond();
      botSecond.state.logicStair = "up";
      if (
        ((rowB === 14 || rowB === 13) && (colB === 26 || colB === 3)) ||
        ((rowB === 4 || rowB === 3) && (colB === 8 || colB === 21))
      ) {
        botSecond.state.directionBot =
          botSecond.state.directionBot === "left" ? "right" : "left";
        // fixCurrentPositionBot();
      }
      fixCurrentPositionBotSecond();
      console.log(roww, rowB);
      console.log("STATUSSSSS________________Up", botSecond.state.logicStair);
    } else if (roww > rowB + 3) {
      botSecond.state.logicStair = "down";
      // bot.state.directionBot =
      //   bot.state.directionBot === "left" ? "right" : "left";
      console.log(roww, rowB);
      console.log("STATUSSSSS________________Down", botSecond.state.logicStair);
    } else if (roww === rowB + 2 || roww === rowB + 1 || roww === rowB + 3) {
      console.log(roww, rowB);
      botSecond.state.logicStair = "direct";
      if ((rowB === 14 || rowB === 13) && (colB === 26 || colB === 3)) {
        botSecond.state.directionBot =
          botSecond.state.directionBot === "left" ? "right" : "left";
      }
      fixCurrentPositionBotSecond();
      console.log(
        "STATUSSSSS________________Direct",
        botSecond.state.logicStair
      );
    }
    logBotSecondCellPosition(botSecond);
  }

  console.log("isBrickBellow__________0000000", isBrickBellowR);
  if (
    !botSecond.state.isJumping &&
    !botSecond.state.isFallingBotSecond &&
    !onStairBSecond &&
    ((isBrickBellowR && botSecond.state.directionBot === "right") ||
      (isBrickBellowL && botSecond.state.directionBot === "left") ||
      ((wallR || (colB === 25 && rowB === 1)) &&
        botSecond.state.directionBot === "right") ||
      ((wallL || (colB === 5 && rowB === 1)) &&
        botSecond.state.directionBot === "left"))
  ) {
    const jumpChance = 1;
    if (Math.random() < jumpChance) {
      console.log("Jump00000000000000000___0000000000000000");
      // console.log("Running", running);
      //    && isBrickBellow === 1) {
      botSecond.state.isJumping = true;
      botSecond.state.jumpStartTime = timestamp;
      botSecond.state.initialTop = parseFloat(botSecond.canvas.style.top) || 0;
      botSecond.state.initialLeft =
        parseFloat(botSecond.canvas.style.left) || 0;
      botSecond.state.jumpDirection = botSecond.state.directionBot;
    }
  }

  // Если бот прыгает — обновляем позицию прыжка
  if (botSecond.state.isJumping) {
    const elapsed = timestamp - botSecond.state.jumpStartTime;
    const progress = Math.min(elapsed / botSecond.state.jumpDuration, 1);
    const angle = progress * Math.PI;

    const offsetY = Math.sin(angle) * botSecond.state.jumpHeight;
    const offsetX =
      botSecond.state.horizontalDistance *
      progress *
      (botSecond.state.jumpDirection === "right" ? 1 : -1);

    const newTop = botSecond.state.initialTop - offsetY;
    const newLeft = botSecond.state.initialLeft + offsetX;

    const colIndex = Math.floor(newLeft / cellWidth);
    if (colIndex <= 0 || colIndex >= 29) {
      botSecond.state.isJumping = false;
      botSecond.state.isFallingBotSecond = true;
      fixCurrentPositionBotSecond();
      return;
    }

    botSecond.canvas.style.top = `${newTop}px`;
    botSecond.canvas.style.left = `${newLeft}px`;

    const canvasBottom = newTop + botSecond.canvas.offsetHeight;
    // const col = Math.floor(newLeft / brickSize);
    const rowBelow = Math.floor(canvasBottom / brickSize);

    const col =
      botSecond.state.jumpDirection === "right"
        ? Math.floor((newLeft + botSecond.canvas.offsetWidth) / cellWidth)
        : Math.floor(newLeft / cellWidth);
    if (
      matrixBricks?.[rowBelow]?.[col] === 1 &&
      progress > 0.5 &&
      angle > Math.PI / 2
    ) {
      // console.log(matrixBricks?.[rowBelow]?.[col]);
      botSecond.canvas.style.top = `${
        rowBelow * cellHeight - botSecond.canvas.offsetHeight
      }px`;
      botSecond.state.isJumping = false;
      botSecond.state.isFallingBotSecond = true;
      // isBrickBellow = false;

      fixCurrentPositionBotSecond();
    }

    if (progress >= 1) {
      botSecond.state.isJumping = false;
      botSecond.state.isFallingBotSecond = true;
      // isBrickBellow = false;

      fixCurrentPositionBotSecond();
    }
    // logBotCellPosition(bot);
    return; // не выполняем остальной код движения во время прыжка
  }

  // ... здесь твоя текущая логика движения бота ...

  // -------------------------------------------------------------
  if (!botSecond.state.isJumping) {
    logBotSecondCellPosition(botSecond);
    // console.log("I am here>>>>>>>>>>>>>>>>>>>>>>>>");
    // Случайное изменение направления
    // console.log("isBrickBellowRMov", isBrickBellowRMov);
    // if (!isBrickBellowRMov && !onStairB && Math.random() < 0.01) {
    //   //   bot.state.directionBot = Math.random() < 0.5 ? "left" : "right";
    //   bot.state.directionBot =
    //     bot.state.directionBot === "left" ? "right" : "left";
    // }

    // Движение по X (только если не падает)
    // !bot.state.isFallingBot &&
    if (!onStairBSecond && !isFallingBotSecond) {
      //   console.log("Moving");
      if (botSecond.state.directionBot === "right") {
        dx = moveSpeed;

        botSecond.canvas.style.transform = "scaleX(1)";
      } else {
        dx = -moveSpeed;

        botSecond.canvas.style.transform = "scaleX(-1)";
      }
    }
    const currentLeft = parseFloat(botSecond.canvas.style.left);
    currentTopB = parseFloat(botSecond.canvas.style.top);
    //   const newLeftB = currentLeft + dx;
    //   const newTopB = currentTop + dy;

    const rowB = Math.floor(
      (currentTopB + botSecond.canvas.offsetHeight) / cellHeight
    );
    // console.log("wwwwrowwwwwwwww", rowB);
    const colB = Math.floor(currentLeft / cellWidth);

    // console.log("direct", direct);
    const currentDownRight =
      matrixStairsRight[rowB]?.[colB + 1] === 1 &&
      matrixStairsRight[rowB + 1]?.[colB + 2] === 1;

    if (
      currentDownRight &&
      botSecond.state.directionBot === "right" &&
      botSecond.state.logicStair === "down"
      // && bot.state.logicStair
    ) {
      directSecond = "DR";
      onStairBSecond = true;
      console.log("onStairBSecond", onStairBSecond);

      console.log(currentDownRight && botSecond.state.directionBot === "right");

      console.log(directSecond);
    }
    // console.log("currentDownRight", currentDownRight);
    const currentUpRight =
      matrixStairsRight[rowB - 1]?.[colB] === 1 &&
      matrixStairsRight[rowB - 2]?.[colB - 1] === 1;

    if (
      currentUpRight &&
      botSecond.state.directionBot === "left" &&
      botSecond.state.logicStair === "up"
    ) {
      directSecond = "UR";
      onStairBSecond = true;

      console.log(currentUpRight && botSecond.state.directionBot === "left");

      console.log(directSecond);
    }
    // console.log("currentUpRight", currentUpRight);
    const currentDownLeft =
      matrixStairsLeft[rowB]?.[colB + 2] === 1 &&
      matrixStairsLeft[rowB + 1]?.[colB + 1] === 1;

    if (
      currentDownLeft &&
      botSecond.state.directionBot === "left" &&
      botSecond.state.logicStair === "down"
    ) {
      directSecond = "DL";
      onStairBSecond = true;
      console.log("onStairBSecond", onStairBSecond);

      console.log(currentDownLeft && botSecond.state.directionBot === "left");

      console.log(directSecond);
    }
    // console.log("currentDownLeft", currentDownLeft);
    const currentUpLeft =
      matrixStairsLeft[rowB - 1]?.[colB + 2] === 1 &&
      matrixStairsLeft[rowB - 2]?.[colB + 3] === 1;

    if (
      currentUpLeft &&
      botSecond.state.directionBot === "right" &&
      botSecond.state.logicStair === "up"
    ) {
      directSecond = "UL";
      onStairBSecond = true;

      console.log(currentUpLeft && botSecond.state.directionBot === "rigth");

      console.log(directSecond);
    }
    //   console.log("currentUpLeft", currentUpLeft);
    // Рішення — рухатись по сходах?
    const shouldClimb = 1;
    // = Math.random() < 0.5; // випадкове рішення
    // && !bot.state.isFallingBot

    if (shouldClimb === 1 && onStairBSecond) {
      if (directSecond === "DR") {
        dx = moveSpeed;
        dy = moveSpeed;
        botSecond.canvas.style.transform = "scaleX(1)";
        let currentEndDown = matrixStairsRight[rowB]?.[colB] === 1;
        let currentEndDownTest = matrixStairsRight[rowB]?.[colB + 1] === 1;
        let currentEndDownTestNext = matrixBricks[rowB]?.[colB + 1] === 1;

        if (!currentEndDown && !currentEndDownTest && currentEndDownTestNext) {
          onStairBSecond = false;
          directSecond = null;
          // console.log("direct", direct);
          currentEndDown = null;
          currentEndDownTest = null;
          currentEndDownTestNext = null;
          fixCurrentPositionBotSecond();
        }
      } else if (directSecond === "UR") {
        console.log(
          "currentUpRightrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
          currentUpRight
        );
        dx = -moveSpeed;
        dy = -moveSpeed;
        botSecond.canvas.style.transform = "scaleX(-1)";

        let currentEndUp = matrixStairsRight[rowB]?.[colB + 1] === 1;
        let nextEndUp = matrixStairsRight[rowB - 1]?.[colB] === 0;
        console.log(currentEndUp, nextEndUp);
        if (currentEndUp && nextEndUp) {
          console.log("Result", currentEndUp && nextEndUp);
          onStairBSecond = false;
          directSecond = null;
          currentEndUp = null;
          nextEndUp = null;
          fixCurrentPositionBotSecond();
        }
      } else if (directSecond === "DL") {
        console.log("currentDownLeft", currentDownLeft);
        dx = -moveSpeed;
        dy = moveSpeed;
        botSecond.canvas.style.transform = "scaleX(-1)";

        let currentEndUp = matrixStairsLeft[rowB]?.[colB + 2] === 1;
        let nextEndUp = matrixStairsLeft[rowB + 1]?.[colB + 2] === 1;
        let nextEndUpNext = matrixBricks[rowB]?.[colB + 1] === 1;
        if (!currentEndUp && !nextEndUp && nextEndUpNext) {
          onStairBSecond = false;
          directSecond = null;
          currentEndUp = null;
          nextEndUp = null;
          nextEndUpNext = null;

          fixCurrentPositionBotSecond();
        }
      } else if (directSecond === "UL") {
        console.log("i am on stair!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log("currentUpLeft", currentUpLeft);
        dx = moveSpeed;
        dy = -moveSpeed;
        botSecond.canvas.style.transform = "scaleX(1)";
        let currentEndDown = matrixStairsLeft[rowB - 1]?.[colB + 2] === 1;
        let currentEndDownTest = matrixStairsLeft[rowB]?.[colB + 1] === 1;
        let currentEndDownTestNext = matrixBricks[rowB]?.[colB + 1] === 1;

        if (!currentEndDown && !currentEndDownTest && currentEndDownTestNext) {
          onStairBSecond = false;
          directSecond = null;
          currentEndDown = null;
          currentEndDownTest = null;
          currentEndDownTestNext = null;

          fixCurrentPositionBotSecond();
          isBrickBellowR = false;
        }

        //   console.log("dy", dy);
      }
    } else {
      onStairBSecond = false;
      directSecond = null;
      // Стандартний рух
      // dx = bot.state.direction === "right" ? moveSpeed : -moveSpeed;
      // console.log(bot.state.direction);
      logBotSecondCellPosition(botSecond);
      botSecond.canvas.style.transform =
        botSecond.state.directionBot === "right" ? "scaleX(1)" : "scaleX(-1)";
    }
    const newLeftB = currentLeft + dx;
    const newTopB = currentTopB + dy;

    botSecond.canvas.style.top = `${newTopB}px`;

    isFallingBotSecond =
      matrixBricks?.[rowB]?.[colB + 1] === 0 &&
      matrixStairsRight?.[rowB]?.[colB + 1] === 0 &&
      matrixStairsLeft?.[rowB]?.[colB + 1] === 0;
    console.log(
      matrixBricks?.[rowB]?.[colB],
      matrixStairsRight?.[rowB]?.[colB],
      matrixStairsLeft?.[rowB]?.[colB]
    );
    // isBrickBellow =
    //   matrixBricks?.[rowB]?.[colB + 1] === 0 &&
    //   matrixStairsRight?.[rowB]?.[colB + 1] === 0 &&
    //   matrixStairsLeft?.[rowB]?.[colB + 1] === 0;
    // console.log("isBrickBellow_3333", isBrickBellow);

    // const jumpChance = 0.04;
    // if (Math.random() < jumpChance) {
    //   bot.state.isJumping = true;
    //   bot.state.jumpStartTime = timestamp;
    //   bot.state.initialTop = parseFloat(bot.canvas.style.top) || 0;
    //   bot.state.initialLeft = parseFloat(bot.canvas.style.left) || 0;
    //   bot.state.jumpDirection = bot.state.directionBot;
    // }

    botSecond.canvas.style.top = currentTopB;
    if (isFallingBotSecond && !onStairBSecond) {
      console.log("fallingggggggggggggggggggggggggggggggg");

      const currentTopB = parseFloat(botSecond.canvas.style.top);
      // console.log(currentTop);
      console.log(dx);
      botSecond.canvas.style.top = `${currentTopB + gravity}px`;
      // console.log(bot.canvas.style.top);

      botSecond.state.isFallingBotSecond = true;
      botSecond.animation.goToAndStop(3, true);
      // fixCurrentPositionBot;
      // isBrickBellow = false;
    } else {
      if (botSecond.state.isFallingBotSecond) {
        botSecond.state.isFallingBotSecond = false;

        botSecond.animation.goToAndStop(2, true);
        fixCurrentPositionBotSecond();
      } else {
        // fixCurrentPotition();
        botSecond.animation.play();
      }

      // Движение только если НЕ падает
      // bot.canvas.style.left = `${newLeftB}px`;
      // bot.canvas.style.top = `${newTopB}px`;
    }

    //   const newLeftB = currentLeft + dx;
    botSecond.canvas.style.left = `${newLeftB}px`;

    const computedLeft = parseFloat(getComputedStyle(botSecond.canvas).left);
    // const computedTop = parseFloat(getComputedStyle(bot.canvas).top);

    // const adjustedTop = computedTop;
    const centerLeft = computedLeft;
    // + bot.canvas.offsetWidth / 2;

    const colIndex = Math.floor(centerLeft / cellWidth);
    // const rowB = Math.floor(adjustedTop / cellHeight);

    const nextColB = dx > 0 ? colB + 1 : dx < 0 ? colB - 1 : colB;
    const nextRowB = rowB - 1;
    // Проверка границ
    // const colIndex = Math.floor(newLeftB / cellWidth);
    if (
      (colIndex < 0 ||
        colIndex > 29 ||
        matrixBricks[nextRowB]?.[nextColB + 1] === 1) &&
      // ||
      // matrixBricks[nextRowB - 1]?.[nextColB + 1] === 1)
      !onStairBSecond
    ) {
      // fixCurrentPositionBot();
      console.log("WALLLLLLLLLLLLL", matrixBricks[nextRowB]?.[nextColB]);
      console.log(
        "colIndex",
        colIndex,
        matrixBricks[nextRowB]?.[nextColB + 1],
        matrixBricks[nextRowB - 1]?.[nextColB + 1]
      );
      botSecond.state.directionBot =
        botSecond.state.directionBot === "left" ? "right" : "left";

      return;
    }
  }
}
// ============================Sword=======================
let hasSword = false;

// let swordImg; // глобально
let xS = 15;
let yS = 16;
let swordPosition = { x: xS, y: yS }; // координати в матриці

// 🔁 СОЗДАЁМ swordLayer — отдельный слой ниже героя (z-index: 999)
const swordLayer = document.createElement("div");
swordLayer.style.position = "absolute";
swordLayer.style.width = "55px";
swordLayer.style.height = "55px";
swordLayer.style.zIndex = "999"; // ниже героя (у него zIndex 1000)
matrix.appendChild(swordLayer);

// Загрузка меча
fetch("./assets/sword.json")
  .then((res) => res.json())
  .then((data) => {
    swordImg = playSingleSword(data.swordFragments[0], xS, yS);
  })
  .catch((err) => console.error("Помилка завантаження меча:", err));
if (hasSword) {
  syncSwordWithHero();
}
// Отражаем меч в зависимости от направления героя

function playSingleSword(fragment, x, y) {
  const originX = x * cellWidth + fragment.offset.x;
  const originY = y * cellHeight + fragment.offset.y;

  const img = document.createElement("img");
  img.src = fragment.image;
  img.style.position = "absolute";
  img.style.width = "40px";
  img.style.height = "40px";
  img.style.left = `${originX}px`;
  img.style.top = `${originY}px`;
  img.style.transformOrigin = "50% 50%";
  img.style.pointerEvents = "none";
  img.style.zIndex = 0;

  img.style.animation = "spin 2.5s linear infinite";
  img.style.transform = "rotate(-145deg)";
  matrix.appendChild(img);
  swordPosition.x = x;
  swordPosition.y = y;
  //   console.log(
  //     "SWORD++__",
  //     img.style.left,
  //     img.style.top,
  //     swordPosition.x,
  //     swordPosition.y
  //   );
  return img;
}

// CSS-анимация
const style = document.createElement("style");
style.textContent = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`;
document.head.appendChild(style);

// ⚡ ВЫЗЫВАЕШЬ в gameLoop
function syncSwordWithHero() {
  if (!hasSword || !canvas || !swordLayer) return;
  //   if (hasSword) {
  const heroRect = canvas.getBoundingClientRect();
  const gameRect = matrix.getBoundingClientRect();
  const relativeTop = heroRect.top - gameRect.top;

  swordLayer.style.left = canvas.style.left;
  //   swordLayer.style.top = canvas.style.top;
  swordLayer.style.top = `${relativeTop}px`;
  //   }
}

// 🚀 ПОДБОР МЕЧА
function checkSwordPickup(playerY, playerX) {
  if (
    !hasSword &&
    swordImg &&
    (playerX === swordPosition.x + 1 ||
      playerX === swordPosition.x - 1 ||
      playerX === swordPosition.x) &&
    (playerY === swordPosition.y || playerY === swordPosition.y - 1)
    //   playerY === swordPosition.y - 1)
  ) {
    swordLayer.appendChild(swordImg); // переносим в слой героя
    swordImg.style.left = "0px";
    swordImg.style.top = "0px";
    swordImg.style.animation = "none";
    swordImg.style.transform = "rotate(-190deg)";
    hasSword = true;
    swordPosition.x = -1;
    swordPosition.y = -1;
  }
  console.log(
    "PLAYER___________________SWord",
    playerX,
    playerY,
    swordPosition.x,
    swordPosition.y
  );
}

function updateSwordDirection() {
  if (!hasSword || !swordImg) return;

  if (direction === "right") {
    swordImg.style.transform = "rotate(-90deg) scaleX(-1)";
    swordImg.style.left = `0px`;
  } else if (direction === "left") {
    swordImg.style.transform = "rotate(90deg) scaleX(1)";
    swordImg.style.left = `20px`;
  }
  swordImg.style.top = "0px"; // относительно canvas
}

function throwSword() {
  if (!hasSword || !swordImg || isOnStair) return;
  hasSword = false;

  logPositionSword();

  if (swordImg.parentElement === swordLayer) {
    swordLayer.removeChild(swordImg);
  }
  matrix.appendChild(swordImg);

  const playerLeft = parseFloat(canvas.style.left);
  const playerTop = parseFloat(canvas.style.top);

  let currentX = playerLeft + 10;
  let currentY = playerTop + 10;
  swordImg.style.left = `${currentX}px`;
  swordImg.style.top = `${currentY - cellHeight}px`;
  swordImg.style.animation = "spin 0.3s linear infinite";

  const flySpeed = 6;
  const directionMultiplier = direction === "right" ? 1 : -1;

  let hasBounced = false; // ✅ глобальний флаг

  let prevY;
  function animateFlight() {
    currentX += flySpeed * directionMultiplier;
    swordImg.style.left = `${currentX}px`;
    let isHit;
    isHit = checkSwordHitBot();
    console.log("isHit222_______222222", isHit);
    // if (isHit) {
    //   console.log("💥 Попадание меча — отскакиваем!");
    //   // bounceBack();
    //   return;
    // }

    // console.log("isHit222_______222222", bot.state.isHit);

    const colS = Math.floor(currentX / cellWidth);
    const rowS = Math.floor(currentY / cellHeight);

    const checkCol = direction === "right" ? colS + 1 : colS;

    if (matrixBricks?.[rowS]?.[checkCol] === 0 && !isHit) {
      requestAnimationFrame(animateFlight);
    } else {
      swordImg.style.animation = "none";
      swordImg.style.animation = "spinReverse 0.15s linear infinite";
      let bounceDistance = cellWidth;
      let bounceProgress = 0;

      function bounceBack() {
        bounceProgress += flySpeed;
        currentX -= flySpeed * directionMultiplier;
        swordImg.style.left = `${currentX}px`;

        if (bounceProgress < bounceDistance) {
          requestAnimationFrame(bounceBack);
        } else {
          hasBounced = true; // ✅ відзначаємо, що вже був відскок
          //   hasBouncedInFlight = true;

          swordImg.style.animation = "none";
          swordImg.style.transform = "rotate(-145deg)";
          swordPosition.x = Math.floor(currentX / cellWidth) + 1;
          swordPosition.y = Math.floor(currentY / cellHeight);
          prevY = currentY;
          fallDown();
        }
      }

      requestAnimationFrame(bounceBack);
    }
  }

  function fallDown() {
    const fallSpeed = 4;
    swordImg.style.animation = "spinReverse 0.15s linear infinite";
    // let prevY;

    function drop() {
      currentY += fallSpeed;
      swordImg.style.top = `${currentY}px`;

      const col = Math.floor(currentX / cellWidth);
      const row = Math.floor(currentY / cellHeight);

      if (matrixBricks?.[row + 2]?.[col] === 0) {
        // prevY = currentY;
        requestAnimationFrame(drop);
      } else {
        // swordImg.style.animation = "none";
        // swordImg.style.transform = "rotate(-145deg)";
        swordPosition.x = col;
        swordPosition.y = row + 2;
        // fixSword();

        console.log("Меч приземлился в клетке:", col, row);
        fixSwordX();
        // if (!hasBounced && !hasBouncedInFlight) {
        //   hasBounced = true;

        const bounceDistance = cellWidth;
        let bounceProgress = 0;
        console.log(
          "currentY, ______________________________prevY",
          currentY,
          prevY
        );
        function horizontalBounce() {
          if (currentY <= prevY + 7) {
            console.log("Отскок отменён: меч не падал");
            const colS = Math.floor(currentX / cellWidth);
            const rowS = Math.floor(currentY / cellHeight);

            const checkCol = direction === "right" ? colS + 1 : colS;
            console.log(matrixBricks?.[rowS + 1]?.[checkCol]);
            if (matrixBricks?.[rowS + 1]?.[checkCol]) {
              swordImg.style.top = `${currentY - cellHeight}px`;
            }
            swordImg.style.animation = "none";
            return;
          }
          bounceProgress += fallSpeed;
          currentX -= (flySpeed * directionMultiplier) / 2;
          swordImg.style.left = `${currentX}px`;

          if (bounceProgress < bounceDistance) {
            swordImg.style.animation = "spin 0.15s linear infinite";
            requestAnimationFrame(horizontalBounce);
          } else {
            swordPosition.x = Math.floor(currentX / cellWidth) + 1;
            swordPosition.y = Math.floor(currentY / cellHeight) + 2;

            swordImg.style.animation = "none";
            fixSwordY();
            console.log(
              "Меч отскочил вбок и остановился в клетке:",
              swordPosition
            );
            logPositionSword();
          }
        }

        requestAnimationFrame(horizontalBounce);
        // }
      }
    }

    requestAnimationFrame(drop);
  }

  requestAnimationFrame(animateFlight);
}

function checkSwordHitBot() {
  const swordLeft = parseFloat(swordImg.style.left);
  const swordTop = parseFloat(swordImg.style.top);
  const swordWidth = swordImg.offsetWidth;
  const swordHeight = swordImg.offsetHeight;

  // Универсальная функция проверки и обработки попадания
  function processHit(bot) {
    const botLeft = parseFloat(bot.canvas.style.left);
    const botTop = parseFloat(bot.canvas.style.top);
    const botWidth = bot.canvas.offsetWidth;
    const botHeight = bot.canvas.offsetHeight;

    const isHit =
      swordLeft < botLeft + botWidth &&
      swordLeft + swordWidth > botLeft &&
      swordTop < botTop + botHeight &&
      swordTop + swordHeight > botTop;

    if (isHit && !bot.state?.isHit) {
      console.log(
        `🔥 ${bot === botSecond ? "Второй бот" : "Бот"} был поражён мечом!`
      );
      updateScore(100);
      // Сохраняем позицию
      bot.lastPosition = { left: botLeft, top: botTop };

      // Скрываем
      bot.canvas.style.opacity = "0";
      bot.state = { ...bot.state, isHit: true };
      bot.animation.goToAndStop(3, true);

      // Взрыв
      const boomCanvas = document.createElement("div");
      boomCanvas.style.position = "absolute";
      boomCanvas.style.left = `${botLeft}px`;
      boomCanvas.style.top = `${botTop}px`;
      boomCanvas.style.width = "55px";
      boomCanvas.style.height = "55px";
      boomCanvas.style.zIndex = "2000";
      matrix.appendChild(boomCanvas);

      const boomAnimation = lottie.loadAnimation({
        container: boomCanvas,
        renderer: "canvas",
        loop: false,
        autoplay: true,
        path: "./assets/boom.json",
        rendererSettings: {
          clearCanvas: true,
          scaleMode: "noScale",
        },
      });

      setTimeout(() => {
        boomAnimation.destroy();
        boomCanvas.remove();
      }, 2000);

      // Возвращение через 10 сек
      setTimeout(() => {
        if (bot.lastPosition) {
          bot.canvas.style.left = `${bot.lastPosition.left}px`;
          bot.canvas.style.top = `${bot.lastPosition.top}px`;
        }
        bot.canvas.style.opacity = "1";
        bot.state.isHit = false;
        console.log("👻 Бот восстановлен.");
      }, 5000);

      return true;
    }

    return false;
  }

  // Проверка попадания по каждому боту
  const hit1 = processHit(bot);
  const hit2 = processHit(botSecond);

  return hit1 || hit2;
}
// =======================Book=================================
function createTube(x, y, name) {
  const tubeCanvas = document.createElement("div");
  tubeCanvas.style.position = "absolute";
  tubeCanvas.style.width = "70px";
  tubeCanvas.style.height = "70px";
  tubeCanvas.style.zIndex = "1001";
  tubeCanvas.style.left = `${y * cellWidth}px`;
  tubeCanvas.style.top = `${x * cellHeight - 10}px`;
  tubeCanvas.style.pointerEvents = "none";
  tubeCanvas.style.display = "flex";
  tubeCanvas.style.alignItems = "center";
  tubeCanvas.style.justifyContent = "center";

  // Добавляем текст с названием
  const label = document.createElement("div");
  label.textContent = name;
  label.style.position = "absolute";
  label.style.top = "50%";
  label.style.left = "50%";
  label.style.transform = "translate(-50%, -50%)";
  label.style.color = "black";
  label.style.fontSize = "14px";
  label.style.fontWeight = "bold"; // или "900"
  label.style.textAlign = "center";
  label.style.zIndex = "10";
  label.style.pointerEvents = "none";
  tubeCanvas.appendChild(label);

  // Анимация
  const tubeAnimation = lottie.loadAnimation({
    container: tubeCanvas,
    renderer: "canvas",
    loop: true,
    autoplay: true,
    path: "./assets/book.json",
    rendererSettings: {
      clearCanvas: true,
      scaleMode: "noScale",
    },
  });

  matrix.appendChild(tubeCanvas);

  return {
    canvas: tubeCanvas,
    animation: tubeAnimation,
    x,
    y,
    isVisible: true,
  };
}

// ❗️Создаем вручную 4 трубы на разных позициях
const tube1 = createTube(1, 1, "HTML");
const tube2 = createTube(1, 28, "CSS");
const tube3 = createTube(18, 1, "JS");
const tube4 = createTube(16, 28, "REACT");

const tubes = [tube1, tube2, tube3, tube4];

function checkPlayerTubeCollision(playerX, playerY) {
  console.log("Tube________________XY", playerX, playerY);
  for (const tube of tubes) {
    if (!tube.isVisible) continue;

    // Сравниваем координаты — например, точное совпадение
    if (playerX === tube.x + 2 && playerY === tube.y + 1) {
      tube.canvas.style.display = "none";
      tube.isVisible = false;
      console.log("🚫 Труба исчезла на", tube.x, tube.y);
      updateScore(500); // 🎯 очки за трубу
      checkAllTubesCollected();
    }
  }
}

function checkAllTubesCollected() {
  const allGone = tubes.every((tube) => !tube.isVisible);
  if (allGone) {
    showPortal(); // показываем портал
  }
}

let xPor = 15;
let yPor = 7;
let final = false;
const portalEndCanvas = document.createElement("div");
portalEndCanvas.style.position = "absolute";
portalEndCanvas.style.width = "70px";
portalEndCanvas.style.height = "70px";
portalEndCanvas.style.left = `${xPor * cellWidth}px`;
portalEndCanvas.style.top = `${yPor * cellHeight + 20}px`;
portalEndCanvas.style.zIndex = "1001";
matrix.appendChild(portalEndCanvas);

const portalEndAnimation = lottie.loadAnimation({
  container: portalEndCanvas,
  renderer: "canvas",
  loop: false,
  autoplay: false,
  path: "./assets/door.json",
});

portalEndAnimation.addEventListener("DOMLoaded", () => {
  portalEndAnimation.goToAndStop(0, true); // закрытая дверь
});

const portalEnd = {
  canvas: portalEndCanvas,
  animation: portalEndAnimation,
  isActive: true,
  state: "closed", // "closed" | "opening" | "open" | "closing"
};

// запуск когда нужно
function showPortal() {
  portalEndCanvas.style.display = "block";
  console.log("portal____💀💀💀💀💀____________portal*********", portalEnd);
  final = true;
  portalEndAnimation.stop();
  // portalEndAnimation.setSpeed(0.25);
  portalEndAnimation.goToAndPlay(0, true);
}

let hasPlayedOpening = false;

function checkHeroNearPortal(playerX, playerY) {
  if ((!portalEnd.isActive || portalEnd.state !== "closed") && final === false)
    return;

  // console.log(
  //   "playerXY_______________________XYport",
  //   playerX,
  //   playerY,
  //   xPor,
  //   yPor
  // );
  // const totalFrames = portalAnimation.totalFrames;
  // portalAnimation.setSpeed(-0.25);
  // portalAnimation.goToAndPlay(totalFrames, true);
  // console.log("showing portal now");

  const distance = Math.abs(playerY - xPor) + Math.abs(playerX - yPor - 3);

  if (distance <= 4 && final && !hasPlayedOpening) {
    // hasPlayedOpening = true;
    // Переход в состояние "открытие"
    portalEnd.state = "opening";

    // const totalFrames = portalEndAnimation.totalFrames;
    // portalEnd.animation.setSpeed(-0.25);
    // portalEnd.animation.goToAndPlay(totalFrames, true);
    portalEndAnimation.stop();
    // portalEnd.animation.setSpeed(0.25); // вперёд
    portalEnd.animation.goToAndPlay(6, true); // с начала до конца

    // portalEnd.animation.addEventListener("complete", () => {
    //   portalEnd.state = "open";
    // });
  }
}

function checkHeroInsidePortal(playerX, playerY) {
  if (portalEnd.state !== "open" && final === false) return;
  console.log(
    "playerXY_______________________XYport",
    playerX,
    playerY,
    xPor,
    yPor
  );

  if (playerY === xPor && playerX === yPor + 3 && final === true) {
    // portalEnd.state = "closing";
    final = false;

    // const totalFrames = portalEnd.animation.totalFrames;

    // portalEnd.animation.setSpeed(-0.25); // назад
    // portalEnd.animation.goToAndPlay(0, true); // с конца

    // portalEnd.animation.addEventListener("complete", () => {

    console.log("I am here______________--_--");
    animation.goToAndStop(2, true);
    showToBeContinued();

    // });
  }
}

// function checkHeroNearPortal(playerX, playerY) {
//   if (!portal.isActive || portal.openedOnce) return;

//   const portalX = xP;
//   const portalY = yP;

//   const distance = Math.abs(playerX - portalX) + Math.abs(playerY - portalY);

//   if (distance <= 1) {
//     portal.openedOnce = true;
//     portal.animation.setSpeed(1); // вперёд
//     portal.animation.goToAndPlay(0, true); // с начала

//     portal.animation.addEventListener("complete", () => {
//       showToBeContinued(); // Показать финальный экран
//     });
//   }
// }

function showToBeContinued() {
  const message = document.createElement("div");
  message.textContent = "...to be continued";
  message.style.position = "fixed";
  message.style.top = "50%";
  message.style.left = "50%";
  message.style.transform = "translate(-50%, -50%)";
  message.style.color = "white";
  message.style.fontSize = "48px";
  message.style.fontFamily = "monospace";
  message.style.zIndex = "9999";
  document.body.appendChild(message);
  animation.stop();
  // hero.isFrozen = true;
  isGameOver = true;
}

// ========================================================
// hero.canvas.style.display = "block";
// ========================Gameloop====================
function gameLoop(timestamp) {
  if (isGameOver) return;
  // if (hero.isFrozen) return;

  //   updateBotPosition(botSecond, timestamp);
  updateBotSecondPosition(botSecond, timestamp);
  updateBotPosition(bot, timestamp);
  //   if (hasSword) syncSwordWithHero();

  //   frameCount++;

  // botAI();
  // updateBotPosition();
  //

  if (!timestamp) timestamp = performance.now();

  let dx = 0;
  let dy = 0;
  const gravity = 4;
  let angle;

  if (isJumping) {
    const elapsed = timestamp - jumpStartTime;
    const progress = Math.min(elapsed / jumpDuration, 1);
    angle = progress * Math.PI;

    const offsetY = Math.sin(angle) * jumpHeight;
    const offsetX = horizontalDistance * progress;

    let newTop = initialTopPosition - offsetY;
    // console.log(newTop, initialTopPosition, offsetY);

    let newLeft = initialLeftPosition + offsetX;
    // console.log(newLeft, initialLeftPosition, offsetX);

    // Проверка на выход за пределы колонок
    const colIndex = Math.floor(newLeft / cellWidth);
    console.log(colIndex);
    if (colIndex < 0 || colIndex >= 29) {
      isJumping = false;
      isFallingNow = true;
      console.log("🚫 Прыжок за пределы — начинаем падение");
      requestAnimationFrame(gameLoop);
      fixCurrentPotitionX();
      return;
    }

    // Обновление позиции
    canvas.style.top = `${newTop}px`;
    canvas.style.left = `${newLeft}px`;

    let targetRow = null;
    const canvasBottom = newTop + canvas.offsetHeight;
    console.log("canvasBottom", canvasBottom);
    const col = Math.floor(newLeft / brickSize);
    const rowBelow = Math.floor(canvasBottom / brickSize);
    // const standingRow = Math.ceil((newTop + canvas.offsetHeight) / brickSize);
    console.log("jumpDirection", direction);
    // const rowBelow = Math.floor(canvasBottom / brickSize);
    if (direction === "right") {
      console.log("Direction", direction);
      if (matrixBricks?.[roww]?.[coll + 2] === 1 && roww === 20 && coll === 2) {
        targetRow = 20;
      } else if (matrixBricks?.[roww - 1]?.[coll + 4] === 1) {
        console.log("collllllllllllllllllllll", coll + 4);
        targetRow = roww - 1;
        console.log("targetRow", targetRow);
      } else {
        targetRow = null;
        console.log("targetRow", targetRow);
      }
    } else if (direction === "left") {
      console.log("Direction", direction);
      console.log("Brick", roww, coll - 2, matrixBricks?.[roww]?.[coll - 2]);
      if (matrixBricks?.[roww]?.[coll - 2] === 1 && roww === 20 && coll === 6) {
        targetRow = 20;
      } else if (
        matrixBricks?.[roww]?.[coll - 2] === 1 &&
        roww === 20 &&
        coll === 7
      ) {
        targetRow = 20;
      } else if (matrixBricks?.[roww - 1]?.[coll - 4] === 1) {
        console.log("col", coll - 4);
        targetRow = roww - 1;
        console.log("targetRow", targetRow);
      } else {
        targetRow = null;
        console.log("targetRow", targetRow);
      }
    }

    // const standingOnBrick = matrixBricks?.[rowBelow]?.[col] === 1;

    // const canvasBottom = newTop + canvas.offsetHeight;
    // const col = Math.floor(newLeft / brickSize);

    if (!(targetRow === null) && hasJumpDirection && angle > Math.PI / 2) {
      //   const alignedTop = rowBelow * brickSize - canvas.offsetHeight;
      //   canvas.style.top = `${alignedTop}px`;
      //   canvas.style.top = `${standingRow * brickSize - canvas.offsetHeight}px`;

      canvas.style.top = `${targetRow * brickSize - canvas.offsetHeight}px`;
      fixCurrentPotitionX();
      console.log("canvas.style.top", canvas.style.top);
      console.log("targetRow", targetRow);
      console.log("brickSize", brickSize);

      console.log("🎯 Приземлился на:", canvas.style.top);
      animation.goToAndStop(2, true);
      isJumping = false;
      finishJump();
    }

    if (progress >= 1) {
      isJumping = false;
      // isJumpingVer = false;
      jumpDirection = null;
      horizontalDistance = 0;
      // isJumping = false;
      animation.goToAndStop(2, true); // поза стоя
    }
  }
  function finishJump() {
    console.log("=== прыжок завершён ===");
    isJumping = false;
    // isJumpingVer = false;
    jumpDirection = null;
    horizontalDistance = 0;
    if (running) {
      animation.play();
    } else {
      animation.goToAndStop(2, true);
      isJumping = false;
    }
    console.log("isJumping", isJumping);
  }

  if (!isJumping) {
    if (
      (!isOnStair && keys.ArrowRight && keys.ArrowDown) ||
      (!isOnStair && keys.ArrowLeft && keys.ArrowUp)
    ) {
      directionStairs = "right";

      const currentDown = matrixStairsRight[roww]?.[coll] === 1;
      const nextDown = matrixStairsRight[roww + 1]?.[coll + 1] === 1;

      const currentUp = matrixStairsRight[roww - 1]?.[coll - 1] === 1;
      const nextUp = matrixStairsRight[roww - 2]?.[coll - 2] === 1;

      if (currentDown && nextDown && true) {
        isOnStair = true;
        direction = "right";
      } else if (currentUp && nextUp && true) {
        isOnStair = true;
        direction = "left";
      }
    }
    if (
      (!isOnStair && keys.ArrowRight && keys.ArrowUp) ||
      (!isOnStair && keys.ArrowLeft && keys.ArrowDown)
    ) {
      directionStairs = "left";
      const currentDownL = matrixStairsLeft[roww]?.[coll + 1] === 1;
      const nextDownL = matrixStairsLeft[roww + 1]?.[coll] === 1;
      //   console.log(currentDownL);
      //   console.log(nextDownL);
      const currentUpL = matrixStairsLeft[roww - 1]?.[coll + 1] === 1;
      const nextUpL = matrixStairsLeft[roww - 2]?.[coll + 2] === 1;
      //   console.log(currentUpL);
      //   console.log(nextUpL);

      if (currentDownL && nextDownL && true) {
        isOnStair = true;
        direction = "left";
      } else if (currentUpL && nextUpL && true) {
        isOnStair = true;
        direction = "right";
      }
    }

    // === Если на лестнице — приоритет
    if (isOnStair) {
      console.log("isOnStair", isOnStair);
      if (keys.ArrowRight) {
        direction = "right";

        if (directionStairs === "right") {
          dx = moveSpeed;
          dy = moveSpeed;
          canvas.style.transform = "scaleX(1)";
          let currentEndDown = matrixStairsRight[roww]?.[coll - 1] === 1;
          let currentEndDownTest = matrixStairsRight[roww]?.[coll] === 1;
          let currentEndDownTestNext = matrixBricks[roww]?.[coll] === 1;

          if (
            !currentEndDown &&
            !currentEndDownTest &&
            currentEndDownTestNext
          ) {
            isOnStair = false;
            currentEndDown = null;
            currentEndDownTest = null;
            currentEndDownTestNext = null;

            fixCurrentPotitionY();
          }
        }
        if (directionStairs === "left") {
          dx = moveSpeed;
          dy = -moveSpeed;
          canvas.style.transform = "scaleX(1)";

          let currentEndDown = matrixStairsLeft[roww - 1]?.[coll + 1] === 1;
          let currentEndDownTest = matrixStairsLeft[roww]?.[coll] === 1;
          let currentEndDownTestNext = matrixBricks[roww]?.[coll] === 1;

          console.log("currentEndDown", currentEndDown);
          console.log("currentEndDownTest", currentEndDownTest);
          console.log("currentEndDownTestNext", currentEndDownTestNext);

          if (
            !currentEndDown &&
            !currentEndDownTest &&
            currentEndDownTestNext
          ) {
            isOnStair = false;
            currentEndDown = null;
            currentEndDownTest = null;
            currentEndDownTestNext = null;

            fixCurrentPotitionY();
          }
        }

        // direction = null;
      } else if (keys.ArrowLeft) {
        direction = "left";
        if (directionStairs === "right") {
          dx = -moveSpeed;
          dy = -moveSpeed;
          canvas.style.transform = "scaleX(-1)";

          let currentEndUp = matrixStairsRight[roww]?.[coll] === 1;
          let nextEndUp = matrixStairsRight[roww - 1]?.[coll - 1] === 0;
          if (currentEndUp && nextEndUp) {
            isOnStair = false;
            currentEndUp = null;
            nextEndUp = null;

            fixCurrentPotitionY();
          }
        }
        if (directionStairs === "left") {
          dx = -moveSpeed;
          dy = moveSpeed;
          canvas.style.transform = "scaleX(-1)";

          let currentEndUp = matrixStairsLeft[roww]?.[coll + 1] === 1;
          let nextEndUp = matrixStairsLeft[roww + 1]?.[coll + 1] === 1;
          let nextEndUpNext = matrixBricks[roww]?.[coll] === 1;

          console.log(currentEndUp);
          console.log(nextEndUp);
          console.log(nextEndUpNext);

          if (!currentEndUp && !nextEndUp && nextEndUpNext) {
            isOnStair = false;
            currentEndUp = null;
            nextEndUp = null;
            nextEndUpNext = null;

            fixCurrentPotitionY();
          }
        }
      } else {
        // Нет нажатия — стоим
        dx = 0;
        dy = 0;
        animation.goToAndStop(2, true); // поза стоя
      }
    }

    // === Обычные движения — если НЕ на лестнице ===
    else if (keys.ArrowRight) {
      dx = moveSpeed;
      dy = 0;
      direction = "right";
      canvas.style.transform = "scaleX(1)";
    } else if (keys.ArrowLeft) {
      dx = -moveSpeed;
      dy = 0;
      direction = "left";
      canvas.style.transform = "scaleX(-1)";
    }

    //   --------------------------------------
    logCurrentCellPosition();

    //   // проверка на пропасть
    const belowRow = roww;
    const belowCol = coll;
    const isFalling =
      matrixBricks[belowRow]?.[belowCol] === 0 &&
      matrixStairsRight[belowRow]?.[belowCol] === 0 &&
      matrixStairsLeft[belowRow]?.[belowCol] === 0 &&
      isOnStair === false;

    if (isFalling && !isJumping) {
      const currentTop = parseFloat(canvas.style.top);
      const currentLeft = parseFloat(canvas.style.left);
      const standingBelow = matrixBricks[belowRow]?.[coll] === 1;

      if (running && angle === undefined) {
        const rightGap = matrixBricks[belowRow]?.[coll + 1] === 0;
        const leftGap = matrixBricks[belowRow]?.[coll - 1] === 0;

        const offsetF = rightGap ? 11 : leftGap ? -11 : 0;
        if (offsetF !== 0) {
          canvas.style.left = `${currentLeft + offsetF}px`;
          // isFallingNow = true; // почали падіння

          console.log("↪ Смещение при падении: ", {
            running,
            angle,
          });
        }
      }
      canvas.style.top = `${currentTop + gravity}px`; // падает вниз
      running = false;
      animation.goToAndStop(5, true); // стоячая поза
      if (!isFallingNow) {
        isFallingNow = true;
        // updateSwordDirect    ion();

        animation.goToAndStop(5, true); // поза падения/прыжка
      }
      if (hasSword) {
        updateSwordDirection();
        syncSwordWithHero(); // 💥 Обновляем позицию меча даже во время падения
      }
      requestAnimationFrame(gameLoop); // повтор цикла
      return;
    } else if (isFallingNow) {
      // только что приземлился
      isFallingNow = false;
      animation.goToAndStop(2, true); // поза стоя
      // прекратить обработку остального
    }

    // 2. Перевірка на стіну
    const nextCol = dx > 0 ? coll + 1 : dx < 0 ? coll - 1 : coll;
    const nextRow = roww - 1;
    if (dx !== 0 || dy !== 0) {
      if (
        (matrixBricks[nextRow]?.[nextCol] === 1 ||
          matrixBricks[nextRow - 1]?.[nextCol] === 1) &&
        isOnStair === false
      ) {
        console.log(
          `⛔ Стена ${dx > 0 ? "справа" : "слева"}!`,

          nextRow,
          nextCol
        );
        fixCurrentPotitionX();
        running = false;
        animation.goToAndStop(2, true);
      } else {
        // 3. Рух і анімація
        const currentLeft = parseFloat(canvas.style.left);
        const currentTop = parseFloat(canvas.style.top);
        const newLeft = currentLeft + dx;
        const newTop = currentTop + dy;
        canvas.style.left = `${newLeft}px`;
        canvas.style.top = `${newTop}px`;

        logCurrentCellPosition();

        running = true;
        animation.play();
      }
    } else {
      // 4. Немає руху
      if (running) {
        running = false;
        // fixCurrentPotition();
        animation.goToAndStop(2, true);
      }
    }
  }

  checkHeroNearPortal(roww, coll);
  checkHeroInsidePortal(roww, coll);

  checkPlayerTubeCollision(roww, coll);

  checkSwordPickup(roww, coll);
  if (hasSword) {
    updateSwordDirection(); // оновлюємо положення меча
    syncSwordWithHero(); // тримаємо меч поруч з героєм
  }

  if (!isGameOver && !bot.state?.isHit && checkPlayerHitByBot(bot)) {
    console.log("❌ Герой пойман первым ботом");
    loseLife();
    // return;
  }

  if (
    !isGameOver &&
    !botSecond.state?.isHit &&
    checkPlayerHitByBot(botSecond)
  ) {
    console.log("❌ Герой пойман вторым ботом");
    loseLife();
    return;
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
// --------------------Sword--------------------------(;
