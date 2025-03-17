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
// Enhanced Game State
const weapons = {
    ar: { damage: 10, fireRate: 100, ammo: 30, speed: 15 },
    shotgun: { damage: 25, fireRate: 800, ammo: 8, speed: 20 },
    sniper: { damage: 75, fireRate: 1500, ammo: 5, speed: 30 }
};
let currentWeapon = 'ar';
let isJumping = false;
let velocityY = 0;
const gravity = 0.8;

// New Building Types
const buildingTypes = {
    wall: { width: 40, height: 40, cost: 10 },
    floor: { width: 80, height: 20, cost: 15 },
    ramp: { width: 40, height: 20, cost: 20 }
};
let currentBuilding = 'wall';

// Resource Nodes (Trees)
const resources = [
    { x: 200, y: 400, type: 'tree', health: 50 }
];

// Enhanced Player Object
const player = {
    // ... (previous properties)
    weaponAmmo: weapons.ar.ammo,
    canJump: true,
    isReloading: false
};

// Enhanced Key Handler
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    switch(key) {
        case '1': currentBuilding = 'wall'; break;
        case '2': currentBuilding = 'floor'; break;
        case '3': currentBuilding = 'ramp'; break;
        case 'r': reloadWeapon(); break;
    }
});

// Jumping and Gravity
function handlePhysics() {
    velocityY += gravity;
    player.y += velocityY;

    // Ground collision
    if (player.y + player.height > canvas.height - 50) {
        player.y = canvas.height - 50 - player.height;
        velocityY = 0;
        isJumping = false;
        player.canJump = true;
    }
}

// Enhanced Shooting
function shoot() {
    if (player.weaponAmmo <= 0 || player.isReloading) return;

    const weapon = weapons[currentWeapon];
    player.weaponAmmo--;

    // Shotgun spread
    if (currentWeapon === 'shotgun') {
        for (let i = 0; i < 5; i++) {
            bullets.push(createBullet(weapon.speed + Math.random() * 3));
        }
    } else {
        bullets.push(createBullet(weapon.speed));
    }

    // Auto-reload
    if (player.weaponAmmo <= 0) reloadWeapon();
}

function createBullet(speed) {
    return {
        x: player.facing === 'right' ? player.x + player.width : player.x,
        y: player.y + player.height/2,
        dx: (player.facing === 'right' ? speed : -speed) + (Math.random() * 2 - 1),
        dy: (Math.random() * 2 - 1),
        damage: weapons[currentWeapon].damage
    };
}

// Weapon Reloading
function reloadWeapon() {
    player.isReloading = true;
    setTimeout(() => {
        player.weaponAmmo = weapons[currentWeapon].ammo;
        player.isReloading = false;
    }, 1500);
}

// Enhanced Building
function placeBlock() {
    const building = buildingTypes[currentBuilding];
    if (materials < building.cost) return;

    const block = {
        x: Math.floor((player.x + player.width/2) / 40) * 40,
        y: Math.floor((player.y + player.height/2) / 40) * 40,
        ...building,
        type: currentBuilding
    };

    // Ramp orientation
    if (currentBuilding === 'ramp') {
        block.rotation = player.facing === 'right' ? 0 : 180;
    }

    blocks.push(block);
    materials -= building.cost;
}

// Resource Collection
function collectResources() {
    resources.forEach((resource, index) => {
        if (distance(player, resource) < 50 && resource.health > 0) {
            resource.health -= 1;
            if (resource.health <= 0) {
                materials += 50;
                resources.splice(index, 1);
            }
        }
    });
}

// Enhanced Update Function
function update() {
    handlePhysics();
    collectResources();

    // Jumping
    if ((keys.w || keys.space) && player.canJump) {
        velocityY = -18;
        isJumping = true;
        player.canJump = false;
    }

    // ... (previous update code)
}

// Enhanced Drawing
function draw() {
    // ... (previous draw code)

    // Draw Resources
    ctx.fillStyle = '#2d5a27';
    resources.forEach(resource => {
        ctx.fillRect(resource.x, resource.y, 30, 60); // Simple tree
    });

    // Draw UI Elements
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Weapon: ${currentWeapon} (${player.weaponAmmo})`, 10, 40);
    ctx.fillText(`Building: ${currentBuilding}`, 10, 60);
}

// Utility Functions
function distance(obj1, obj2) {
    return Math.sqrt((obj1.x - obj2.x)**2 + (obj1.y - obj2.y)**2);
}
