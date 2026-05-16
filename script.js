const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const healthUI = document.getElementById("health");
const scoreUI = document.getElementById("score");
const enemyUI = document.getElementById("enemyCount");

const gameOverBox = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");

const shootSound = new Audio("sounds/Shoot.mp3");
const hitSound = new Audio("sounds/hit.mp3");
const explosionSound = new Audio("sounds/Explosion.mp3");
const bgMusic = new Audio("sounds/background.mp3");

bgMusic.loop = true;
bgMusic.volume = 0.3;

shootSound.volume = 0.5;
hitSound.volume = 0.5;
explosionSound.volume = 0.7;

window.addEventListener("click", () => {
    if (!running) return;

    // start music once
    if (bgMusic.paused) {
        bgMusic.play();
    }

    // shoot
    bullets.push(new Bullet(player.x, player.y, player.angle));

    shootSound.currentTime = 0;
    shootSound.play();
});

let keys = {};
let bullets = [];
let enemies = [];
let effects = [];

let score = 0;
let running = true;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,

    size: 26,
    speed: 5,

    hp: 100,
    angle: 0,

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.moveTo(28, 0);
        ctx.lineTo(-18, -18);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-18, 18);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.arc(-15, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    move() {
        if (keys["w"]) this.y -= this.speed;
        if (keys["s"]) this.y += this.speed;
        if (keys["a"]) this.x -= this.speed;
        if (keys["d"]) this.x += this.speed;

        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width) this.x = canvas.width;

        if (this.y < 0) this.y = 0;
        if (this.y > canvas.height) this.y = canvas.height;
    }
};

function Bullet(x, y, angle) {
    this.x = x;
    this.y = y;
    this.size = 5;

    this.velX = Math.cos(angle) * 10;
    this.velY = Math.sin(angle) * 10;

    this.update = function () {
        this.x += this.velX;
        this.y += this.velY;
    };

    this.draw = function () {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    };
}

function Enemy() {
    let side = Math.floor(Math.random() * 4);

    if (side === 0) {
        this.x = 0;
        this.y = Math.random() * canvas.height;
    } else if (side === 1) {
        this.x = canvas.width;
        this.y = Math.random() * canvas.height;
    } else if (side === 2) {
        this.x = Math.random() * canvas.width;
        this.y = 0;
    } else {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
    }

    this.size = Math.random() * 15 + 15;
    this.speed = Math.random() * 2 + 1;
    this.color = `hsl(${Math.random() * 360},80%,60%)`;

    this.update = function () {
        let angle = Math.atan2(
            player.y - this.y,
            player.x - this.x
        );

        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    };

    this.draw = function () {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    };
}

function Particle(x, y, color) {
    this.x = x;
    this.y = y;

    this.size = Math.random() * 4;
    this.dx = (Math.random() - 0.5) * 7;
    this.dy = (Math.random() - 0.5) * 7;

    this.life = 100;
    this.color = color;

    this.update = function () {
        this.x += this.dx;
        this.y += this.dy;
        this.life -= 3;
    };

    this.draw = function () {
        ctx.globalAlpha = this.life / 100;
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
    };
}

let stars = [];

for (let i = 0; i < 150; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2,
        speed: Math.random() * 1.5
    });
}

function drawStars() {
    for (let star of stars) {
        ctx.fillStyle = "white";

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();

        star.y += star.speed;

        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    }
}

//  INPUT 

window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

window.addEventListener("mousemove", e => {
    player.angle = Math.atan2(
        e.clientY - player.y,
        e.clientX - player.x
    );
});

window.addEventListener("click", () => {
    if (!running) return;

    bullets.push(new Bullet(player.x, player.y, player.angle));
});

//COLLISION

function checkCollision(x1, y1, r1, x2, y2, r2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy) < r1 + r2;

}

// SPAWN 

setInterval(() => {
    if (running) enemies.push(new Enemy());
}, 1000);

//GAME LOOP 

function animate() {
    if (!running) return;

    requestAnimationFrame(animate);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawStars();

    player.move();
    player.draw();

    // bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        bullets[i].draw();

        if (
            bullets[i].x < 0 ||
            bullets[i].x > canvas.width ||
            bullets[i].y < 0 ||
            bullets[i].y > canvas.height
        ) {
            bullets.splice(i, 1);
        }
    }

    // enemies
    for (let e = enemies.length - 1; e >= 0; e--) {

        enemies[e].update();
        enemies[e].draw();

        // player hit
        if (
            checkCollision(
            player.x, player.y, player.size,
            enemies[e].x, enemies[e].y, enemies[e].size
            )
            
        ) {

            hitSound.currentTime = 0;
            hitSound.play();

            player.hp -= 1;
            if (player.hp < 0) player.hp = 0;

            healthUI.innerText = player.hp;

            if (player.hp <= 0) {
                running = false;
                gameOverBox.style.display = "block";
            }
        }

        // bullet hit
        for (let b = bullets.length - 1; b >= 0; b--) {

            if (
                checkCollision(
                    bullets[b].x, bullets[b].y, bullets[b].size,
                    enemies[e].x, enemies[e].y, enemies[e].size
                )
            ) {
                for (let p = 0; p < 15; p++) {
                    effects.push(new Particle(
                        enemies[e].x,
                        enemies[e].y,
                        enemies[e].color
                    ));
                }

                enemies.splice(e, 1);
                bullets.splice(b, 1);

                explosionSound.currentTime = 0;
                explosionSound.play();

                score += 10;
                scoreUI.innerText = score;

                break;
            }
        }
    }

    // particles
    for (let i = effects.length - 1; i >= 0; i--) {
        effects[i].update();
        effects[i].draw();

        if (effects[i].life <= 0) {
            effects.splice(i, 1);
        }
    }

    enemyUI.innerText = enemies.length;
}

animate();

// restart
restartBtn.addEventListener("click", () => {
    location.reload();
});

// resize fix
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
