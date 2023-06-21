const path = require('path')
const express = require('express')
const app = express()

let ticksServer = process.env.PORT || 60

app.set('port', process.env.PORT || 3000)

app.use(express.static(path.join(__dirname, 'public')))

const server = app.listen(app.get('port'), () => {
    console.log('Port: ', app.get('port'))
})

const SocketIO = require('socket.io')
const io = SocketIO(server)

let map = [
    "########################################",
    "#                                      #",
    "#                                      #",
    "#                                      #",
    "#                                      #",
    "#                                      #",
    "#                                      #",
    "#                                      #",
    "#                                      #",
    "#        ######################        #",
    "#                                      #",
    "#    ###                        ###    #",
    "#                                      #",
    "#  #                                #  #",
    "#  ###          ########          ###  #",
    "#  ###    ###              ###    ###  #",
    "#  #####      #          #      #####  #",
    "#  #####                        #####  #",
    "#  #######      ########      #######  #",
    "#            #            #            #",
    "#           ##            ##           #",
    "########################################",
    "########################################"
]

let guns = [
    {
        fireRate: 1,
        power: 18,
        bullet: {
            width: 5,
            height: 3
        },
        recoil: 1.4,
        spawn: {
            x: {
                origin: 4 * 3,
                fliped: -2 * 3
            },
            y: {
                origin: 8 * 3,
                fliped: 8 * 3
            }
        }
    },
    {
        fireRate: 2.5,
        power: 26,
        bullet: {
            width: 10,
            height: 4
        },
        recoil: 0.5,
        spawn: {
            x: {
                origin: 16 * 3,
                fliped: -10 * 3
            },
            y: {
                origin: 4 * 3,
                fliped: 4 * 3
            }
        }
    }
]

class Player {
    constructor({
        name = "unknown",
        live = true,
        position = { x: 0, y: 0 },
        hitbox = { x: 0, y: 0, width: 10, height: 17 },
        velocity = { x: 0, y: 0 },
        size = { width: 10, height: 17 },
        parts = { arms: 2, legs: 2 },
        gun = 0,
        fliped = false,
        imageSrc,
        frameRate,
        animations,
        loop
    }) {
        this.position = { x: position.x, y: position.y };
        this.hitbox = { x: hitbox.x, y: hitbox.y, width: hitbox.width, height: hitbox.height }
        this.velocity = { x: velocity.x, y: velocity.y }
        this.size = { width: size.width, height: size.height }
        this.parts = parts
        this.fliped = fliped
        this.name = name
        this.gun = gun
        this.live = live
        this.particles = {}
    }
}

class Projectile {
    constructor(owner, position = { x: 0, y: 0 }, velocity = { x: 0, y: 0 }, size = { width: 10, height: 10 }) {
        this.owner = owner
        this.position = { x: position.x, y: position.y };
        this.velocity = { x: velocity.x, y: velocity.y }
        this.size = { width: size.width, height: size.height }
        this.reusable = false;
    }

    del() {
        this.reusable = true;
        this.position = { x: -this.size.width, y: -this.size.height }
        this.velocity = { x: 0, y: 0 }
        this.owner = "null"
        io.sockets.emit("updateProjectiles", projectiles)
    }
}

let players = {}
let projectiles = []

io.on('connection', (socket) => {
    players[socket.id] = new Player({
        name: socket.id,
        live: true,
        position: {
            x: 200 + Math.random() * 100,
            y: 200 + Math.random() * 100
        },
        hitbox: {
            x: 14 * 3,
            y: 5 * 3,
            width: 6 * 3,
            height: 16 * 3
        },
        velocity: {
            x: 0,
            y: 0
        },
        parts: {
            arms: 2,
            legs: 2
        },
        gun: 0,
        fliped: false,
    })
    console.log("Connect player > ", socket.id)

    io.sockets.emit('updatePlayers', players)
    io.sockets.emit('playerEnter', socket.id)

    socket.emit("updateMap", map)

    socket.on("disconnect", () => {
        delete players[socket.id]
        console.log("Disconnect player > ", socket.id)

        io.sockets.emit('updatePlayers', players)
        io.sockets.emit('playerLeave', socket.id)
    })

    socket.on("updateClient", (client) => {
        players[socket.id] = client
        io.sockets.emit('updatePlayers', players)
    })

    socket.on("fireClient", (gun, fliped) => {
        let p = projectiles.findIndex(p => p.reusable);
        if (p == -1) {
            projectiles.push(new Projectile(
                socket.id,
                { x: players[socket.id].position.x + players[socket.id].hitbox.x + (fliped ? guns[gun].spawn.x.fliped : guns[gun].spawn.x.origin), y: players[socket.id].position.y + players[socket.id].hitbox.y + (fliped ? guns[gun].spawn.y.fliped : guns[gun].spawn.y.origin) },
                { x: guns[gun].power * (fliped ? -1 : 1), y: Math.random() * guns[gun].recoil },
                { width: guns[gun].bullet.width, height: guns[gun].bullet.height }
            ))
        }
        else {
            projectiles[p].owner = socket.id
            projectiles[p].reusable = false;
            projectiles[p].position = { x: players[socket.id].position.x + players[socket.id].hitbox.x + (fliped ? guns[gun].spawn.x.fliped : guns[gun].spawn.x.origin), y: players[socket.id].position.y + players[socket.id].hitbox.y + (fliped ? guns[gun].spawn.y.fliped : guns[gun].spawn.y.origin) }
            projectiles[p].velocity = { x: guns[gun].power * (fliped ? -1 : 1), y: Math.random() * guns[gun].recoil }
            projectiles[p].size = { width: guns[gun].bullet.width, height: guns[gun].bullet.height }
        }
    })
})

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

setInterval(loop, 1000 / ticksServer)

function loop() {
    for (let i = 0; i < projectiles.length; i++) {
        if (!projectiles[i].reusable) {
            projectiles[i].velocity.x /= 1.008
            projectiles[i].position.x += projectiles[i].velocity.x
            projectiles[i].velocity.y += 0.04
            projectiles[i].position.y += projectiles[i].velocity.y

            for (const client in players) {
                if (projectiles[i].owner !== client && players[client].live) {
                    if (checkCollision(players[client], projectiles[i])) {
                        if (projectiles[i].position.y >= players[client].position.y + 9 * 3 && projectiles[i].position.y <= players[client].position.y + 16 * 3) {
                            players[client].parts.arms--;
                            if (players[client].parts.arms === 1) {
                                players[client].gun = 1
                            }
                            if (players[client].parts.arms < 0) {
                                players[client].live = false;
                                players[client].parts.arms = 0;
                                io.sockets.emit("hitPlayer", players[client], "dead")
                            }
                            else { io.sockets.emit("hitPlayer", players[client], "arm") }
                            console.log(players[client].parts, "ARM")
                        }
                        if (projectiles[i].position.y < players[client].position.y + 9 * 3) {
                            players[client].live = false;
                            io.sockets.emit("hitPlayer", players[client], "dead")
                            console.log(players[client].parts, "HEAD")
                        }
                        if (projectiles[i].position.y > players[client].position.y + 16 * 3) {
                            players[client].parts.legs--;
                            if (players[client].parts.legs <= 0) {
                                players[client].parts.legs = 0;
                                players[client].hitbox.height = 14 * 3
                            }
                            else { io.sockets.emit("hitPlayer", players[client], "leg") }
                            console.log(players[client].parts, "LEG")
                        }

                        io.sockets.emit('updatePlayers', players)
                        projectiles[i].del()
                    }
                }
            }
            for (let y = 0; y < map.length; y++) {
                for (let x = 0; x < map[0].length; x++) {
                    if (map[y][x] == '#') {
                        let block = {
                            position: {
                                x: x * 32,
                                y: y * 32
                            },
                            size: {
                                width: 32,
                                height: 32
                            }
                        }
                        if (checkCollision(block, projectiles[i])) {
                            projectiles[i].del()
                        }
                    }
                }
            }

            if (projectiles[i].position.x < 0 || projectiles[i].position.x > map[0].length * 32 || projectiles[i].position.y < 0 || projectiles[i].position.y > map.length * 32) {
                projectiles[i].del()
            }
        }
    }
    let p = projectiles.filter((p) => !p.reusable)
    if (p.length > 0) {
        io.sockets.emit("updateProjectiles", p)
    }


}