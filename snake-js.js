// snake game - script.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const boxSize = 20;
const cols = canvas.width / boxSize;   // 20
const rows = canvas.height / boxSize;  // 20

let snake, dir, nextDir, fruit, poison;
let score, lives;
let bestScore = 0;
let gameRunning = false;
let gameLoop;
const scores = [];

// helpers
function randInt(n) {
  return Math.floor(Math.random() * n);
}

function samePos(a, b) {
  return a.x === b.x && a.y === b.y;
}

function getEmptySpot() {
  let spot;
  let tries = 0;
  do {
    spot = { x: randInt(cols - 2) + 1, y: randInt(rows - 2) + 1 };
    tries++;
  } while (tries < 200 && (
    snake.some(s => samePos(s, spot)) ||
    (fruit && samePos(fruit, spot)) ||
    (poison && samePos(poison, spot))
  ));
  return spot;
}

// setup
function setupGame() {
  snake = [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 }
  ];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  lives = 3;
  fruit = getEmptySpot();
  poison = getEmptySpot();
  updateScore();
}

function updateScore() {
  document.getElementById("score").innerHTML =
    "score: " + score + " &nbsp;|&nbsp; best: " + bestScore + " &nbsp;|&nbsp; lives: " + lives;
}

// drawing
function drawGame() {
  // background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // walls
  ctx.fillStyle = "lime";
  for (let x = 0; x < cols; x++) {
    ctx.fillRect(x * boxSize, 0, boxSize, boxSize);
    ctx.fillRect(x * boxSize, (rows - 1) * boxSize, boxSize, boxSize);
  }
  for (let y = 1; y < rows - 1; y++) {
    ctx.fillRect(0, y * boxSize, boxSize, boxSize);
    ctx.fillRect((cols - 1) * boxSize, y * boxSize, boxSize, boxSize);
  }

  // fruit
  if (fruit) {
    ctx.fillStyle = "red";
    ctx.fillRect(fruit.x * boxSize, fruit.y * boxSize, boxSize, boxSize);
    ctx.fillStyle = "white";
    ctx.font = "14px arial";
    ctx.textAlign = "center";
    ctx.fillText("F", fruit.x * boxSize + boxSize / 2, fruit.y * boxSize + 15);
  }

  // poison
  if (poison) {
    ctx.fillStyle = "purple";
    ctx.fillRect(poison.x * boxSize, poison.y * boxSize, boxSize, boxSize);
    ctx.fillStyle = "white";
    ctx.font = "14px arial";
    ctx.textAlign = "center";
    ctx.fillText("P", poison.x * boxSize + boxSize / 2, poison.y * boxSize + 15);
  }

  // snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "lime" : "green";
    ctx.fillRect(snake[i].x * boxSize, snake[i].y * boxSize, boxSize, boxSize);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.strokeRect(snake[i].x * boxSize, snake[i].y * boxSize, boxSize, boxSize);
  }
}

// game tick
function tick() {
  dir = { x: nextDir.x, y: nextDir.y };

  const newHead = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y
  };

  // wall or self collision
  if (
    newHead.x <= 0 || newHead.x >= cols - 1 ||
    newHead.y <= 0 || newHead.y >= rows - 1 ||
    snake.some(s => samePos(s, newHead))
  ) {
    lives--;
    updateScore();
    if (lives <= 0) {
      endGame();
      return;
    } else {
      document.getElementById("message").innerHTML = "oof! lives left: " + lives;
      snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
      dir = { x: 1, y: 0 };
      nextDir = { x: 1, y: 0 };
      drawGame();
      return;
    }
  }

  snake.unshift(newHead);

  if (samePos(newHead, fruit)) {
    score += 10;
    if (score > bestScore) bestScore = score;
    document.getElementById("message").innerHTML = "+10 points!!";
    fruit = getEmptySpot();
    if (randInt(3) === 0) poison = getEmptySpot();
  } else if (samePos(newHead, poison)) {
    lives--;
    document.getElementById("message").innerHTML = "ew poison!! -1 life";
    if (snake.length > 3) snake.splice(snake.length - 2, 2);
    poison = getEmptySpot();
    if (lives <= 0) {
      endGame();
      return;
    }
  } else {
    snake.pop();
  }

  updateScore();
  drawGame();
}

function endGame() {
  clearInterval(gameLoop);
  gameRunning = false;

  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "red";
  ctx.font = "bold 40px arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = "white";
  ctx.font = "20px arial";
  ctx.fillText("score: " + score, canvas.width / 2, canvas.height / 2 + 35);

  const name = prompt("game over lol\nyour score: " + score + "\n\nenter ur name:") || "anonymous";

  scores.push({ name, score });
  scores.sort((a, b) => b.score - a.score);
  if (scores.length > 5) scores.length = 5;

  const list = document.getElementById("sbList");
  list.innerHTML = "";
  for (let i = 0; i < scores.length; i++) {
    const li = document.createElement("li");
    li.innerHTML = scores[i].name + " - " + scores[i].score;
    list.appendChild(li);
  }

  document.getElementById("message").innerHTML = "game over!! click start game to play again";
}

function startGame() {
  if (gameRunning) clearInterval(gameLoop);
  setupGame();
  drawGame();
  gameRunning = true;
  document.getElementById("message").innerHTML = "go!!";
  gameLoop = setInterval(tick, 130);
}

// controls
document.addEventListener("keydown", function(e) {
  if (e.key === "ArrowUp"    || e.key === "w") { if (dir.y !== 1)  nextDir = { x: 0,  y: -1 }; }
  if (e.key === "ArrowDown"  || e.key === "s") { if (dir.y !== -1) nextDir = { x: 0,  y: 1  }; }
  if (e.key === "ArrowLeft"  || e.key === "a") { if (dir.x !== 1)  nextDir = { x: -1, y: 0  }; }
  if (e.key === "ArrowRight" || e.key === "d") { if (dir.x !== -1) nextDir = { x: 1,  y: 0  }; }

  if (!gameRunning) startGame();

  if (e.key.startsWith("Arrow")) e.preventDefault();
});

// draw on load
setupGame();
drawGame();
