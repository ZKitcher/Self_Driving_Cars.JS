class Car extends MLObject {
    constructor(brain) {
        super(brain);
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(0, 0);
        this.position = createVector(150, 200);
        this.maxspeed = 10;

        this.currentAccel = 0;
        this.carSteering = 0;

        this.sightLines = []

        for (let i = 0; i < 5; i++) {
            this.sightLines.push(new Ray(this.position.x, this.position.y))
        }

        this.siteDistances = []
        this.timeAlive = 0;

        this.laps = 0;
        this.checkpoint = []
    }

    run() {
        this.checkPointCheck();
        this.update();
        this.render();
    }

    update() {
        rectMode(CENTER);

        this.sightLines[0].run(this.position, this.velocity.heading() - 1);
        this.sightLines[1].run(this.position, this.velocity.heading() - 0.5);
        this.sightLines[2].run(this.position, this.velocity.heading());
        this.sightLines[3].run(this.position, this.velocity.heading() + 0.5);
        this.sightLines[4].run(this.position, this.velocity.heading() + 1);


        this.siteDistances = this.sightLines.map(e => e.getDistance())

        if (this.siteDistances.filter(e => e < 10).length) {
            this.failed = true;
            this.done = true;
            this.fitness /= 1.5;
        }

        let checkpointMulti = this.checkpoint.length ? this.checkpoint.length * 10 : 1;
        let lapMulti = this.laps ? this.laps * 15 : 1;

        let spinCheck = dist(this.position.x, this.position.y, 150, 200) < 400 ? 0.1 : 1;

        this.fitness = ((this.timeAlive * checkpointMulti) * lapMulti) * spinCheck;

        if (this.failed) return;

        this.timeAlive++;

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
            cars.carSteering -= 0.05;
        }
        if (keyIsDown(RIGHT_ARROW)) {
            cars.carSteering += 0.05;
        }

        if (!keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW)) {
            cars.carSteering = 0;
        }

        // if (this.currentAccel > this.maxspeed) this.currentAccel = this.maxspeed;
        if (this.currentAccel < 0.1) this.currentAccel = 0.1;

        if (this.carSteering > 0.02) this.carSteering = 0.02;
        if (this.carSteering < -0.02) this.carSteering = -0.02;

        this.networkPrediction()

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

    checkPointCheck() {
        let checkpointIndex = this.checkpoint.length;
        let next = racetrack.checkPoints[checkpointIndex]

        if (!next) return;

        rect(next.x - 50, next.y - 50, 100, 100)

        if (this.position.x > next.position.x - 50 && this.position.y > next.position.y - 50
            && this.position.x < next.position.x + 50 && this.position.y < next.position.y + 50
        ) {
            this.checkpoint.push(checkpointIndex + 1)
            console.log(`CHECKPOINT ${checkpointIndex + 1}!`, this)
        }

        if (racetrack.checkPoints.length === this.checkpoint.length) {
            this.checkpoint = [];
            this.laps++;
            console.log('LAP COMPLETED!', this)
        }
    }

    networkPrediction() {

        let inputs = []

        inputs = this.siteDistances.map(e => e > 300 ? 1 : (e / 300))
        inputs.push(this.currentAccel / this.maxspeed)
        inputs.push(this.carSteering / 0.2)

        this.prediction = this.brain.predict(inputs)

        this.currentAccel += this.prediction[0] * 0.1 * (this.prediction[0] < 0.5 ? -1 : 1)
        this.carSteering += this.prediction[1] * 0.05 * (this.prediction[1] < 0.5 ? -1 : 1)

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

        push();


        fill(this.bestGenes ? 255 : 127, 127);
        stroke(200);
        translate(this.position.x, this.position.y);

        rotate(this.velocity.heading() + radians(-90));
        rect(0, 0, 10, 20, 3)


        pop()
    }

}