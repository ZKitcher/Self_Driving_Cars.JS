class RaceTrack {
    constructor() {
        this.res = 100;
        this.cols = 1 + width / this.res;
        this.rows = 1 + height / this.res;
        this.checkPoints = []

        this.field = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], [1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0], [1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0], [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1], [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1], [1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0], [1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0], [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1], [1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0], [1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0], [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1], [1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1], [1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0], [1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1], [1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1], [1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1], [1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0], [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1]]
        //this.field = this.getPremadeTrack()

        // this.field = [[]]

        // for (let i = 0; i < this.cols; i++) {
        //     this.field[i] = [];
        //     for (let j = 0; j < this.rows; j++) {
        //         this.field[i][j] = floor(random(2))
        //     }
        // }

    }

    run() {
        this.update();
        this.render();
    }

    updateMap(x, y) {
        let i = floor(x / this.res);
        let j = floor(y / this.res);
        this.field[i][j] = this.field[i][j] ? 0 : 1;
    }

    downloadTrack(title = 'RaceTrack') {
        download(title, JSON.stringify(this.field))
    }

    update() {

    }

    getPremadeTrack() {
        const tracks = [
            {
                track: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1], [1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1], [1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1], [1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1], [1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1], [1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1], [1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1], [1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1], [1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1], [1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1], [1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1], [1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1], [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1], [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1], [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1], [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1], [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1], [1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1], [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0]],
                checkPoints: [
                    [501, 101],
                    [1101, 202],
                    [1902, 198],
                    [1201, 502],
                    [1900, 700],
                    [1400, 901],
                    [899, 751],
                    [404, 500],
                    [600, 901],
                    [100, 754],
                    [126, 226],
                ]
            },
            {
                track: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1], [1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1], [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1], [1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1], [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1], [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1], [1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1], [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1], [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1], [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1], [1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1], [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1], [1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1], [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1], [1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1], [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1], [1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1], [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1], [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0]],
                checkPoints: [
                    [394, 98],
                    [398, 502],
                    [999, 501],
                    [821, 130],
                    [1300, 97],
                    [1899, 200],
                    [1201, 496],
                    [1898, 701],
                    [245, 897],
                    [148, 201],
                ]
            },
        ]

        let chosen = random(tracks)

        chosen.checkPoints.forEach(e => this.addCheckpoint(e[0], e[1]))

        return chosen.track
    }

    addCheckpoint(x, y) {
        this.checkPoints.push(new Checkpoint(x, y))
    }

    getState(a, b, c, d) {
        return a * 8 + b * 4 + c * 2 + d * 1
    }

    render() {

        walls = [];
        push()
        //rectMode(CORNER)
        fill(125, 125)
        this.checkPoints.forEach(e => rect(e.position.x - 50, e.position.y - 50, 100, 100))

        for (let i = 0; i < this.cols - 1; i++) {
            for (let j = 0; j < this.rows - 1; j++) {
                let x = i * this.res;
                let y = j * this.res;
                let a = new p5.Vector(x + this.res * 0.5, y)
                let b = new p5.Vector(x + this.res, y + this.res * 0.5)
                let c = new p5.Vector(x + this.res * 0.5, y + this.res)
                let d = new p5.Vector(x, y + this.res * 0.5)

                let state = this.getState(
                    this.field[i][j],
                    this.field[i + 1][j],
                    this.field[i + 1][j + 1],
                    this.field[i][j + 1],
                )
                stroke(255)
                strokeWeight(1)
                switch (state) {
                    case 1:
                        this.drawLine(c, d)
                        break;
                    case 2:
                        this.drawLine(b, c)
                        break;
                    case 3:
                        this.drawLine(b, d)
                        break;
                    case 4:
                        this.drawLine(a, b)
                        break;
                    case 5:
                        this.drawLine(a, d)
                        this.drawLine(b, c)
                        break;
                    case 6:
                        this.drawLine(a, c)
                        break;
                    case 7:
                        this.drawLine(a, d)
                        break;
                    case 8:
                        this.drawLine(a, d)
                        break;
                    case 9:
                        this.drawLine(a, c)
                        break;
                    case 10:
                        this.drawLine(a, b)
                        this.drawLine(c, d)
                        break;
                    case 11:
                        this.drawLine(a, b)
                        break;
                    case 12:
                        this.drawLine(b, d)
                        break;
                    case 13:
                        this.drawLine(b, c)
                        break;
                    case 14:
                        this.drawLine(c, d)
                        break;
                }
            }
        }
        pop()

    }

    drawLine(v1, v2) {
        walls.push(new Boundary(v1.x, v1.y, v2.x, v2.y))
        line(v1.x, v1.y, v2.x, v2.y)
    }

}