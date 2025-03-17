const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Game State
const players = {};
const bullets = [];
const blocks = [];
let materials = 100;

// Player Object
const player = {
    id: 'player1',
    x: 400,
    y: 300,
    width: 40,
    height: 60,
    speed: 5,
    health: 100,
    isBuilding: false,
    facing: 'right'
};

// Key Press States
const keys = {
    a: false,
    d: false,
    w: false,
    s: false,
    space: false,
    e: false
};

// Event Listeners
document.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case 'a': keys.a = true; break;
        case 'd': keys.d = true; break;
        case 'w': keys.w = true; break;
        case 's': keys.s = true; break;
        case ' ': keys.space = true; break;
        case 'e': keys.e = true; break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.key.toLowerCase()) {
        case 'a': keys.a = false; break;
        case 'd': keys.d = false; break;
        case 'w': keys.w = false; break;
        case 's': keys.s = false; break;
        case ' ': keys.space = false; break;
        case 'e': keys.e = false; break;
    }
});

// Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Update Game State
function update() {
    // Player Movement
    if (keys.a) { player.x -= player.speed; player.facing = 'left'; }
    if (keys.d) { player.x += player.speed; player.facing = 'right'; }
    if (keys.w) player.y -= player.speed;
    if (keys.s) player.y += player.speed;

    // Shooting
    if (keys.space) shoot();

    // Building
    if (keys.e && materials >= 10) {
        placeBlock();
        materials -= 10;
    }

    // Update Bullets
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });

    // Collision Detection (Simplified)
    blocks.forEach(block => {
        if (checkCollision(player, block)) {
            // Simple collision response
            player.x = player.prevX;
            player.y = player.prevY;
        }
    });
}

// Draw Everything
function draw() {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Player
    ctx.fillStyle = '#00f';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw Bullets
    ctx.fillStyle = '#ff0';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw Blocks
    ctx.fillStyle = '#666';
    blocks.forEach(block => {
        ctx.fillRect(block.x, block.y, block.width, block.height);
    });
}

// Shooting Mechanic
function shoot() {
    bullets.push({
        x: player.facing === 'right' ? player.x + player.width : player.x,
        y: player.y + player.height/2,
        dx: player.facing === 'right' ? 10 : -10,
        dy: 0
    });
}

// Building Mechanic
function placeBlock() {
    const blockSize = 40;
    const gridX = Math.floor((player.x + player.width/2) / blockSize) * blockSize;
    const gridY = Math.floor((player.y + player.height/2) / blockSize) * blockSize;

    if (!blocks.some(b => b.x === gridX && b.y === gridY)) {
        blocks.push({
            x: gridX,
            y: gridY,
            width: blockSize,
            height: blockSize
        });
    }
}

// Start the Game
gameLoop();
