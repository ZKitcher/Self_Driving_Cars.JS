class Car extends NEATMLObject {
    constructor(id) {
        super(id);
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(0, 0);
        this.position = createVector(150, 200);
        this.maxspeed = 10;

        this.currentAccel = 0;
        this.carSteering = 0;

        this.sightLines = []

        for (let i = 0; i < 8; i++) {
            this.sightLines.push(new Ray(this.position.x, this.position.y))
        }

        this.siteDistances = []
        this.timeAlive = 0;

        this.laps = 0;
        this.checkpoint = []
        this.avgSpeed = []

        this.checkpointTimer = 180;

    }

    run() {
        this.checkPointCheck();
        this.update();
        this.render();
    }

    update() {
        if (this.done) return;
        this.timeAlive++;
        this.checkpointTimer--;

        this.sightLines[0].run(this.position, this.velocity.heading() - 1.5);
        this.sightLines[1].run(this.position, this.velocity.heading() - 1);
        this.sightLines[2].run(this.position, this.velocity.heading() - 0.5);
        this.sightLines[3].run(this.position, this.velocity.heading());
        this.sightLines[4].run(this.position, this.velocity.heading() + 0.5);
        this.sightLines[5].run(this.position, this.velocity.heading() + 1);
        this.sightLines[6].run(this.position, this.velocity.heading() + 1.5);
        this.sightLines[7].run(this.position, this.velocity.heading() + PI);

        this.siteDistances = this.sightLines.map(e => e.getDistance())

        if (this.siteDistances.filter(e => e < 10).length) {
            this.failed = true;
            this.done = true;
            this.score *= 0.75
            return;
        }
        // if (this.checkpointTimer === 0) {
        //     this.failed = true;
        //     this.done = true;
        //     this.fitness /= 1.5
        //     return;
        // }

        if (this.score < 0 || this.currentAccel < 0.5 && this.timeAlive > 10) {
            this.failed = true;
            this.done = true;
            return;
        }


        // this.score += this.checkpointTimer > 0 ? 1 : -1;
        this.score++;

        // this.fitness += ((this.checkpoint.length + 1) + (this.laps * racetrack.checkPoints.length)) * ((1800 - this.timeAlive) / 5);
        // this.fitness += this.timeAlive * ((this.checkpoint.length + 1) + (this.laps * racetrack.checkPoints.length));
        // this.score += this.timeAlive * (this.checkpointTimer < 0 ? -0.1 : 1);


        this.avgSpeed.push(this.currentAccel)

        if (keyIsDown(UP_ARROW)) {
            cars.currentAccel += 0.1;
        }
        if (keyIsDown(DOWN_ARROW)) {
            if (cars.currentAccel > 0) {
                cars.currentAccel -= 0.1;
            }
        }
        if (!keyIsDown(UP_ARROW) && !keyIsDown(DOWN_ARROW)) {
            cars.currentAccel -= 0.05;
        }

        if (keyIsDown(LEFT_ARROW)) {
            if (cars.currentAccel > 0) {
                cars.carSteering -= 0.05;
            }
        }
        if (keyIsDown(RIGHT_ARROW)) {
            if (cars.currentAccel > 0) {
                cars.carSteering += 0.05;
            }
        }

        if (!keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW)) {
            cars.carSteering = 0;
        }

        if (this.currentAccel > this.maxspeed) this.currentAccel = this.maxspeed;
        this.networkPrediction()

        if (this.currentAccel < 0) {
            this.currentAccel = 0;
            this.carSteering = 0;
        } else if (this.currentAccel > 0.5) {
            if (this.carSteering > 0.02) this.carSteering = 0.02;
            if (this.carSteering < -0.02) this.carSteering = -0.02;
        } else {
            this.carSteering = 0
        }

        this.applyForce(this.gas(this.velocity.heading()));
        this.setSteering(this.carSteering)
        this.velocity
            .add(this.acceleration)
            .limit(this.maxspeed);

        this.position
            .add(this.velocity);

        this.acceleration
            .mult(0);
    }

    calculateFitness() {
        this.fitness = this.score;
        this.fitness *= avg(this.avgSpeed);
        // this.fitness *= ((this.checkpoint.length + 1) + (this.laps * racetrack.checkPoints.length)) * 10;

        // this.fitness *= this.checkpointTimer / 150 < 1 ? 0.9 : 1;
    }

    checkPointCheck() {
        let checkpointIndex = this.checkpoint.length;
        let next = racetrack.checkPoints[checkpointIndex]
        let prev = racetrack.checkPoints[checkpointIndex - 2]

        if (!next) return;

        if (this.position.x > next.position.x - 50 && this.position.y > next.position.y - 50
            && this.position.x < next.position.x + 50 && this.position.y < next.position.y + 50
        ) {
            this.checkpoint.push(checkpointIndex + 1)
            this.checkpointTimer = 150;
        }

        if (prev && this.position.x > prev.position.x - 50 && this.position.y > prev.position.y - 50
            && this.position.x < prev.position.x + 50 && this.position.y < prev.position.y + 50
        ) {
            this.failed = true;
            this.done = true;
            this.score = 0;
        }

        if (racetrack.checkPoints.length === this.checkpoint.length) {
            this.checkpoint = [];
            this.laps++;
            console.log('LAP COMPLETED!', this.laps)
            this.checkpointTimer = 150;
        }
    }

    networkPrediction() {
        let inputs = this.siteDistances.map(e => e > 300 ? 1 : (e / 300))
        inputs.pop()
        inputs.push(this.currentAccel / this.maxspeed)
        inputs.push(this.carSteering / 0.2)

        this.prediction = this.brain.predict(inputs)

        this.currentAccel += this.prediction[0] * 0.1;
        this.carSteering += this.prediction[1] * 0.05;

    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    seek(target) {
        let desired = p5.Vector
            .sub(target, this.position)
            .normalize()
            .mult(this.maxspeed)

        let steer = p5.Vector
            .sub(desired, this.velocity)
            .limit(this.maxforce);

        return steer;
    }

    setSteering(value) {
        let heading = this.velocity.heading();

        if (value)
            this.applyForce(this.gas(heading + value));
    }

    gas(heading) {
        let sum = createVector(0, 0);
        let newDir = p5.Vector.fromAngle(heading);

        if (this.currentAccel === 0) {
            return;
        }

        sum
            .add(newDir)
            .div(1)
            .normalize()
            .mult(this.currentAccel)

        let steer = p5.Vector.sub(sum, this.velocity);
        steer.limit(this.maxforce);
        return steer;
    }


    render() {
        //angleMode(RADIANS);

        if (this.topAgent) {
            fill(255);
            text(this.currentAccel, 10, 30)
            text(this.checkpointTimer, 10, 40)
        }

        push();
        fill(100, 100, 100, 127);
        rectMode(CENTER);

        if (this.topAgent) {
            fill(100, 0, 0, 127);
        } else if (this.eliteAgent) {
            fill(0, 0, 100, 127);
        }

        stroke(200);
        translate(this.position.x, this.position.y);

        rotate(this.velocity.heading() + radians(-90));
        rect(0, 0, 10, 20, 3)


        pop()
    }

}