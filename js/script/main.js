// let myCar;
let cars;
let racetrack;
let walls;
let target;

let scoreModes = {
    speed: 'SPEED',
    drift: 'DRIFT'
}

let gameMode = scoreModes.speed;

let startingPos = { x: 150, y: 200 }

const buildWallTree = () => {
    walls = new QuadTree(new BoundingBox(0, 0, width * 2, height * 2), 10);
}

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    buildWallTree()
    racetrack = new RaceTrack();
    cars = new NEATPopulation(Car, 100)
    cars.mutateOutputActivation('tanh', 0.5)
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
        `Game Mode: ${gameMode}`,
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
        `Show top Agents: A`,
        `Resize canvase to window: C`,
        `Framerate : ${frameRate().toFixed(0)}`
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
        console.log(`New Starting Position:`, startingPos)
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
        cars.toggleTopAgentsView();
    }
    if (key === 'o') {
        cars.mutateOutputActivation('tanh', 1);
    }
    if (key === '1') {
        gameMode = scoreModes.speed;
    }
    if (key === '2') {
        gameMode = scoreModes.drift;
    }
}

function mouseClicked() {
    racetrack.updateMap(mouseX, mouseY)
}

const completedGeneration = () => {}

const createMLObjectBrain = (id) => new NEATGenome(9, 2, id);