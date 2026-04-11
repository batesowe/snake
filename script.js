const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let selectedGrid = 12;
const gridSize = 24;
let cols = 12;
let rows = 12;
canvas.width = cols * gridSize;
canvas.height = rows * gridSize;

let inputQueue = [];
let lastTime = 0;
let paused = true;
let gameStarted = false;
let apples = [];
let appleAmt = 1;
const speed = 120;

const startSize = 3;
const startX = Math.floor(cols / 2) * gridSize;
const startY = Math.floor(rows / 2) * gridSize;
let direction = "";
let snake = [];
for (let i = 0; i < startSize; i++) {
    snake.push({ x: startX - gridSize * i, y: startY, dir: "RIGHT" });
}

spawnApples(appleAmt);

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


document.getElementById("resumeBtn").onclick = () => {
    document.getElementById("pauseMenu").classList.add("hidden");
};

document.getElementById("newGameBtn").onclick = () => {
    document.getElementById("settingsMenu").classList.add("hidden");
    document.getElementById("mainMenu").classList.remove("hidden");
};

document.getElementById("backBtn").onclick = () => {
    document.getElementById("settingsMenu").classList.add("hidden");
    document.getElementById("mainMenu").classList.remove("hidden");
    document.getElementById("settingsBtn").classList.remove("hidden");
};

document.getElementById("settingsBtn").onclick = () => {
    document.getElementById("settingsMenu").classList.remove("hidden");
    document.getElementById("settingsBtn").classList.add("hidden");
};

document.querySelectorAll("[data-apples]").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll("[data-apples]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        appleAmt = parseInt(btn.dataset.apples);
        startGame();
    };
});

document.querySelectorAll("[data-grid]").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll("[data-grid]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedGrid = parseInt(btn.dataset.grid);
        startGame();
    };
});

document.getElementById("startBtn").onclick = () => {
    document.getElementById("menu").classList.add("hidden");
    paused = false;
    gameStarted = true;
};

document.getElementById("resumeBtn").onclick = () => {
    document.getElementById("pauseMenu").classList.add("hidden");
    paused = false;
};

document.getElementById("newGameBtn").onclick = () => {
    document.getElementById("pauseMenu").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
    paused = true;
    gameStarted = false;
    startGame();
};

function startGame() {
    rows = selectedGrid;
    cols = selectedGrid;
    canvas.width = cols * gridSize;
    canvas.height = rows * gridSize;

    direction = "";
    inputQueue = [];
    snake = [];
    for (let i = 0; i < startSize; i++) {
        snake.push({
            x: Math.floor(cols / 2) * gridSize - gridSize * i,
            y: Math.floor(rows / 2) * gridSize,
            dir: "RIGHT"
        });
    }

    apples = [];
    spawnApples(appleAmt);
}


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

    if (hitSelf(head) || hitWall(head)) {
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
        paused = !paused
        if (paused) {
            document.getElementById("pauseMenu").classList.remove("hidden");
        }
        else {
            document.getElementById("pauseMenu").classList.add("hidden");
        }
        inputQueue = [];
        return;
    } 

    if (keyMap.RESTART.includes(e.key)) {
        startGame()
    }

    if (keyMap.STARTGAME.includes(e.key)) {
        document.getElementById("menu").classList.add("hidden");
        document.getElementById("pauseMenu").classList.add("hidden");
        paused = false;
        gameStarted = true;
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
        if (inputQueue.length < 4) {
            inputQueue.push(newDir);
        }
    }
});

function draw() {
    const angles = { RIGHT: 90, DOWN: 180, LEFT: 270, UP: 0 };
    ctx.imageSmoothingEnabled = false;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.fillStyle = (row + col) % 2 === 0
                ? "#4e5885"
                : "#25293a";
            ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize)
        }
    }

    snake.forEach((part, index) => {
        const prev = snake[index - 1]; 

        if (index === 0) { // head
            drawRotatedImage(snakeHeadImg, part.x, part.y, angles[part.dir]);
        }
        else if (index === snake.length - 1) { // tail
            drawRotatedImage(snakeTailImg, part.x, part.y, angles[prev.dir]);
        }
        else { // body
            if (prev.dir !== part.dir) {
                if (prev.dir === 0) return;

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
    PAUSE: ["Escape"],
    STARTGAME: [" "],
    RESTART: ["r"]
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

function hitWall(head) {
    return head.x < 0
        || head.y < 0
        || head.x >= canvas.width
        || head.y >= canvas.height;
}

function hitSelf(head) {
    return snake.some(segment => segment.x === head.x && segment.y === head.y);;
}