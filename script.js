const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const healthUI = document.getElementById("health");
const scoreUI = document.getElementById("score");
const enemyUI = document.getElementById("enemyCount");

const gameOverBox = document.getElementById("gameOver");
const restartBtm = document.getElementById("restartBtn");

let keys = {};
let bullets = [];
let enemies = [];
let effects = [];

let score = 0;
let running = true;

// PLAYER

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

        // main ship body

        ctx.fillStyle = "#38bdf8";

        ctx.beginPath();
        ctx.moveTo(28, 0);
        ctx.lineTo(-18, -18);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-18, -18);
        ctx.closePath();

        ctx.fill();

        // little engine low
        ctx.fillStyle = "#f97316";

        ctx.beginPath();
        ctx.arc(-15, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    move() {
        if (keys["w"]) {
            this.y -= this.speed;
        }

        if (keys["s"]) {
            this.y += this.speed;
        }

        if (keys["a"]) {
            this.x -= this.speed;
        }

        if (keys["d"]) {
            this.x += this.speed;
        }

        // Stop leaving screen
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width) this.x = canvas.width;

        if (this.y < 0) this.y = 0;
        if (this.y > canvas.height) this.y = canvas.height;
    }
};

// Bullet

function Bullet(x, y, angle) {
    this.x = x;
    this.y = y;

    this.size = 5;

    this.velX = Math.cos(angle) * 10;
    this.velY = Math.sin(angle) * 10;

    this.draw = function () {
        ctx.fillStyle = "yellow";

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    };

    this.update = function () {
        this.x += this.velX;
        this.y += this.velY;
    };
}

// Enemy

function Enemy() {

    let side= Math.floor(Math.random() * 4);

    if (side === 0){
        this.x = 0;
        this.y = Math.random() * canvas.height;
    }

    else if (side === 1){
        this.x = canvas.width;
        this.y = Math.random() * canvas.width;
    }

    else if (side === 2 ){
        this.x = Math.random() * canvas.width;
        this.y = 0;
    } 

    else {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
    }

    this.size = Math.random() * 15 + 15;

    this.speed = Math.random() * 2 + 1;

    this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;

    this.draw = function () {

        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    };

    this.update = function () {
        let angle = Math.atan2(
            player.y - this.y,
            player.x - this.x
        );

        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    };
}

// Particles

function Particle(x, y, color) {

    this.x = x;
    this.y = y;

    this.size = Math.random() * 4;

    this.dx = (Math.random() - 0.5) * 7;
    this.dy = (Math.random() - 0.5) * 7;

    this.life = 100;

    this.color = color;

    this.draw = function () {

        ctx.globalAlpha = this.life / 100;

        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
    };

    this.update = function () {

        this.x += this.dx;
        this.y += this.dy;

        this.life -= 3;
    };
    }

//  Background star

let star = [];

for (let i = 0; i < 150; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2,
        speed: Math.random() * 1.5
    });
}

