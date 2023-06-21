const socket = io()
const FPS = 60
let gravity = { x: 0, y: 0.4 }
let arm = new Image()
arm.src = "/arm.png"
let leg = new Image()
leg.src = "/leg.png"
let body = new Image()
body.src = "/body.png"

let playerOrigin = {
    imageSrc: "/player.png",
    frameRate: 1,
    loop: true,
    scale: 3,
    animations: {
        //2 2
        Idle2A2L: {
            frameRate: 1,
            frameBuffer: 3,
            loop: true,
            imageSrc: "/AIdle2A2L.png"
        },
        Falling2A2L: {
            frameRate: 1,
            frameBuffer: 5,
            loop: true,
            imageSrc: "/AFalling2A2L.png"
        },
        Walk2A2L: {
            frameRate: 4,
            frameBuffer: 5,
            loop: true,
            imageSrc: "/AFWalk2A2L.png"
        },
        //2 1
        Idle2A1L: {
            frameRate: 1,
            frameBuffer: 3,
            loop: true,
            imageSrc: "/AIdle2A1L.png"
        },
        Falling2A1L: {
            frameRate: 1,
            frameBuffer: 5,
            loop: true,
            imageSrc: "/AFalling2A1L.png"
        },
        Walk2A1L: {
            frameRate: 4,
            frameBuffer: 5,
            loop: true,
            imageSrc: "/AFWalk2A1L.png"
        },
        //2 0
        Idle2A0L: {
            frameRate: 1,
            frameBuffer: 3,
            loop: true,
            imageSrc: "/AFWalk2A0L.png"
        },
        Falling2A0L: {
            frameRate: 1,
            frameBuffer: 3,
            loop: true,
            imageSrc: "/AFWalk2A0L.png"
        },
        Walk2A0L: {
            frameRate: 1,
            frameBuffer: 3,
            loop: true,
            imageSrc: "/AFWalk2A0L.png"
        },
        //1 2
        Idle1A2L: {
            frameRate: 1,
            frameBuffer: 3,
            loop: true,
            imageSrc: "/AIdle1A2L.png"
        },
        Falling1A2L: {
            frameRate: 1,
            frameBuffer: 5,
            loop: true,
            imageSrc: "/AFalling1A2L.png"
        },
        Walk1A2L: {
            frameRate: 4,
            frameBuffer: 5,
            loop: true,
            imageSrc: "/AFWalk1A2L.png"
        },
        //1 1
        Idle1A1L: {
            frameRate: 1,
            frameBuffer: 3,
            loop: true,
            imageSrc: "/AIdle1A1L.png"
        },
        Falling1A1L: {
            frameRate: 1,
            frameBuffer: 5,
            loop: true,
            imageSrc: "/AFalling1A1L.png"
        },
        Walk1A1L: {
            frameRate: 4,
            frameBuffer: 5,
            loop: true,
            imageSrc: "/AFWalk1A1L.png"
        },
        //1 0
        Idle1A0L: {
            frameRate: 1,
            frameBuffer: 3,
            loop: true,
            imageSrc: "/AFWalk1A0L.png"
        },
        Falling1A0L: {
            frameRate: 1,
            frameBuffer: 5,
            loop: true,
            imageSrc: "/AFWalk1A0L.png"
        },
        Walk1A0L: {
            frameRate: 1,
            frameBuffer: 5,
            loop: true,
            imageSrc: "/AFWalk1A0L.png"
        },
        //0 2
        Idle0A2L: {
            frameRate: 1,
            frameBuffer: 3,
            loop: true,
            imageSrc: "/AIdle0A2L.png"
        },
        Falling0A2L: {
            frameRate: 1,
            frameBuffer: 5,
            loop: true,
            imageSrc: "/AFalling0A2L.png"
        },
        Walk0A2L: {
            frameRate: 4,
            frameBuffer: 5,
            loop: true,
            imageSrc: "/AFWalk0A2L.png"
        },
        //0 1
        Idle0A1L: {
            frameRate: 1,
            frameBuffer: 3,
            loop: true,
            imageSrc: "/AIdle0A1L.png"
        },
        Falling0A1L: {
            frameRate: 1,
            frameBuffer: 5,
            loop: true,
            imageSrc: "/AFalling0A1L.png"
        },
        Walk0A1L: {
            frameRate: 4,
            frameBuffer: 5,
            loop: true,
            imageSrc: "/AFWalk0A1L.png"
        },
        //0 0
        Idle0A0L: {
            frameRate: 1,
            frameBuffer: 3,
            loop: true,
            imageSrc: "/AFWalk0A0L.png"
        },
        Falling0A0L: {
            frameRate: 1,
            frameBuffer: 5,
            loop: true,
            imageSrc: "/AFWalk0A0L.png"
        },
        Walk0A0L: {
            frameRate: 1,
            frameBuffer: 5,
            loop: true,
            imageSrc: "/AFWalk0A0L.png"
        },
    }
}

let blood = new Particle(
    {
        x: 0,
        y: 0
    },
    { width: 5, height: 5 },
    30,
    2,
    270 - 45,
    90,
    0,
    (e) => {
        e.size.width /= e.size.width > 1.5 ? 1.02 : 1
        e.size.height /= e.size.width > 1.5 ? 1.02 : 1
        e.velocity.x *= 1.003
        e.velocity.y += 0.1
        return e
    }
)

let part = new Particle(
    { x: 0, y: 0 },
    { width: 4 * 3, height: 6 * 3 },
    300,
    1,
    270 - 10,
    20,
    0,
    (e) => {
        if (e.angle == 0) { e.angle = Math.random() * 360 }
        e.angle += Math.random() * 15;
        e.velocity.x /= 1.08
        e.velocity.y += 0.1
        return e
    }
)

let parts = []
let particles = []

const canvas = document.getElementById('game')
let ctx = canvas.getContext('2d')
const screenWidth = 1280
const screenHeight = 720

let players = {}
let canFire = true;
let client;
let prev_pos = { x: 0, y: 0 }
let margin = 0.1

let keys = {}

function keyDown(event) {
    keys[event.code] = true;
}

function keyUp(event) {
    keys[event.code] = false;
}

let mouse = {
    position: {
        x: 0,
        y: 0
    }
}

function mouseMove(event) {
    mouse.position.x = event.clientX
    mouse.position.y = event.clientY
}

function start() {
    canvas.width = screenWidth
    canvas.height = screenHeight
    ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false;

    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
    document.addEventListener("click", () => {
        if (client.live && canFire) {
            socket.emit("fireClient", client.gun, client.fliped);
            if (client.gun == 0) { setTimeout(() => { canFire = true; }, 1000) }
            if (client.gun == 1) { setTimeout(() => { canFire = true; }, 2500) }
            canFire = false;
        }
    });

    document.addEventListener("mousemove", mouseMove)

    requestAnimationFrame(loop)
}

let map;
let background;
let collisionBlocks = []
let tileW;
let tileH;

function drawMap(debug = false) {
    if (debug) {
        for (let i = 0; i < collisionBlocks.length; i++) {
            collisionBlocks[i].draw(ctx, "rgba(255, 0, 0, 0.5)")
        }
    }
}

function drawBackground() {
    background.draw(false)
}

let projectiles = []

function drawProjectile(p) {
    ctx.fillStyle = "YELLOW"
    ctx.fillRect(p.position.x, p.position.y, p.size.width, p.size.height);
}

function checkHorizontalCollisionWithBlocks(a) {
    let x = a.position.x + (a.hitbox ? a.hitbox.x : 0)
    let y = a.position.y + (a.hitbox ? a.hitbox.y : 0)
    for (let i = 0; i < collisionBlocks.length; i++) {
        const collisionBlock = collisionBlocks[i]

        if (
            x <= collisionBlock.position.x + collisionBlock.size.width &&
            x + (a.hitbox ? a.hitbox.width : a.size.width) >= collisionBlock.position.x &&
            y <= collisionBlock.position.y + collisionBlock.size.height &&
            y + (a.hitbox ? a.hitbox.height : a.size.height) >= collisionBlock.position.y
        ) {
            if (a.velocity.x < 0) {
                a.velocity.x = 0
                a.position.x = collisionBlock.position.x + collisionBlock.size.width + margin - (a.hitbox ? a.hitbox.x : 0)
                break;
            }
            if (a.velocity.x > 0) {
                a.velocity.x = 0
                a.position.x = collisionBlock.position.x - a.size.width - margin + Math.abs(a.hitbox ? a.size.width - (a.hitbox.x + a.hitbox.width) : 0)
                break;
            }
        }
    }
}

function checkVerticalCollisionWithBlocks(a) {
    let x = a.position.x + (a.hitbox ? a.hitbox.x : 0)
    let y = a.position.y + (a.hitbox ? a.hitbox.y : 0)
    for (let i = 0; i < collisionBlocks.length; i++) {
        const collisionBlock = collisionBlocks[i]
        if (
            x <= collisionBlock.position.x + collisionBlock.size.width &&
            x + (a.hitbox ? a.hitbox.width : a.size.width) >= collisionBlock.position.x &&
            y <= collisionBlock.position.y + collisionBlock.size.height &&
            y + (a.hitbox ? a.hitbox.height : a.size.height) >= collisionBlock.position.y
        ) {
            if (a.velocity.y < 0) {
                a.velocity.y = 0
                a.position.y = collisionBlock.position.y + collisionBlock.size.height + margin - (a.hitbox ? a.hitbox.y : 0)

                break;
            }
            if (a.velocity.y > 0) {
                a.velocity.y = 0
                a.position.y = collisionBlock.position.y - a.size.height - margin + Math.abs(a.hitbox ? a.size.height - (a.hitbox.y + a.hitbox.height) : 0)

                break;
            }
        }
    }
}

function checkCollision(a, b) {
    let aX = a.position.x + (a.hitbox?.x ?? 0)
    let aW = (a.hitbox?.width ?? a.size.width)

    let aY = a.position.y + (a.hitbox?.y ?? 0)
    let aH = (a.hitbox?.height ?? a.size.height)


    let bX = b.position.x + (b.hitbox?.x ?? 0)
    let bW = (b.hitbox?.width ?? b.size.width)

    let bY = b.position.y + (b.hitbox?.y ?? 0)
    let bH = (b.hitbox?.height ?? b.size.height)

    if (
        aX <= bX + bW &&
        aX + aW >= bX &&
        aY <= bY + bH &&
        aY + aH >= bY
    ) {
        return true
    }
    return false;
}

function switchAnimPlayer(player) {
    if (player.velocity.y === 0 && player.velocity.x !== 0) {
        if (player.parts.arms === 2 && player.parts.legs == 2) {
            player.switchAnimation("Walk2A2L")
        }
        if (player.parts.arms === 2 && player.parts.legs == 1) {
            player.switchAnimation("Walk2A1L")
        }
        if (player.parts.arms === 2 && player.parts.legs == 0) {
            player.switchAnimation("Walk2A0L")
        }
        if (player.parts.arms === 1 && player.parts.legs == 2) {
            player.switchAnimation("Walk1A2L")
        }
        if (player.parts.arms === 1 && player.parts.legs == 1) {
            player.switchAnimation("Walk1A1L")
        }
        if (player.parts.arms === 1 && player.parts.legs == 0) {
            player.switchAnimation("Walk1A0L")
        }
        if (player.parts.arms === 0 && player.parts.legs == 2) {
            player.switchAnimation("Walk0A2L")
        }
        if (player.parts.arms === 0 && player.parts.legs == 1) {
            player.switchAnimation("Walk0A1L")
        }
        if (player.parts.arms === 0 && player.parts.legs == 0) {
            player.switchAnimation("Walk0A0L")
        }
    }

    if (player.velocity.y !== 0) {
        if (player.parts.arms === 2 && player.parts.legs == 2) {
            player.switchAnimation("Falling2A2L")
        }
        if (player.parts.arms === 2 && player.parts.legs == 1) {
            player.switchAnimation("Falling2A1L")
        }
        if (player.parts.arms === 2 && player.parts.legs == 0) {
            player.switchAnimation("Falling2A0L")
        }
        if (player.parts.arms === 1 && player.parts.legs == 2) {
            player.switchAnimation("Falling1A2L")
        }
        if (player.parts.arms === 1 && player.parts.legs == 1) {
            player.switchAnimation("Falling1A1L")
        }
        if (player.parts.arms === 1 && player.parts.legs == 0) {
            player.switchAnimation("Falling1A0L")
        }
        if (player.parts.arms === 0 && player.parts.legs == 2) {
            player.switchAnimation("Falling0A2L")
        }
        if (player.parts.arms === 0 && player.parts.legs == 1) {
            player.switchAnimation("Falling0A1L")
        }
        if (player.parts.arms === 0 && player.parts.legs == 0) {
            player.switchAnimation("Falling0A0L")
        }
    }
    if (player.velocity.x === 0 && player.velocity.y === 0) {
        if (player.parts.arms === 2 && player.parts.legs == 2) {
            player.switchAnimation("Idle2A2L")
        }
        if (player.parts.arms === 2 && player.parts.legs == 1) {
            player.switchAnimation("Idle2A1L")
        }
        if (player.parts.arms === 2 && player.parts.legs == 0) {
            player.switchAnimation("Idle2A0L")
        }
        if (player.parts.arms === 1 && player.parts.legs == 2) {
            player.switchAnimation("Idle1A2L")
        }
        if (player.parts.arms === 1 && player.parts.legs == 1) {
            player.switchAnimation("Idle1A1L")
        }
        if (player.parts.arms === 1 && player.parts.legs == 0) {
            player.switchAnimation("Idle1A0L")
        }
        if (player.parts.arms === 0 && player.parts.legs == 2) {
            player.switchAnimation("Idle0A2L")
        }
        if (player.parts.arms === 0 && player.parts.legs == 1) {
            player.switchAnimation("Idle0A1L")
        }
        if (player.parts.arms === 0 && player.parts.legs == 0) {
            player.switchAnimation("Idle0A0L")
        }
    }
}

function loop() {

    ctx.clearRect(0, 0, screenWidth, screenHeight)

    drawBackground()
    drawMap()

    for (const id in players) {
        switchAnimPlayer(players[id])
        players[id].drawPlayer(ctx, "red")
    }

    if (client?.live) {
        switchAnimPlayer(client)
        client.drawPlayer(ctx, "green")

        client.handleInput(keys)
        if (mouse.position.x <= client.position.x + client.hitbox.x + client.hitbox.width / 2) {
            client.fliped = true;
        }
        else {
            client.fliped = false;
        }

        client.position.x += client.velocity.x;
        checkHorizontalCollisionWithBlocks(client)
        client.velocity.y += gravity.y
        client.position.y += client.velocity.y
        checkVerticalCollisionWithBlocks(client)

        if (client.position.x !== 0 || client.position.y !== 0) {
            socket.emit("updateClient", client)
        }

    }

    for (let i = 0; i < projectiles.length; i++) {
        drawProjectile(projectiles[i])
    }

    parts.forEach((p, i) => {
        if (!particles[i]) {
            let size = p.part === "arm" ? { width: 4 * 3, height: 6 * 3 } : p.part === "leg" ? { width: 4 * 3, height: 5 * 3 } : p.part === "dead" ? { width: 3 * 3, height: 4 * 3 } : { width: 3 * 3, height: 4 * 3 }
            particles[i] = {}
            particles[i].primary = part
            particles[i].secondary = blood
            particles[i].primary.position = {
                x: p.player.position.x + p.player.hitbox.x + p.player.hitbox.width / 2,
                y: p.player.position.y + 3 * 3
            }
            particles[i].primary.size = size
            if (p.part === "dead") {
                particles[i].secondary.size = { width: 8, height: 8 }
                particles[i].primary.angle = 0
                particles[i].primary.opening_angle = 360
                particles[i].primary.speed = 3
                particles[i].secondary.position = {
                    x: p.player.position.x + p.player.hitbox.x + p.player.hitbox.width / 2,
                    y: p.player.position.y + p.player.hitbox.y + p.player.hitbox.height / 2
                }
                particles[i].secondary.angle = 0
                particles[i].secondary.opening_angle = 360
                particles[i].secondary.speed = 3
                particles[i].secondary.fb = (e) => {
                    e.size.width /= e.size.width > 1.5 ? 1.02 : 1
                    e.size.height /= e.size.width > 1.5 ? 1.02 : 1
                    e.velocity.x /= 1.08
                    e.velocity.y += 0.1
                    return e
                }
                particles[i].secondary.emit(80)
            }
            particles[i].primary.emit(p.part === "dead" ? 30 : 1)
        }
        else {
            if (particles[i].primary.entities[0] && p.part !== "dead") {
                let img = p.part === "arm" ? arm : p.part === "leg" ? leg : p.part === "dead" ? body : body
                particles[i].secondary.position = {
                    x: particles[i].primary.entities[0].position.x + particles[i].primary.entities[0].size.width / 6,
                    y: particles[i].primary.entities[0].position.y + particles[i].primary.entities[0].size.height / 6
                }
                particles[i].secondary.emit(p.part !== "dead" ? 1 : 2)
                particles[i].secondary.draw(ctx, { color: "rgba(148,20,20, 0.65)" })
                particles[i].secondary.update(false)
                particles[i].primary.draw(ctx, { image: img })
                particles[i].primary.update(false)
            }
            else if (particles[i].primary.entities[0] && p.part === "dead") {
                let img = p.part === "arm" ? arm : p.part === "leg" ? leg : p.part === "dead" ? body : body
                particles[i].secondary.draw(ctx, { color: "rgba(148,20,20, 0.65)" })
                particles[i].secondary.update(false)
                particles[i].primary.draw(ctx, { image: img })
                particles[i].primary.update(false)
            }
            else {
                particles.splice(i, 1)
                parts.splice(i, 1)
            }
        }
    })

    requestAnimationFrame(loop)
}

socket.on("updatePlayers", (_players) => {
    for (const id in _players) {
        if (id == socket.id) {
            if (typeof client !== "object") {
                client = new Player(playerOrigin)
                client.update(_players[id])
            }
            client.update(_players[id])
        }
        else {
            if (typeof players[id] !== "object") {
                players[id] = new Player(playerOrigin)
                players[id].update(_players[id])
            }
            players[id].update(_players[id])
        }
    }
})

socket.on("playerLeave", id => {
    delete players[id]
})

socket.on("updateMap", (m) => {
    tileW = 32
    tileH = 32

    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[0].length; x++) {
            if (m[y][x] == '#') {
                collisionBlocks.push(
                    new Block({ x: x * tileW, y: y * tileH }, { width: tileW, height: tileH })
                )
            }
        }
    }
    background = new Sprite({
        position: {
            x: 0,
            y: 0
        },
        imageSrc: "/background2.png",
        scale: 3
    })
    drawMap(true);
})

socket.on("updateProjectiles", (_projectiles) => {
    projectiles = _projectiles
})

socket.on("hitPlayer", (player, part) => {
    players[player.name].update(player)
    parts.push({
        player: player,
        part: part
    })
})