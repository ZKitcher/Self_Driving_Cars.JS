class Population {
    constructor(constructor, popSize = 25) {
        this.agents = [];
        this.popSize = popSize;
        this.matingPool = [];
        this.datacollection = []
        this.generation = 1;
        this.mutationRate = 0.05;
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
                newBrain = NeuralNetwork
                    .mergeNetworks(
                        rand(this.matingPool).brain.copy(),
                        rand(this.matingPool).brain.copy()
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

    setTimer(time) {
        this.timerCount = time;
        this.timer = time;
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

let genomeInputsN = 2;
let genomeOutputN = 1;
let showBest = true;

class NEATPopulation {
    constructor(constructor, popSize = 25) {
        this.agents = [];
        this.popSize = popSize;
        this.matingPool = [];
        this.datacollection = []
        this.generation = 1;
        this.mutationRate = 0.05;
        this.constructor = constructor;
        this.timerCount = 30;
        this.timer = this.timerCount;

        this.topAgent = null
        this.eliteAgents = 5

        for (let i = 0; i < this.popSize; i++) {
            this.agents.push(new this.constructor(i))
            this.agents[i].brain.generateNetwork();
            this.agents[i].brain.mutate();
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

    evaluate() {
        let max = -Infinity;
        let min = Infinity;
        let topAgent;
        this.matingPool = [];

        this.agents.forEach(e => {
            if (e.fitness > max) {
                max = e.fitness;
                topAgent = e;
                this.topAgent = e;
                this.topAgent.brain.id = "BestGenome";
                this.topAgent.brain.draw();
            }
            if (e.fitness < min) min = e.fitness;
        })

        let averageSum = this.getAverageScore();
        console.log(averageSum);

        this.agents.forEach(e => e.fitness = (min === max ? (e.fitness / max) : ((e.fitness - min) / (max - min))) * 10)

        this.fillMatingPool();

        this.selection()
    }

    selection() {
        let children = [];

        this.agents.sort((a, b) => b.fitness - a.fitness).forEach((e, i) => {

            let nextGen;

            let newChild = new this.constructor();

            if (e === this.topAgent || i < this.eliteAgents + 1) {
                nextGen = e.clone()
            } else {
                let parent1 = this.selectPlayer();
                let parent2 = this.selectPlayer();
                if (parent1.fitness > parent2.fitness) {
                    nextGen = parent1.crossover(parent2);
                } else {
                    nextGen = parent2.crossover(parent1);
                }
            }
            newChild.passDown(nextGen.brain);


            if (e === this.topAgent) {
                newChild.topAgent = true;
            } else if (i < this.eliteAgents) {
                newChild.eliteAgent = true;
            }

            children.push(newChild)
        })

        this.agents = children;
        this.generation++;

        console.log(this.agents)

        this.agents.forEach((e) => {
            e.brain.generateNetwork();
        });
    }

    fillMatingPool() {
        this.matingPool = [];
        this.agents.forEach((e, index) => {
            let n = e.fitness * 100;
            for (let i = 0; i < n; i++) {
                this.matingPool.push(index);
            }
        });
    }

    selectPlayer() {
        return this.agents[rand(this.matingPool)]
    }

    getAverageScore() {
        let avSum = 0;
        this.agents.forEach((e) => {
            avSum += e.fitness;
        });

        return avSum / this.agents.length;
    }

    collectData(input, target) {
        this.datacollection.push(
            {
                input: input instanceof Array ? input : [input],
                target: target instanceof Array ? target : [target]
            }
        );
    }

    setTimer(time) {
        this.timerCount = time;
        this.timer = time;
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

    reset() {
        this.evaluate()
        this.timer = this.timerCount
    }
}

class NEATMLObject {
    constructor(id) {
        if (typeof createMLObjectBrain !== 'undefined') {
            this.brain = createMLObjectBrain(id);
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

    passDown(brain) {

        this.brain = brain;
    }

    clone() {
        let clone = new NEATMLObject();
        clone.brain = this.brain.clone();
        return clone;
    }

    crossover(parent) {
        let child = new NEATMLObject();
        if (parent.fitness < this.fitness)
            child.brain = this.brain.crossover(parent.brain);
        else
            child.brain = parent.brain.crossover(this.brain);

        child.brain.mutate()
        return child;
    }
}