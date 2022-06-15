class Ray {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.dir = createVector(0, 5);
    }

    run(pos, heading) {
        this.position = pos;

        this.dir = p5.Vector.fromAngle(heading === 0 ? 0.00000000001 : heading).mult(20);

        //this.render();
    }

    cast(wall) {

        const x1 = wall.a.x;
        const y1 = wall.a.y;
        const x2 = wall.b.x;
        const y2 = wall.b.y;

        const x3 = this.position.x;
        const y3 = this.position.y;
        const x4 = this.position.x + this.dir.x;
        const y4 = this.position.y + this.dir.y;

        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

        if (den === 0) return;

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

        if (t > 0 && t < 1 && u > 0) {
            const pt = createVector();
            pt.x = x1 + t * (x2 - x1);
            pt.y = y1 + t * (y2 - y1);
            return pt;
        } else {
            return;
        }
    }

    getDistance() {
        let closest = null;
        let record = Infinity;
        for (let wall of walls) {
            const pt = this.cast(wall);
            if (pt) {
                const d = p5.Vector.dist(this.position, pt);
                if (d < record) {
                    record = d;
                    closest = pt;
                }
            }
        }

        return record;
    }

    render() {
        push()
        stroke(255)

        let closest = null;

        let record = Infinity;
        for (let wall of walls) {
            const pt = this.cast(wall);
            if (pt) {
                const d = p5.Vector.dist(this.position, pt);
                if (d < record) {
                    record = d;
                    closest = pt;
                }
            }
        }

        if (closest) {
            line(this.position.x, this.position.y, closest.x, closest.y)
        }

        pop()
    }
}