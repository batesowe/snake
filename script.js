const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 24;
const cols = 10;
const rows = 20;
canvas.width = cols * gridSize;
canvas.height = rows * gridSize;

const startSize = 3;
const startX = Math.floor(cols / 2) * gridSize;
const startY = Math.floor(rows / 2) * gridSize;

let direction = "";
let snake = [];
for(let i = 0; i < startSize; i++) {
    snake.push({ x: startX - gridSize * i, y: startY, dir: "RIGHT"});
}

let inputQueue = [];
let lastTime = 0;
let paused = true;
let gameStarted = false;
let apples = [];
let appleAmt = 3;
const speed = 120;

const appleImg = new Image();
appleImg.src = "Sprites/apple.png";

const snakeHeadImg = new Image();
snakeHeadImg.src = "Sprites/snakeHead.png"

const snakeBodyImg = new Image();
snakeBodyImg.src = "Sprites/snakeBody.png"

const snakeTailImg = new Image();
snakeTailImg.src = "Sprites/snakeTail.png"

const snakeCornerImg = new Image();
snakeCornerImg.src = "Sprites/snakeCorner.png"

document.getElementById("startBtn").onclick = () => {
    document.getElementById("menu").classList.add("hidden");
    paused = false;
    gameStarted = true;
};

spawnApples(appleAmt);
requestAnimationFrame(gameLoop);

function gameLoop(currentTime) {
    if (currentTime - lastTime > speed) {
        update();
        draw();
        lastTime = currentTime;
    }
    requestAnimationFrame(gameLoop);
}

function update() {
    if (paused) return;

    if (inputQueue.length > 0) direction = inputQueue.shift();
    
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
    if (hitSelf || hitWall) {
        snake[0].dir = direction;
        return;
    }

    snake.unshift({ ...head, dir: direction });

    const eatenIndex = apples.findIndex(a => a.x === head.x && a.y === head.y);
    if (eatenIndex !== -1) {
        apples.splice(eatenIndex, 1);
        spawnApples(1);
    } else {
        snake.pop();
    }
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
    const angles = { RIGHT: 90, DOWN: 180, LEFT: 270, UP: 0 };
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snake.forEach((part, index) => {
        console.log(index, snake.length);
        if (index === 0) { // head
            drawRotatedImage(snakeHeadImg, part.x, part.y, angles[part.dir]);
        }
        else if (index === snake.length - 1) { // tail
            drawRotatedImage(snakeTailImg, part.x, part.y, angles[part.dir]);
        }
        else { // body
            const prev = snake[index - 1];
            if (prev.dir !== part.dir) {
                const cornerAngle = getCornerAngle(part.dir, prev.dir);
                drawRotatedImage(snakeCornerImg, part.x, part.y, cornerAngle);
            }
            else {
                drawRotatedImage(snakeBodyImg, part.x, part.y, angles[part.dir]);
            }
        }
        
    });

    apples.forEach(apple => {
        ctx.drawImage(appleImg, apple.x, apple.y, gridSize, gridSize);
    });
}

function spawnApples(amount) {
    const totalCells = (canvas.width / gridSize) * (canvas.height / gridSize);
    const occupiedCells = snake.length + apples.length;

    if (occupiedCells >= totalCells) return;

    for (let i = 0; i < amount; i++) {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
        };
    } while (snake.some(segment => segment.x === pos.x && segment.y === pos.y) || apples.some(apple => apple.x === pos.x && apple.y === pos.y));
    apples.push(pos);
    }   
}

const keyMap = {
    UP: ["ArrowUp", "w"],
    DOWN: ["ArrowDown", "s"],
    LEFT: ["ArrowLeft", "a"],
    RIGHT: ["ArrowRight", "d"],
    PAUSE: ["x"]
};

function drawRotatedImage(img, x, y, angle) {
    ctx.save();
    ctx.translate(x + gridSize / 2, y + gridSize / 2);
    ctx.rotate(angle * Math.PI / 180)
    ctx.drawImage(img, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
    ctx.restore();
}

function getCornerAngle(from, to) {
    if (from === "RIGHT" && to === "UP") return 270;
    if (from === "RIGHT" && to === "DOWN") return 180;
    if (from === "LEFT" && to === "UP") return 0;
    if (from === "LEFT" && to === "DOWN") return 90;
    if (from === "DOWN" && to === "RIGHT") return 0;
    if (from === "DOWN" && to === "LEFT") return 270;
    if (from === "UP" && to === "RIGHT") return 90;
    if (from === "UP" && to === "LEFT") return 180;
}