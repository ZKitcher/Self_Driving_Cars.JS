class Car extends NEATAgent {
    constructor(brain, x = 150, y = 200) {
        super(brain);
        // this.position = createVector(startingPos.x, startingPos.y);
        // this.acceleration = createVector(0, 0);
        // this.velocity = createVector(0, 0);

        this.maxspeed = 10;
        this.turningRadius = 0.04

        this.startingPos = createVector(startingPos.x, startingPos.y)

        this.currentAccel = 0;
        this.carSteering = 0;

        this.siteLines = []
        this.timeAlive = 0;

        this.laps = 0;
        this.lapTime = 0;
        this.bestLap = Infinity;
        this.leftStart = false;

        this.avgSpeed = []

        this.checkpointTimer = 180;

        this.config = {
            showSightLines: false
        }



        // CAR MOTION
        this.turnRateStatic = 0.08;
        this.turnRateDynamic = 0.03;
        this.turnRate = this.turnRateStatic;
        this.gripStatic = 1.5;
        this.gripDynamic = 0.5;
        this.DRIFT_CONSTANT = 3;

        this.position = createVector(startingPos.x, startingPos.y);
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(0, 0);
        this.angle = -1.56;
        this.mass = 10;
        this.currentAcceleration = 0.15;
        this.isDrifting = false;

        this.trail = [];

        this.speed = 0;
    }

    run() {
        this.update();
        this.render();
    }

    update() {
        if (this.done) return;
        // this.lapCheck();
        this.timeAlive++;
        this.checkpointTimer--;
        this.getSiteLines()

        if (this.siteLines.filter(e => e < 10).length) {
            this.failed = true;
            this.done = true;
            this.score *= 0.75;
            return;
        }

        if (this.speed < 2 && this.timeAlive > 100) {
            this.failed = true;
            this.done = true;
            this.score *= 0.5;
            return;
        }

        if (this.speed > 2) this.score++;
        this.lapTime++;

        this.avgSpeed.push(this.speed)

        this.networkPrediction()
        this.updateMotion()
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    getPos() {
        return this.position.copy();
    }
    isDrift() {
        return this.isDrifting;
    }

    updateMotion() {
        // if (keyIsPressed) {
        //     if (keyIsDown(UP_ARROW)) {
        //         this.adjustVelocity(this.currentAcceleration)
        //     }
        //     if (keyIsDown(DOWN_ARROW)) {
        //         this.adjustVelocity(-this.currentAcceleration)
        //     }
        //     if (keyIsDown(LEFT_ARROW)) {
        //         this.angle -= this.turnRate;
        //     }
        //     if (keyIsDown(RIGHT_ARROW)) {
        //         this.angle += this.turnRate;
        //     }
        // }

        this.trail.push({
            position: this.getPos(),
            drifting: this.isDrift(),
        });


        let vB = this.vectWorldToBody(this.velocity, this.angle);

        let bodyFixedDrag;
        let grip;
        if (abs(vB.x) < this.DRIFT_CONSTANT) {
            grip = this.gripStatic
            this.turnRate = this.turnRateStatic;
            this.isDrifting = false;
        } else {
            grip = this.gripDynamic;
            this.turnRate = this.turnRateDynamic;
            this.isDrifting = true;
        }
        bodyFixedDrag = createVector(vB.x * -grip, vB.y * 0.05);

        let worldFixedDrag = this.vectBodyToWorld(bodyFixedDrag, this.angle)
        this.acceleration.add(
            worldFixedDrag.div(this.mass)
        );

        this.angle = this.angle % TWO_PI;
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.speed = p5.Vector.dist(this.acceleration, this.velocity);
        this.acceleration = createVector(0, 0);

    }


    adjustVelocity(accel = this.currentAcceleration) {
        this.acceleration
            .add(
                this.vectBodyToWorld(
                    createVector(0, accel),
                    this.angle
                )
            );
    }

    vectBodyToWorld(vect, ang) {
        let v = vect.copy();
        let vn = createVector(
            v.x * cos(ang) - v.y * sin(ang),
            v.x * sin(ang) + v.y * cos(ang)
        );
        return vn;
    }

    vectWorldToBody(vect, ang) {
        let v = vect.copy();
        let vn = createVector(
            v.x * cos(ang) + v.y * sin(ang),
            v.x * sin(ang) - v.y * cos(ang)
        );
        return vn;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////



    calculateFitness() {
        this.fitness = this.score;

        // this.fitness += this.fitness * (avg(this.avgSpeed) / this.maxspeed);
        this.fitness += this.fitness * (this.trail.filter(e => e.drifting).length / this.trail.length);

        // let min = Infinity;
        // cars.agents.forEach(e => {
        //     if (e.laps > 0) {
        //         if (e.bestLap < min) min = e.bestLap;
        //     }
        // });

        // if (min !== Infinity && min === this.bestLap) {
        //     this.fitness += this.fitness * 0.2
        // }
    }

    getSiteLines() {
        const points = walls.query(new BoundingBox(this.position.x, this.position.y, 201, 201));
        const dir = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5, PI];

        this.siteLines = dir.map(e => {
            let record = Infinity;
            let closest = null;
            for (let wall of points) {
                const dir = this.velocity.heading() + e
                const pt = intersection(this.position, wall, p5.Vector.fromAngle(dir === 0 ? 0.00000000001 : dir));

                if (pt) {
                    const d = p5.Vector.dist(this.position, pt);
                    if (d < record) {
                        record = d;
                        closest = pt;
                    }
                }
            }

            if (this.config.showSightLines && closest) line(this.position.x, this.position.y, closest.x, closest.y)
            return record;
        })
    }

    lapCheck() {
        let distanceFromStart = dist(this.startingPos.x, this.startingPos.y, this.position.x, this.position.y);

        if (distanceFromStart > 500) {
            this.leftStart = true;
        }

        if (this.leftStart && distanceFromStart < 50) {
            this.leftStart = false;
            if (this.lapTime < this.bestLap) {
                this.bestLap = this.lapTime
            };
            this.lapTime = 0;
            this.laps++;
        }
    }

    networkPrediction() {
        let inputs = this.siteLines.map(e => e > 200 ? 1 : (e / 200))
        inputs.pop()
        inputs.push(this.currentAccel / this.maxspeed)
        inputs.push(this.carSteering / 0.4)

        this.prediction = this.brain.predict(inputs).map(e => e > 1 ? 1 : e < -1 ? -1 : e);

        // this.currentAccel += this.prediction[0] > 0 ? this.prediction[0] * 0.1 : this.prediction[0] * 0.3;
        // this.carSteering += this.prediction[1] * 0.04;

        if (this.prediction[0] < 0 && this.speed === 0) {
            this.failed = true;
            this.done = true;
            this.score *= 0.5;
            return;
        }

        this.adjustVelocity(this.prediction[0] * this.currentAcceleration);

        this.angle += (this.prediction[1] * this.turnRate) * (this.prediction[0] < 0 ? 0.3 : 1);
    }

    // applyForce(force) {
    //     this.acceleration.add(force);
    // }

    // gas(heading) {
    //     let sum = createVector(0, 0);
    //     let newDir = p5.Vector.fromAngle(heading);

    //     if (this.currentAccel === 0) {
    //         return;
    //     }

    //     sum
    //         .add(newDir)
    //         .div(1)
    //         .normalize()
    //         .mult(this.currentAccel)

    //     let steer = p5.Vector.sub(sum, this.velocity);
    //     steer.limit(this.maxforce);
    //     this.applyForce(steer);
    // }

    render() {

        if (this.topAgent && this.prediction) {
            push()

            fill(255);
            text('Speed', 10, 30)
            text(this.speed.toFixed(2), 10, 40)
            rect(10, 43, 50, 10)

            text('Turning', 10, 70)
            rect(10, 83, 50, 10)

            fill(this.prediction[0] > 0 ? 'rgb(0,255,0)' : 'rgb(255,0,0)')
            rect(10, 43, abs(this.prediction[0]) * 50, 10)

            fill(0, 0, 0)
            rect(35, 83, this.prediction[1] * 25, 10)

            pop()
        }

        push();
        fill(100, 100, 100, 127);
        rectMode(CENTER);

        if (this.topAgent) {
            fill(100, 0, 0, 127);
            push();
            for (let p of this.trail) {
                if (p.drifting) {
                    stroke(255, 100, 100);
                } else {
                    stroke(255);
                }
                point(p.position.x, p.position.y);
            }
            pop()

        } else if (this.eliteAgent) {
            fill(0, 0, 100, 127);
        }

        stroke(200);
        translate(this.position.x, this.position.y);
        rotate(this.angle);
        rect(0, 0, 10, 20, 3)
        strokeWeight(3)
        point(4, 10)
        point(-4, 10)
        pop()
    }
}

const intersection = (position, line2, dir) => {
    const x1 = line2.a.x;
    const y1 = line2.a.y;
    const x2 = line2.b.x;
    const y2 = line2.b.y;

    const x3 = position.x;
    const y3 = position.y;
    const x4 = position.x + dir.x;
    const y4 = position.y + dir.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

    if (den === 0) return;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;


    if (t > 0 && t < 1 && u > 0) {
        let pt = createVector();
        pt.x = x1 + t * (x2 - x1);
        pt.y = y1 + t * (y2 - y1);
        return pt;
    } else {
        return;
    }
}