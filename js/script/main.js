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

    renderText()
    
}

const renderText = () => {
    const textLabel = [
        `Evaluate: E`,
        `Restart: Q`,
        `Pause: P`,
        `Draw Brain: B`,
        `New Start Pos: S`,
        `Generate Random Track: G`,
        `Premade Track: T`,
        `Clear Track: 0`,
        `+25 Track Resolution: >`,
        `-25 Track Resolution: <`,
        `Add Track: +`,
        `Remove Track: -`,
        `Toggle Sight lines: A`,
        `Resize canvase to window: C`,
    ]
    push()
    fill('#FFF')
    textLabel.reverse().forEach((e, i) => {
        text(e, 10, height - (13 * (i + 1)));
    })
    pop()
}


function keyPressed() {
    if (key === 'e') {
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
    if (key === 'a') {
        cars.agents.forEach(e => e.config.showSightLines = !e.config.showSightLines);
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