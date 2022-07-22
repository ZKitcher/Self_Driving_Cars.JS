// let myCar;
let cars;
let racetrack;
let walls;
let target;

let startingPos = { x: 150, y: 200 }

const buildWallTree = () => {
    walls = new QuadTree(new BoundingBox(0, 0, width * 2, height * 2), 10);
}

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    buildWallTree()
    racetrack = new RaceTrack();
    cars = new NEATPopulation(Car, 100)
    cars.styling.fontColour = '#FFF'

    // myCar = new Car()
}

function draw() {
    push()
    background(51);
    pop()
    run()
}

const run = () => {
    cars.run();
    // myCar.run();
    racetrack.run();

    if (keyIsDown(187)) {
        racetrack.addToTrack(mouseX, mouseY)
    }
    if (keyIsDown(189)) {
        racetrack.removeTrack(mouseX, mouseY)
    }

    push()
    fill('#FFF')
    text(`Reset: R`, 10, height - 85);
    text(`Restart: Q`, 10, height - 74);
    text(`Pause: P`, 10, height - 63);
    text(`Draw Brain: B`, 10, height - 52);
    text(`New Start Pos: S`, 10, height - 41);
    text(`Premade Track: T`, 10, height - 30);
    text(`Add Track: +`, 10, height - 19);
    text(`Remove Track: -`, 10, height - 8);
    pop()
}


function keyPressed() {
    if (key === 'r') {
        cars.reset()
    }
    if (key === 'q') {
        cars.restart()
    }
    if (key === 'p') {
        cars.togglePause()
    }
    if (key === 'b') {
        cars.toggleBrainRender();
    }
    if (key === 's') {
        startingPos.x = mouseX
        startingPos.y = mouseY
        cars.rerun();
    }
    if (key === 't') {
        racetrack.getPremadeTrack()
        cars.rerun()
    }
    if (key === '0') {
        racetrack.clearTrack()
    }
    if (key === '.') {
        racetrack.upRes()
        cars.rerun()
    }
    if (key === ',') {
        racetrack.downRes()
        cars.rerun()
    }
    if (key === 'g') {
        racetrack.generateTrack()
        cars.rerun()
    }
    if (key === 'c') {
        createCanvas(window.innerWidth, window.innerHeight);
    }
}

function mouseClicked() {
    racetrack.updateMap(mouseX, mouseY)
}

const completedGeneration = () => {
    // target = new Target()
}

const createMLObjectBrain = (id) => {
    return new NEATGenome(9, 2, id);

    // let nn = new NeuralNetwork(9, 2);
    // nn.addHiddenLayer(12, 'tanH');
    // nn.addHiddenLayer(6, 'tanH');
    // nn.addHiddenLayer(3, 'tanH');
    // nn.makeWeights();

    // nn.learningRate = 0.3

    // return nn;
}