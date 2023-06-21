class Sprite {
    constructor({
        position,
        imageSrc,
        frameRate = 1,
        animations,
        frameBuffer = 2,
        loop = true,
        autoplay = true,
        scale = 1
    }) {
        this.position = position
        this.scale = scale
        this.size = {}
        this.image = new Image()
        this.image.onload = () => {
            this.loaded = true
            this.size.width = (this.image.width * scale) / this.frameRate
            this.size.height = this.image.height * scale
        }
        this.image.src = imageSrc
        this.loaded = false
        this.frameRate = frameRate
        this.currentFrame = 0
        this.elapsedFrames = 0
        this.frameBuffer = frameBuffer
        this.animations = animations
        this.loop = loop
        this.autoplay = autoplay
        this.currentAnimation

        if (this.animations) {
            for (let key in this.animations) {
                let image = new Image()
                image.src = this.animations[key].imageSrc
                this.animations[key].image = image
            }
        }
    }

    draw(fliped = false) {

        const cropbox = {
            position: {
                x: this.size.width / (this.scale) * this.currentFrame,
                y: 0,
            },
            width: this.size.width / this.scale,
            height: this.size.height / this.scale,
        }

        if (fliped) { ctx.scale(-1, 1); }
        ctx.drawImage(
            this.image,
            cropbox.position.x,
            cropbox.position.y,
            cropbox.width,
            cropbox.height,
            this.position.x * (fliped ? -1 : 1) - (fliped ? this.size.width : 0),
            this.position.y,
            this.size.width,
            this.size.height
        )

        if (fliped) { ctx.scale(-1, 1); }

        this.updateFrames()
    }

    updateFrames() {
        if (!this.autoplay) return

        this.elapsedFrames++

        if (this.elapsedFrames % this.frameBuffer === 0) {
            if (this.currentFrame < this.frameRate - 1) this.currentFrame++
            else if (this.loop) { this.currentFrame = 0 }
        }
    }

    switchAnimation(name) {
        if (this.image === this.animations[name].image) return
        console.log("A")
        this.currentFrame = 0
        this.elapsedFrames = 0
        this.image = this.animations[name].image
        this.frameRate = this.animations[name].frameRate
        this.frameBuffer = this.animations[name].frameBuffer
        this.loop = this.animations[name].loop
        this.currentAnimation = this.animations[name]
    }
}

class Player extends Sprite {
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
        loop,
        scale
    }) {
        super({ imageSrc, frameRate, animations, loop, scale })
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

    drawPlayer(ctx, color, debug = false) {
        if (ctx && this.loaded && this.live) {
            this.draw(this.fliped)
            if (debug) {
                ctx.fillStyle = "rgba(0, 255, 0, 0.5)"
                ctx.fillRect(this.position.x + this.hitbox.x, this.position.y + this.hitbox.y, this.hitbox.width, this.hitbox.height)
                ctx.fillStyle = "rgba(255, 0, 0, 0.5)"
                ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height)
            }
            ctx.font = "15px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = color
            ctx.fillText(this.name, this.position.x + this.size.width / 2, this.position.y - 10);

            if (this.parts.arms < 2) {
                if (!this.particles.armright) {
                    this.particles.armright = new Particle(
                        {
                            x: this.position.x + this.hitbox.x + (this.fliped ? 6 : 0) * 3,
                            y: this.position.y + this.hitbox.y + 6 * 3
                        },
                        { width: 5, height: 5 },
                        30,
                        2,
                        0,
                        360,
                        80,
                        (e) => {
                            e.size.width /= e.size.width > 1.5 ? 1.2 : 1
                            e.size.height /= e.size.width > 1.5 ? 1.1 : 1
                            e.velocity.x /= ((Math.random() + 0.8) * 1.5)
                            e.velocity.y += 0.1
                            return e
                        }
                    )
                }
                else {
                    this.particles.armright.draw(ctx, { color: "rgba(148,20,20, 0.65)" })
                    this.particles.armright.update()
                    this.particles.armright.angle = 0
                    this.particles.armright.opening_angle = 180
                    this.particles.armright.speed = 0.5
                    this.particles.armright.position = {
                        x: this.position.x + this.hitbox.x + (this.fliped ? 6 : 0) * 3,
                        y: this.position.y + this.hitbox.y + 6 * 3
                    }
                    this.particles.armright.emit(Math.floor(Math.random() * 2) + 1)
                }
            }

            if (this.parts.arms < 1) {
                if (!this.particles.armleft) {
                    this.particles.armleft = new Particle(
                        {
                            x: this.position.x + this.hitbox.x + (this.fliped ? -1 : 6) * 3,
                            y: this.position.y + this.hitbox.y + 6 * 3
                        },
                        { width: 5, height: 5 },
                        30,
                        2,
                        0,
                        360,
                        80,
                        (e) => {
                            e.size.width /= e.size.width > 1.5 ? 1.2 : 1
                            e.size.height /= e.size.width > 1.5 ? 1.1 : 1
                            e.velocity.x /= ((Math.random() + 0.8) * 1.5)
                            e.velocity.y += 0.1
                            return e
                        }
                    )
                }
                else {
                    this.particles.armleft.draw(ctx, { color: "rgba(148,20,20, 0.65)" })
                    this.particles.armleft.update()
                    this.particles.armleft.angle = 0
                    this.particles.armleft.opening_angle = 180
                    this.particles.armleft.speed = 0.5
                    this.particles.armleft.position = {
                        x: this.position.x + this.hitbox.x + (this.fliped ? -1 : 6) * 3,
                        y: this.position.y + this.hitbox.y + 6 * 3
                    }
                    this.particles.armleft.emit(Math.floor(Math.random() * 2) + 1)
                }
            }

            if (this.parts.legs < 2) {
                if (!this.particles.legright) {
                    this.particles.legright = new Particle(
                        {
                            x: this.position.x + this.hitbox.x + (this.fliped ? 4 : 1) * 3,
                            y: this.position.y + this.hitbox.y + 13 * 3
                        },
                        { width: 5, height: 5 },
                        30,
                        2,
                        0,
                        360,
                        80,
                        (e) => {
                            e.size.width /= e.size.width > 1.5 ? 1.2 : 1
                            e.size.height /= e.size.width > 1.5 ? 1.1 : 1
                            e.velocity.x /= ((Math.random() + 0.8) * 1.5) * (this.fliped ? -1 : 1)
                            e.velocity.y += 0.1
                            return e
                        }
                    )
                }
                else {
                    this.particles.legright.draw(ctx, { color: "rgba(148,20,20, 0.65)" })
                    this.particles.legright.update()
                    this.particles.legright.angle = 0
                    this.particles.legright.opening_angle = 180
                    this.particles.legright.speed = 0.5
                    this.particles.legright.position = {
                        x: this.position.x + this.hitbox.x + (this.fliped ? 4 : 1) * 3,
                        y: this.position.y + this.hitbox.y + 13 * 3
                    }
                    this.particles.legright.emit(Math.floor(Math.random() * 2) + 1)
                }
            }

            if (this.parts.legs < 1) {
                if (!this.particles.legleft) {
                    this.particles.legleft = new Particle(
                        {
                            x: this.position.x + this.hitbox.x + (this.fliped ? 1 : 4) * 3,
                            y: this.position.y + this.hitbox.y + 13 * 3
                        },
                        { width: 5, height: 5 },
                        30,
                        2,
                        0,
                        360,
                        80,
                        (e) => {
                            e.size.width /= e.size.width > 1.5 ? 1.2 : 1
                            e.size.height /= e.size.width > 1.5 ? 1.1 : 1
                            e.velocity.x /= ((Math.random() + 0.8) * 1.5) * (this.fliped ? -1 : 1)
                            e.velocity.y += 0.1
                            return e
                        }
                    )
                }
                else {
                    this.particles.legleft.draw(ctx, { color: "rgba(148,20,20, 0.65)" })
                    this.particles.legleft.update()
                    this.particles.legleft.angle = 0
                    this.particles.legleft.opening_angle = 180
                    this.particles.legleft.speed = 0.5
                    this.particles.legleft.position = {
                        x: this.position.x + this.hitbox.x + (this.fliped ? 1 : 4) * 3,
                        y: this.position.y + this.hitbox.y + 13 * 3
                    }
                    this.particles.legleft.emit(Math.floor(Math.random() * 2) + 1)
                }
            }
        }
    }

    handleInput(keys) {
        let speed = 3.6;
        if (this.parts.legs === 1) { speed = 2 }
        if (this.parts.legs === 0) { speed = 0.3 }
        if (keys.KeyA) {
            if (this.parts.legs === 2) {
                this.velocity.x = Math.max(this.velocity.x - (speed * 0.05), -speed)
            }
            if (this.parts.legs === 1 && client.velocity.x === 0) {
                this.velocity.x = -speed
                this.velocity.y += this.velocity.y !== 0 ? 0 : -5
            }
            if (this.parts.legs === 0 && client.velocity.x === 0) {
                this.velocity.x = -speed
                this.velocity.y += this.velocity.y !== 0 ? 0 : -3
            }

        }
        if ((!keys.KeyA && client.velocity.x < 0) || (this.parts.legs !== 2)) {
            this.velocity.x *= Math.abs(this.velocity.x) < 0.01 ? 0 : Math.abs(this.velocity.y) > 0.1 ? 0.98 : 0.5
        }

        if (keys.KeyD) {
            if (this.parts.legs === 2) {
                this.velocity.x = Math.min(this.velocity.x + (speed * 0.05), speed)
            }
            if (this.parts.legs === 1 && client.velocity.x === 0) {
                this.velocity.x = speed
                this.velocity.y += this.velocity.y !== 0 ? 0 : -5
            }
            if (this.parts.legs === 0 && client.velocity.x === 0) {
                this.velocity.x = speed
                this.velocity.y += this.velocity.y !== 0 ? 0 : -3
            }
        }
        if ((!keys.KeyD && client.velocity.x > 0) || (this.parts.legs !== 2)) {
            this.velocity.x *= Math.abs(this.velocity.x) < 0.01 ? 0 : Math.abs(this.velocity.y) > 0.1 ? 0.98 : 0.5
        }

        if (keys.KeyA && keys.KeyD) {
            this.velocity.x *= Math.abs(this.velocity.x) < 0.01 ? 0 : Math.abs(this.velocity.y) > 0.1 ? 0.89 : 0.46
        }
        if (keys.Space && this.velocity.y == 0) {
            let power = -8
            if (this.parts.legs == 1) { power = -6 }
            if (this.parts.legs == 0) { power = -4 }
            this.velocity.y = power
        }
    }

    update(data) {
        this.position = { x: data.position.x, y: data.position.y };
        this.velocity = { x: data.velocity.x, y: data.velocity.y }
        this.parts = data.parts
        this.fliped = data.fliped
        this.name = data.name
        this.live = data.live
        this.hitbox = data.hitbox
        this.gun = data.gun
    }
}

class Block {
    constructor(position = { x: 0, y: 0 }, size = { width: 32, height: 32 }) {
        this.position = { x: position.x, y: position.y }
        this.size = { width: size.width, height: size.height }
    }

    draw(ctx, color) {
        if (ctx) {
            ctx.fillStyle = color ?? "black"
            ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
        }
    }
}

class Particle {
    constructor(position = { x: 0, y: 0 }, size = { width: 32, height: 32 }, life_time = 1, speed = 1, angle = 0, opening_angle = 360, counts = 1, fb = (e, p) => { return e }) {
        this.position = { x: position.x, y: position.y }
        this.size = { width: size.width, height: size.height }
        this.life_time = life_time
        this.speed = speed
        this.angle = angle
        this.opening_angle = opening_angle
        this.counts = counts
        this.fb = fb
        this.entities = []

        for (let i = 0; i < counts; i++) {
            let a = angle + Math.floor(Math.random() * (opening_angle));
            let velX = speed * Math.cos(a * (Math.PI / 180))
            let velY = speed * Math.sin(a * (Math.PI / 180))

            this.entities.push({ position: { x: position.x, y: position.y }, velocity: { x: velX, y: velY }, size: { width: size.width, height: size.height }, tick: 0, angle: 0 })
        }
    }

    update(collision = true) {
        this.entities.forEach((entity, i) => {
            entity.position.x += entity.velocity.x
            if (collision) { checkHorizontalCollisionWithBlocks(entity) }
            entity.position.y += entity.velocity.y
            if (collision) { checkVerticalCollisionWithBlocks(entity) }

            entity = this.fb(entity, this)
            if (entity.position.x < 0 || entity.position.x > screenWidth ||
                entity.position.y < 0 || entity.position.y > screenHeight ||
                entity.tick >= this.life_time ||
                entity.size.width <= 0 || entity.size.height <= 0
            ) {
                this.entities.splice(i, 1)
            }
            entity.tick++;
        })
    }

    draw(ctx, source = { color: "black", image: null }) {
        if (ctx) {
            if (!source.image) {
                this.entities.forEach(entity => {
                    ctx.fillStyle = source.color;
                    let a = entity.angle * (Math.PI / 180)
                    ctx.translate(entity.position.x + entity.size.width / 2, entity.position.y + entity.size.height / 2);
                    ctx.rotate(a)
                    ctx.translate(-entity.position.x - entity.size.width / 2, -entity.position.y - entity.size.height / 2);
                    ctx.fillRect(entity.position.x, entity.position.y, entity.size.width, entity.size.height);
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                })
            }
            else {
                this.entities.forEach(entity => {
                    let a = entity.angle * (Math.PI / 180)
                    ctx.translate(entity.position.x + entity.size.width / 2, entity.position.y + entity.size.height / 2);
                    ctx.rotate(a)
                    ctx.translate(-entity.position.x - entity.size.width / 2, -entity.position.y - entity.size.height / 2);
                    ctx.drawImage(
                        source.image,
                        entity.position.x,
                        entity.position.y,
                        entity.size.width, entity.size.height
                    );
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                })
            }
        }
    }

    reset() {
        this.entities = []
        for (let i = 0; i < this.counts; i++) {
            let a = this.angle + Math.floor(Math.random() * (this.opening_angle));
            let velX = this.speed * Math.cos(a * (Math.PI / 180))
            let velY = this.speed * Math.sin(a * (Math.PI / 180))

            this.entities.push({ position: { x: this.position.x, y: this.position.y }, velocity: { x: velX, y: velY }, size: { width: this.size.width, height: this.size.height }, tick: 0, angle: 0 })
        }
    }

    emit(c) {
        if (!c) {
            c = this.counts
        }
        for (let i = 0; i < c; i++) {
            let a = this.angle + Math.floor(Math.random() * (this.opening_angle));
            let velX = (this.speed + Math.random()) * Math.cos(a * (Math.PI / 180))
            let velY = (this.speed + Math.random()) * Math.sin(a * (Math.PI / 180))

            this.entities.push({ position: { x: this.position.x, y: this.position.y }, velocity: { x: velX, y: velY }, size: { width: this.size.width, height: this.size.height }, tick: 0, angle: 0 })
        }
    }
}