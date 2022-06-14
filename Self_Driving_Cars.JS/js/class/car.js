class Car extends Motion {
    constructor() {
        super(150, 100)

        this.currentAccel = 0;
        this.carSteering = 0;

        this.sightLines = []

        for (let i = 0; i < 5; i++) {
            this.sightLines.push(new Ray(this.position.x, this.position.y))
        }

        this.siteDistances = []
    }

    run() {
        this.update();
        this.render();
        this.updateMotion();

        this.sightLines[0].run(this.position, this.velocity.heading() - 1);
        this.sightLines[1].run(this.position, this.velocity.heading() - 0.5);
        this.sightLines[2].run(this.position, this.velocity.heading());
        this.sightLines[3].run(this.position, this.velocity.heading() + 0.5);
        this.sightLines[4].run(this.position, this.velocity.heading() + 1);


        this.siteDistances = this.sightLines.map(e => e.getDistance())

    }

    update() {
        rectMode(CENTER);

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

        if (this.currentAccel > 5) this.currentAccel = 5;
        if (this.currentAccel < 0.1) this.currentAccel = 0.1;

        if (this.carSteering > 0.02) this.carSteering = 0.02;
        if (this.carSteering < -0.02) this.carSteering = -0.02;

        let heading = this.velocity.heading();
        let gas = this.gas(heading);
        this.applyForce(gas);
        this.setSteering(this.carSteering)
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
            //this.velocity = createVector(0, 0);
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

        fill(127, 127);
        stroke(200);
        translate(this.position.x, this.position.y);
        rotate(this.velocity.heading() + radians(-90));
        rect(0, 0, 10, 20, 3)

        pop()
    }

}