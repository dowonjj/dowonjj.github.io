(function () {
  "use strict";

  const canvas = document.getElementById("game-board");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const gridSize = 20;
  const cellSize = canvas.width / gridSize;
  const stepTime = 180;
  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  const scoreElement = document.getElementById("score");
  const highScoreElement = document.getElementById("high-score");
  const stateElement = document.getElementById("game-state");
  const statusElement = document.getElementById("game-status");
  let snake;
  let food;
  let enemies;
  let direction;
  let queuedDirection;
  let score = 0;
  let highScore = readHighScore();
  let timerId = null;
  let running = false;
  let paused = false;
  let gameOver = false;

  function readHighScore() {
    try { return Number(window.localStorage.getItem("worm-high-score")) || 0; }
    catch (error) { return 0; }
  }

  function saveHighScore() {
    try { window.localStorage.setItem("worm-high-score", String(highScore)); }
    catch (error) { /* Storage may be disabled. */ }
  }

  function samePosition(first, second) { return first.x === second.x && first.y === second.y; }

  function occupied(position) {
    return snake.some(function (segment) { return samePosition(segment, position); }) ||
      enemies.some(function (enemy) { return samePosition(enemy, position); });
  }

  function randomPosition() {
    let position;
    do { position = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) }; }
    while (occupied(position));
    return position;
  }

  function updateHud() {
    scoreElement.textContent = String(score);
    highScoreElement.textContent = String(highScore);
    stateElement.textContent = gameOver ? "게임 오버" : paused ? "일시정지" : running ? "실행 중" : "대기 중";
  }

  function setStatus(message) {
    statusElement.textContent = message;
    updateHud();
  }

  function resetGame() {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    enemies = [{ x: 5, y: 5 }, { x: 15, y: 15 }];
    direction = directions.right;
    queuedDirection = direction;
    score = 0;
    gameOver = false;
    paused = false;
    food = randomPosition();
    draw();
    updateHud();
  }

  function startGame() {
    if (timerId !== null) window.clearInterval(timerId);
    resetGame();
    running = true;
    setStatus("게임이 시작되었습니다.");
    timerId = window.setInterval(tick, stepTime);
  }

  function pauseGame() {
    if (!running || gameOver) return;
    paused = !paused;
    setStatus(paused ? "일시정지되었습니다." : "게임을 계속합니다.");
  }

  function endGame() {
    running = false;
    gameOver = true;
    if (timerId !== null) { window.clearInterval(timerId); timerId = null; }
    if (score > highScore) { highScore = score; saveHighScore(); }
    setStatus("충돌했습니다. 재시작 버튼으로 다시 도전하세요.");
    draw();
  }

  function moveEnemies() {
    enemies = enemies.map(function (enemy) {
      const choices = Object.keys(directions).map(function (key) { return directions[key]; }).filter(function (candidate) {
        const next = { x: enemy.x + candidate.x, y: enemy.y + candidate.y };
        return next.x >= 0 && next.x < gridSize && next.y >= 0 && next.y < gridSize;
      });
      const move = choices[Math.floor(Math.random() * choices.length)];
      return { x: enemy.x + move.x, y: enemy.y + move.y };
    });
  }

  function tick() {
    if (!running || paused) return;
    direction = queuedDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const outside = head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
    if (outside || snake.some(function (segment) { return samePosition(segment, head); }) || enemies.some(function (enemy) { return samePosition(enemy, head); })) { endGame(); return; }
    snake.unshift(head);
    if (samePosition(head, food)) { score += 10; food = randomPosition(); }
    else snake.pop();
    moveEnemies();
    if (enemies.some(function (enemy) { return samePosition(enemy, snake[0]); })) { endGame(); return; }
    draw();
    updateHud();
  }

  function setDirection(nextDirection) {
    const candidate = directions[nextDirection];
    if (!candidate || (candidate.x + direction.x === 0 && candidate.y + direction.y === 0)) return;
    queuedDirection = candidate;
  }

  function drawCell(position, color) {
    context.fillStyle = color;
    context.fillRect(position.x * cellSize + 1, position.y * cellSize + 1, cellSize - 2, cellSize - 2);
  }

  function draw() {
    context.fillStyle = "#020805";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(101, 255, 154, .08)";
    for (let line = 0; line <= gridSize; line += 1) {
      context.beginPath(); context.moveTo(line * cellSize, 0); context.lineTo(line * cellSize, canvas.height); context.stroke();
      context.beginPath(); context.moveTo(0, line * cellSize); context.lineTo(canvas.width, line * cellSize); context.stroke();
    }
    drawCell(food, "#fff06a");
    enemies.forEach(function (enemy) { drawCell(enemy, "#ff647c"); });
    snake.forEach(function (segment, index) { drawCell(segment, index === 0 ? "#65ff9a" : "#2bbd6c"); });
  }

  document.addEventListener("keydown", function (event) {
    const keyMap = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };
    if (keyMap[event.key]) { event.preventDefault(); setDirection(keyMap[event.key]); }
    if (event.key === "p" || event.key === "P") { event.preventDefault(); pauseGame(); }
  });
  document.querySelectorAll("[data-direction]").forEach(function (button) {
    button.addEventListener("click", function () { setDirection(button.dataset.direction); });
  });
  document.getElementById("start-game").addEventListener("click", startGame);
  document.getElementById("pause-game").addEventListener("click", pauseGame);
  document.getElementById("restart-game").addEventListener("click", startGame);
  resetGame();
}());
