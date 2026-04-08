const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
let snake = [{ x: 200, y: 200 }];
let direction = "";
let inputQueue = [];
let lastTime = 0;
let paused = true;
let gameStarted = false;
const speed = 100;

document.getElementById("startBtn").onclick = () => {
    document.getElementById("menu").classList.add("hidden");
    paused = false;
    gameStarted = true;
};

function gameLoop(currentTime) {
    if (currentTime - lastTime > speed) {
        update();
        draw();
        lastTime = currentTime;
    }
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

function update() {
    if (paused) return;

    if (inputQueue.length > 0){
        direction = inputQueue.shift();
    }
    
    const head = { ...snake[0] };
    const prev = { ...head };

    if (direction === "RIGHT")  head.x += gridSize;
    if (direction === "LEFT")   head.x -= gridSize;
    if (direction === "UP")     head.y -= gridSize;
    if (direction === "DOWN")   head.y += gridSize;

    if (head.x === prev.x && head.y === prev.y) return;

    const hitWall = head.x < 0
                 || head.y < 0
                 || head.x >= canvas.width
                 || head.y >= canvas.height;

    const hitSelf = snake.some(segment => segment.x === head.x && segment.y === head.y);
    if (hitSelf || hitWall) return;

    if (head.x === apple.x && head.y === apple.y) {
        // Snake eats apple
        snake.push({}); // add a new segment (will be positioned later)

        // Move apple to a new random spot
        apple.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
        apple.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
    }

    snake.unshift(head);
    snake.pop();
}

document.addEventListener("keydown", e => {
    if (keyMap.PAUSE.includes(e.key)) {
        if (!gameStarted) return;
        paused = !paused;
        inputQueue = [];
        return;
    } 

    if (!gameStarted || paused) return;

    let newDir = null;
    if (keyMap.UP.includes(e.key)) newDir = "UP";
    if (keyMap.DOWN.includes(e.key)) newDir = "DOWN";
    if (keyMap.LEFT.includes(e.key)) newDir = "LEFT";
    if (keyMap.RIGHT.includes(e.key)) newDir = "RIGHT";
    
    if (!newDir) return;

    const lastDir = inputQueue.length > 0
        ? inputQueue[inputQueue.length - 1]
        : direction;

    if (
        (newDir === "UP" && lastDir !== "DOWN") ||
        (newDir === "DOWN" && lastDir !== "UP") ||
        (newDir === "LEFT" && lastDir !== "RIGHT") ||
        (newDir === "RIGHT" && lastDir !== "LEFT")
    ) {
        inputQueue.push(newDir);
    }
});

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "lime";
    snake.forEach(part => {
        ctx.fillRect(part.x, part.y, gridSize, gridSize);
    });

    ctx.fillStyle = "red";
    ctx.fillRect(apple.x, apple.y, gridSize, gridSize);
}

const apple = {
    x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
    y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
};

const keyMap = {
    UP: ["ArrowUp", "w"],
    DOWN: ["ArrowDown", "s"],
    LEFT: ["ArrowLeft", "a"],
    RIGHT: ["ArrowRight", "d"],
    PAUSE: ["x"]
};

