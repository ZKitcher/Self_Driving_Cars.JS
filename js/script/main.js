//const dataset = makeXOR(2);

// const nn = new NeuralNetwork(1, 1);
// nn.addHiddenLayer(12, 'tanH');
// nn.addHiddenLayer(6, 'tanH');
// nn.outputActivation('sigmoid');
// nn.makeWeights();
// nn.train(5000, dataset);
// nn.exhibition(dataset)
// nn.log();

let cars;
let racetrack;
let walls = [];
let target;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    racetrack = new RaceTrack();
    cars = new Population(Car, 100, 0.4);
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
        // cars.evaluate()
        // timer = timerCount
    }
    if (key === 't') {
        racetrack.addCheckpoint(mouseX, mouseY)
    }
}

function mouseClicked() {
    racetrack.updateMap(mouseX, mouseY)
}

// const completedGeneration = () => {
//     target = new Target()
// }

const createMLObjectBrain = () => {
    let nn = new NeuralNetwork(7, 2);
    nn.addHiddenLayer(12, 'tanH');
    nn.addHiddenLayer(6, 'tanH');
    nn.addHiddenLayer(3, 'tanH');
    nn.makeWeights();

    return nn;
}