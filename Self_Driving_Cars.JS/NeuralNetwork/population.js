class Population {
    constructor(constructor, popSize = 25, mutationRate = 0.1) {
        this.agents = [];
        this.popSize = popSize;
        this.matingPool = [];
        this.datacollection = []
        this.generation = 1;
        this.mutationRate = mutationRate;
        this.constructor = constructor;

        for (let i = 0; i < this.popSize; i++) {
            this.agents.push(new this.constructor())
        }

        if (typeof completedGeneration === 'undefined') {
            NetworkError.warn('completedGeneration(bestAgent) not set to fire after each generation.', 'MLObject.constructor')
        }
    }

    run() {
        this.agents.forEach(e => e.run())
        this.render()
    }

    evaluate() {
        let maxFitness = 0;
        let bestAgent;

        this.agents.forEach(e => {
            if (e.fitness > maxFitness) {
                maxFitness = e.fitness;
                bestAgent = e;
            }
        })

        this.agents.forEach(e => e.fitness /= maxFitness);
        this.selection(bestAgent)
    }

    selection(best) {
        let newPopulation = [];
        this.matingPool = [];

        if (best.completed && typeof completedGeneration !== 'undefined') {
            completedGeneration(best)
        }

        this.agents.forEach(e => {
            // let n = e.completed || e === best ? e.fitness * 10 : e.fitness * 5
            let n = e.completed ? e.fitness * 20 : e.fitness

            for (let i = 0; i < n; i++) {
                this.matingPool.push(e);
            }
        });

        this.agents.forEach(e => {
            let newBrain = NeuralNetwork
                .mergeNetworks(
                    random(this.matingPool).brain.copy(),
                    random(this.matingPool).brain.copy()
                );
            newBrain.mutateRandom(newBrain.learningRate, this.mutationRate);

            let nextGen = new this.constructor(newBrain);
            if (e === best) nextGen.bestGenes = true;
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
        this.completed = false;
        this.fitness;
        this.bestGenes = false;
    }
}