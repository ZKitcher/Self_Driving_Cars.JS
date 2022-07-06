class Population {
    constructor(constructor, popSize = 25, mutationRate = 0.05) {
        this.agents = [];
        this.popSize = popSize;
        this.matingPool = [];
        this.datacollection = []
        this.generation = 1;
        this.mutationRate = mutationRate;
        this.constructor = constructor;
        this.timerCount = 30;
        this.timer = this.timerCount;

        this.topAgent = null
        this.eliteAgents = 5

        for (let i = 0; i < this.popSize; i++) {
            this.agents.push(new this.constructor())
        }

        if (typeof completedGeneration === 'undefined') {
            NetworkError.warn('completedGeneration(topAgent) not set to fire after each generation.', 'MLObject.constructor')
        }
    }

    run() {
        if (frameCount % 60 == 0 && this.timer > 0) {
            this.timer--;
        }

        if (this.timer == 0) this.reset()

        this.agents.forEach(e => e.run())

        if (this.agents.filter(e => !e.done).length === 0) this.reset()

        this.render()
    }

    reset() {
        this.evaluate()
        this.timer = this.timerCount
    }

    evaluate() {
        let max = 0;
        let min = Infinity;
        let topAgent;
        this.matingPool = [];

        this.agents.forEach(e => {
            if (e.fitness > max) {
                max = e.fitness;
                topAgent = e;
            }
            if (e.fitness < min) min = e.fitness;
        })

        this.agents.sort((a, b) => b.fitness - a.fitness).forEach((e, i) => {
            e.fitness = (min === max ? (e.fitness / max) : ((e.fitness - min) / (max - min))) * 10;
            if (i < this.popSize / 5) {
                let n = e.completed || e === topAgent ? e.fitness *= 2 : e.fitness

                for (let i = 0; i < n; i++) {
                    this.matingPool.push(e);
                }
                // for (let i = 0; i <= e.fitness; i++) {
                //     this.matingPool.push(e);
                // }
            }
        });

        this.topAgent = topAgent
        this.selection()
    }

    selection() {
        let newPopulation = [];

        if (this.topAgent?.completed && typeof completedGeneration !== 'undefined') {
            completedGeneration(this.topAgent)
        }

        this.agents.sort((a, b) => b.fitness - a.fitness).forEach((e, i) => {
            let newBrain;

            if (e === this.topAgent || i < this.eliteAgents + 1) {
                newBrain = e.brain.copy()
            } else {
                // let coinflip = random(0, 1)
                // newBrain = coinflip > 0.5
                //     ? NeuralNetwork
                //         .mergeNetworks(
                //             random(this.matingPool).brain.copy(),
                //             random(this.matingPool).brain.copy()
                //         )
                //     : random(this.matingPool).brain.copy();
                newBrain = NeuralNetwork
                    .mergeNetworks(
                        random(this.matingPool).brain.copy(),
                        random(this.matingPool).brain.copy()
                    )
                newBrain.mutateRandom(newBrain.learningRate, this.mutationRate);
            }

            let nextGen = new this.constructor(newBrain);
            if (e === this.topAgent) {
                nextGen.topAgent = true;
            } else if (i < this.eliteAgents) {
                nextGen.eliteAgent = true;
            }
            newPopulation.push(nextGen);
        });

        this.agents = newPopulation;
        this.generation++;
    }

    collectData(input, target) {
        this.datacollection.push(
            {
                input: input instanceof Array ? input : [input],
                target: target instanceof Array ? target : [target]
            }
        );
    }

    downloadDataset(title = 'Dataset') {
        download(title, JSON.stringify(this.datacollection));
    }

    render() {
        push();
        fill(255, 255, 255);
        text(this.generation, 10, 15);
        text(this.timer, width - 20, 15);

        // if (this.topAgent)
        // this.topAgent.brain.show()

        pop();
    }
}

class MLObject {
    constructor(brain) {
        if (brain instanceof NeuralNetwork) {
            this.brain = brain;
        } else if (typeof createMLObjectBrain !== 'undefined') {
            this.brain = createMLObjectBrain();
        } else {
            NetworkError.error('createMLObjectBrain() needed to create a neural netword for the MLObject.', 'MLObject.constructor');
            return;
        }
        this.failed = false;
        this.success = false;
        this.done = false;
        this.topAgent = false;
        this.eliteAgent = false;
        this.fitness = 0;
        this.prediction;
    }
}