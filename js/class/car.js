class Car extends NEATAgent {
    constructor(brain, x = 150, y = 200) {
        super(brain);
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(0, 0);
        this.position = createVector(startingPos.x, startingPos.y);
        this.maxspeed = 10;
        this.turningRadius = 0.04

        this.startingPos = createVector(startingPos.x, startingPos.y)

        this.currentAccel = 0;
        this.carSteering = 0;

        this.sightLines = []

        for (let i = 0; i < 8; i++) {
            this.sightLines.push(new Ray(this.position.x, this.position.y))
        }

        this.siteDistances = []
        this.timeAlive = 0;

        this.laps = 0;
        this.lapTime = 0;
        this.bestLap = Infinity;
        this.leftStart = false;

        this.avgSpeed = []

        this.checkpointTimer = 180;
    }

    run() {
        this.update();
        this.render();
    }

    update() {
        if (this.done) return;

        this.lapCheck();

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

        this.siteDistances = this.sightLines.map(e => e.getDistance(this.position))

        if (this.siteDistances.filter(e => e < 10).length) {
            this.failed = true;
            this.done = true;
            this.score *= 0.75
            return;
        }

        if (this.score < 0 || this.currentAccel < 0.5 && this.timeAlive > 10) {
            this.failed = true;
            this.done = true;
            return;
        }

        if (this.currentAccel > 2) this.score++;
        this.lapTime++;

        this.avgSpeed.push(this.currentAccel)

        // if (keyIsDown(UP_ARROW)) {
        //     this.currentAccel += 0.1;
        // }
        // if (keyIsDown(DOWN_ARROW)) {
        //     if (this.currentAccel > 0) {
        //         this.currentAccel -= 0.1;
        //     }
        // }
        // if (!keyIsDown(UP_ARROW) && !keyIsDown(DOWN_ARROW)) {
        //     this.currentAccel -= 0.05;
        // }
        // if (keyIsDown(LEFT_ARROW)) {
        //     if (this.currentAccel > 0) {
        //         this.carSteering -= 0.05;
        //     }
        // }
        // if (keyIsDown(RIGHT_ARROW)) {
        //     if (this.currentAccel > 0) {
        //         this.carSteering += 0.05;
        //     }
        // }
        // if (!keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW)) {
        //     this.carSteering = 0;
        // }

        if (this.currentAccel > this.maxspeed) this.currentAccel = this.maxspeed;
        this.networkPrediction()

        if (this.currentAccel < 0) {
            this.currentAccel = 0;
            this.carSteering = 0;
        } else if (this.currentAccel > 0.5) {
            if (this.carSteering > this.turningRadius) this.carSteering = this.turningRadius;
            if (this.carSteering < -this.turningRadius) this.carSteering = -this.turningRadius;
            this.currentAccel -= 0.001;
            if (this.carSteering > 0) this.carSteering -= 0.001
            if (this.carSteering < 0) this.carSteering += 0.001
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

        this.fitness += this.fitness * (avg(this.avgSpeed) / this.maxspeed);

        let min = Infinity;
        cars.agents.forEach(e => {
            if (e.laps > 0) {
                if (e.bestLap < min) min = e.bestLap;
            }
        });

        if (min !== Infinity && min === this.bestLap) {
            clog('Adding Lap bonus')
            this.fitness += this.fitness * 1.5
        }
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
            clog('LAP COMPLETED!', this.laps)
        }
    }

    networkPrediction() {
        let inputs = this.siteDistances.map(e => e > 200 ? 1 : (e / 200))
        inputs.pop()
        inputs.push(this.currentAccel / this.maxspeed)
        inputs.push(this.carSteering / 0.4)

        this.prediction = this.brain.predict(inputs).map(e => e > 1 ? 1 : e);

        this.currentAccel += this.prediction[0] > 0 ? this.prediction[0] * 0.1 : this.prediction[0] * 0.5;
        this.carSteering += this.prediction[1] * 0.04;
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

        if (this.topAgent && this.prediction) {
            push()

            fill(255);
            text('Acceleration', 10, 30)
            text(this.currentAccel.toFixed(2), 10, 40)
            rect(10, 43, 50, 10)

            text('Turning', 10, 70)
            text(this.carSteering.toFixed(2), 10, 80)
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