
let cars;
let racetrack;
let walls = [];
let target;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    racetrack = new RaceTrack();
    cars = new NEATPopulation(Car, 100)

    // cars.eliteAgents = 5;

    // cars = new Car()
}

function draw() {
    push()
    background(51);
    pop()

    run()
}

const run = () => {
    cars.run();
    racetrack.run();
}

function keyPressed() {
    if (key === 'r') {
        cars.reset()
    }
    if (key === 't') {
        racetrack.addCheckpoint(mouseX, mouseY)
    }
}

function mouseClicked() {
    racetrack.updateMap(mouseX, mouseY)
}

const completedGeneration = () => {
    target = new Target()
}

const createMLObjectBrain = () => {
    return new NEATGenome(9, 2, rand());

    // let nn = new NeuralNetwork(9, 2);
    // nn.addHiddenLayer(12, 'tanH');
    // nn.addHiddenLayer(6, 'tanH');
    // nn.addHiddenLayer(3, 'tanH');
    // nn.makeWeights();

    // //nn.learningRate = 0.3

    // return nn;
}
