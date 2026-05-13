const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const healthText = document.getElementById('health');
const scoreText = document.getElementById('score');
const enemyCountText = document.getElementById('enemyCount');
const gameOverScreen = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');

let keys = {};
let bullets = [];
let enemies = [];
let particles = [];
let stars = [];
let score = 0;
let gameRunning = true;

for (let i = 0; i < 200; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        speed: Math.random() * 1 + 0.5
    });
}

class Player {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.radius = 25;
        this.speed = 5;
        this.health = 100;
        this.angle = 0;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = '#38bdf8';

        ctx.beginPath();
        ctx.moveTo(30, 0);
        ctx.lineTo(-20, -20);
        ctx.lineTo(-10, 0);
        ctx.lineTo(-20, 20);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    move() {
        if (keys['w']) this.y -= this.speed;
        if (keys['s']) this.y += this.speed;
        if (keys['a']) this.x -= this.speed;
        if (keys['d']) this.x += this.speed;

        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width) this.x = canvas.width;
        if (this.y < 0) this.y = 0;
        if (this.y > canvas.height) this.y = canvas.height;
    }
}

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.speed = 10;

        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;
    }

    draw() {
        ctx.fillStyle = '#facc15';

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
    }
}

class Enemy {
    constructor() {
        const side = Math.floor(Math.random() * 4);

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

        this.radius = Math.random() * 15 + 15;
        this.speed = Math.random() * 1.5 + 1;
        this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
    }

    draw() {
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    update(player) {
        const angle = Math.atan2(
            player.y - this.y,
            player.x - this.x
        );

        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;

        this.radius = Math.random() * 4;

        this.dx = (Math.random() - 0.5) * 8;
        this.dy = (Math.random() - 0.5) * 8;

        this.life = 100;
        this.color = color;
    }

    draw() {
        ctx.globalAlpha = this.life / 100;

        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        this.life -= 2;
    }
}

const player = new Player();

window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
});

window.addEventListener('mousemove', e => {
    const dx = e.clientX - player.x;
    const dy = e.clientY - player.y;

    player.angle = Math.atan2(dy, dx);
});

window.addEventListener('click', () => {
    if (!gameRunning) return;

    bullets.push(
        new Bullet(player.x, player.y, player.angle)
    );
});

function spawnEnemy() {
    enemies.push(new Enemy());
}

setInterval(() => {
    if (gameRunning) {
        spawnEnemy();
    }
}, 1000);

function drawStars() {
    for (let star of stars) {

        ctx.fillStyle = 'white';

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        star.y += star.speed;

        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    }
}

function collision(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    return Math.sqrt(dx * dx + dy * dy) < r1 + r2;
}

function gameLoop() {

    if (!gameRunning) return;

    requestAnimationFrame(gameLoop);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawStars();

    player.move();
    player.draw();

    bullets.forEach((bullet, bulletIndex) => {

        bullet.update();
        bullet.draw();

        if (
            bullet.x < 0 ||
            bullet.x > canvas.width ||
            bullet.y < 0 ||
            bullet.y > canvas.height
        ) {
            bullets.splice(bulletIndex, 1);
        }
    });

    enemies.forEach((enemy, enemyIndex) => {

        enemy.update(player);
        enemy.draw();

        if (
            collision(
                player.x,
                player.y,
                player.radius,
                enemy.x,
                enemy.y,
                enemy.radius
            )
        ) {

            player.health -= 1;

            healthText.innerText = player.health;

            if (player.health <= 0) {

                gameRunning = false;

                gameOverScreen.style.display = 'block';
            }
        }

        bullets.forEach((bullet, bulletIndex) => {

            if (
                collision(
                    bullet.x,
                    bullet.y,
                    bullet.radius,
                    enemy.x,
                    enemy.y,
                    enemy.radius
                )
            ) {

                for (let i = 0; i < 15; i++) {

                    particles.push(
                        new Particle(
                            enemy.x,
                            enemy.y,
                            enemy.color
                        )
                    );
                }

                enemies.splice(enemyIndex, 1);
                bullets.splice(bulletIndex, 1);

                score += 10;

                scoreText.innerText = score;
            }
        });
    });

    particles.forEach((particle, index) => {

        particle.update();
        particle.draw();

        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });

    enemyCountText.innerText = enemies.length;
}

gameLoop();

restartBtn.addEventListener('click', () => {
    location.reload();
});

window.addEventListener('resize', () => {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

});
