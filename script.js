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
let score = 0;

let headVisualDir = "RIGHT";
let snakeSnapshot = [];
let showPreview = false;
let dyingHead = false;

let isDead = false;
let deathTimer = 0;
let deadSegments = 0;
const deathSpeed = 100;

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

document.getElementById("backBtn").onclick = () => {
    document.getElementById("settingsMenu").classList.add("hidden");
    document.getElementById("mainMenu").classList.remove("hidden");
    document.getElementById("settingsBtn").classList.remove("hidden");
};

document.getElementById("settingsBtn").onclick = () => {
    document.getElementById("settingsMenu").classList.remove("hidden");
    document.getElementById("settingsBtn").classList.add("hidden");
};

document.getElementById("startBtn").onclick = () => {
    document.getElementById("settingsMenu").classList.add("hidden");
    document.getElementById("settingsBtn").classList.remove("hidden");
    document.getElementById("menu").classList.add("hidden");
    paused = false;
    gameStarted = true;
};

document.getElementById("resumeBtn").onclick = () => {
    document.getElementById("pauseMenu").classList.add("hidden");
    paused = false;
};

document.getElementById("previewBtn").onclick = () => {
    showPreview = !showPreview
    document.getElementById("previewBtn").textContent = showPreview ? "HIDE" : "SHOW SNAKE";
    document.getElementById("gameOverContent").classList.toggle("hidden");
    document.getElementById("gameOver").classList.toggle("transparent");
    draw();
};

document.querySelectorAll(".newGameBtn").forEach(btn => {
    btn.onclick = () => {
        document.getElementById("gameWin").classList.add("hidden");
        document.getElementById("pauseMenu").classList.add("hidden");
        document.getElementById("gameOver").classList.add("hidden");
        document.getElementById("previewBtn").classList.toggle("hidden");
        document.getElementById("menu").classList.remove("hidden");
        paused = true;
        gameStarted = false;
        startGame();
    };
});

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

function startGame() {
    dyingHead = false;
    isDead = false;
    deadSegments = 0;
    rows = selectedGrid;
    cols = selectedGrid;
    canvas.width = cols * gridSize;
    canvas.height = rows * gridSize;

    headVisualDir = "RIGHT";
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
    if (isDead) {
        if (currentTime - deathTimer > deathSpeed) {
            deadSegments++;
            deathTimer = currentTime;
            if (deadSegments >= snake.length) {
                gameStarted = false;
                paused = true;
                document.getElementById("gameOver").classList.remove("hidden");
                document.getElementById("previewBtn").classList.remove("hidden");
            }
            draw();
        }
        requestAnimationFrame(gameLoop);
        return;
    }

    if (currentTime - lastTime > speed) {
        update();
        draw();
        lastTime = currentTime;
    }
    requestAnimationFrame(gameLoop);
}

let snakeMoved = false;

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

    const blocked = hitSelf(head) || hitWall(head);

    if (dyingHead) {
        isDead = true;
        dyingHead = false;
        snakeMoved = false;
        snakeSnapshot = snake.map (p => ({ ...p }));
        return
    }

    if (blocked) {
        dyingHead = true;
        snake.unshift({ ...head, dir: direction });
        snake.pop();
        headVisualDir = direction;
        snakeMoved = true;
        return;
    }

    snakeMoved = true;
    headVisualDir = direction;
    snake.unshift({ ...head, dir: direction });

    const eatenIndex = apples.findIndex(a => a.x === head.x && a.y === head.y);
    if (eatenIndex !== -1) {
        apples.splice(eatenIndex, 1);
        score++;
        spawnApples(1);

        if (snake.length >= (canvas.width / gridSize) * (canvas.height / gridSize)) {
            gameStarted = false;
            paused = true;
            snakeSnapshot = snake.map(p => ({ ...p }));
            document.getElementById("gameWin").classList.remove("hidden");
            return;
        }
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

    if (keyMap.STARTGAME.includes(e.key)) {
        if (document.getElementById("menu").classList.contains("hidden")) return;
        hideMenus();
        document.getElementById("settingsMenu").classList.add("hidden");
        document.getElementById("settingsBtn").classList.remove("hidden");
        paused = false;
        gameStarted = true;
    } 

    if (keyMap.RESTART.includes(e.key)) {
        headVisualDir = "RIGHT";
        direction = "RIGHT";
        paused = false;
        gameStarted = true;
        hideMenus();
        startGame()
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
        : direction === "" 
            ? "RIGHT"
            :direction;

    if ((direction === "" || newDir !== lastDir) && (
        (newDir === "UP" && lastDir !== "DOWN") ||
        (newDir === "DOWN" && lastDir !== "UP") ||
        (newDir === "LEFT" && lastDir !== "RIGHT") ||
        (newDir === "RIGHT" && lastDir !== "LEFT")
    )) {
        if (inputQueue.length < 4) {
            inputQueue.push(newDir);
        }
    }
});

function draw() {
    ctx.imageSmoothingEnabled = false;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.fillStyle = (row + col) % 2 === 0
                ? "#4e5885"
                : "#25293a";
            ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize)
        }
    }

    const snakeToDraw = showPreview && deadSegments >= snake.length ? snakeSnapshot : snake;
    drawSnake(snakeToDraw);

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

function drawRotatedImage(img, x, y, angle, flipX = false) {
    ctx.save();
    ctx.translate(x + gridSize / 2, y + gridSize / 2);
    ctx.rotate(angle * Math.PI / 180)
    if (flipX) ctx.scale(-1, 1);
    ctx.drawImage(img, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
    ctx.restore();
}

function getCornerAngle(from, to) {
    // clockwise turns (original sprite)
    if (from === "LEFT" && to === "UP") return [0, false];
    if (from === "UP" && to === "RIGHT") return [90, false];
    if (from === "RIGHT" && to === "DOWN") return [180, false];
    if (from === "DOWN" && to === "LEFT") return [270, false];
    // counter-clockwise turns (flipped sprite)
    if (from === "RIGHT" && to === "UP") return [0, true];
    if (from === "DOWN" && to === "RIGHT") return [90, true];
    if (from === "LEFT" && to === "DOWN") return [180, true];
    if (from === "UP" && to === "LEFT") return [270, true];

    return [0, false];
}

function getTurnedHeadAngle(bodyDir, headDir) {
    if (bodyDir === "DOWN" && headDir === "RIGHT") return [0, false];
    if (bodyDir === "LEFT" && headDir === "DOWN") return [90, false];
    if (bodyDir === "UP" && headDir === "LEFT") return [180, false];
    if (bodyDir === "RIGHT" && headDir === "UP") return [270, false];
    if (bodyDir === "DOWN" && headDir === "LEFT") return [0, true];   // flipped
    if (bodyDir === "LEFT" && headDir === "UP") return [90, true];  // flipped
    if (bodyDir === "UP" && headDir === "RIGHT") return [180, true]; // flipped
    if (bodyDir === "RIGHT" && headDir === "DOWN") return [270, true]; // flipped
    return [0, false];
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

function getNextHead() {
    const next = { ...snake[0] };
    if (direction === "RIGHT") next.x += gridSize;
    if (direction === "LEFT") next.x -= gridSize;
    if (direction === "UP") next.y -= gridSize;
    if (direction === "DOWN") next.y += gridSize;
    return next;
}

function hideMenus() {
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("pauseMenu").classList.add("hidden");
    document.getElementById("gameOver").classList.add("hidden");
    document.getElementById("gameWin").classList.add("hidden");
    document.getElementById("previewBtn").classList.add("hidden");
}

function drawSnake(snakeArr) {
    const angles = { RIGHT: 90, DOWN: 180, LEFT: 270, UP: 0 };
    const segmentsToSkip = snakeArr === snakeSnapshot ? 0 : deadSegments;

    snakeArr.forEach((part,index) => {
        if (index < segmentsToSkip) return;
        const prev = snakeArr[index - 1];

        if (index === 0) { // head
            drawRotatedImage(snakeHeadImg, part.x, part.y, angles[headVisualDir]);
        }
        else if (index === snakeArr.length - 1) { // tail
            drawRotatedImage(snakeTailImg, part.x, part.y, angles[prev.dir]);
        }
        else { // body
            const effectivePrevDir = prev.dir;

            if (effectivePrevDir !== part.dir) {
                if (index === 1) {
                    console.log("part.dir:", part.dir, "effectivePrevDir:", effectivePrevDir);
                }
                const [cornerAngle, flip] = getCornerAngle(part.dir, effectivePrevDir);
                drawRotatedImage(snakeCornerImg, part.x, part.y, cornerAngle, flip);
            }
            else {
                drawRotatedImage(snakeBodyImg, part.x, part.y, angles[part.dir]);
            }
        }
    });
}