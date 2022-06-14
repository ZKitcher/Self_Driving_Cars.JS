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

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);

    cars = new Car() //Population(Car, 100);

    racetrack = new RaceTrack();
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
    //walls.forEach(e => e.run())
}

function keyPressed() {


}

function mouseClicked() {
    //racetrack.updateMap(mouseX, mouseY)
}

// const completedGeneration = () => {
//     target = new Target()
// }

// const createMLObjectBrain = () => {
//     let nn = new NeuralNetwork(1, 1);
//     nn.addHiddenLayer(12, 'tanH');
//     nn.addHiddenLayer(6, 'tanH');
//     nn.makeWeights();

//     return nn;
// }