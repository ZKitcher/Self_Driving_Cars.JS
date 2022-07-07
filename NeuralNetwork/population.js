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
        this.population = [];
        this.bestPlayer;
        this.bestFitness = 0;

        this.generation = 0;
        this.matingPool = [];


        //CONVERT NEAT POP TO OG POP.

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

    done() {
        for (let i = 0; i < this.population.length; i++) {
            if (!this.population[i].dead) {
                return false;
            }
        }

        return true;
    }

    evaluate() {
        this.calculateFitness();

        let averageSum = this.getAverageScore();
        console.log(averageSum);
        let children = [];

        this.fillMatingPool();
        for (let i = 0; i < this.population.length; i++) {
            let parent1 = this.selectPlayer();
            let parent2 = this.selectPlayer();
            if (parent1.fitness > parent2.fitness)
                children.push(parent1.crossover(parent2));
            else
                children.push(parent2.crossover(parent1));
        }


        this.population.splice(0, this.population.length);
        this.population = children.slice(0);
        this.generation++;
        this.population.forEach((element) => {
            element.brain.generateNetwork();
        });

        console.log("Generation " + this.generation);

        this.bestPlayer.lifespan = 0;
        this.bestPlayer.dead = false;
        this.bestPlayer.score = 1;
    }

    calculateFitness() {
        let currentMax = 0;
        this.population.forEach((element) => {
            element.calculateFitness();
            if (element.fitness > this.bestFitness) {
                this.bestFitness = element.fitness;
                this.bestPlayer = element.clone();
                this.bestPlayer.brain.id = "BestGenome";
                this.bestPlayer.brain.draw();
            }

            if (element.fitness > currentMax)
                currentMax = element.fitness;
        });

        //Normalize
        this.population.forEach((element, elementN) => {
            element.fitness /= currentMax;
        });
    }

    fillMatingPool() {
        this.matingPool.splice(0, this.matingPool.length);
        this.population.forEach((element, elementN) => {
            let n = element.fitness * 100;
            for (let i = 0; i < n; i++)
                this.matingPool.push(elementN);
        });
    }

    selectPlayer() {
        let rand = Math.floor(Math.random() * this.matingPool.length);
        return this.population[this.matingPool[rand]];
    }

    getAverageScore() {
        let avSum = 0;
        this.population.forEach((element) => {
            avSum += element.score;
        });

        return avSum / this.population.length;
    }
}

class Player {
    constructor(id) {
        this.brain = new NEATGenome(genomeInputsN, genomeOutputN, id);

        // this.score = 1;
        // this.lifespan = 0;
        // this.dead = false;
        // this.decisions = [];
        // this.vision = [];

        this.failed = false;
        this.success = false;
        this.done = false;
        this.topAgent = false;
        this.eliteAgent = false;
        this.fitness = 0;
        this.prediction;
    }

    clone() {
        let clone = new Player();
        clone.brain = this.brain.clone();
        return clone;
    }

    crossover(parent) {
        let child = new Player();
        if (parent.fitness < this.fitness)
            child.brain = this.brain.crossover(parent.brain);
        else
            child.brain = parent.brain.crossover(this.brain);

        child.brain.mutate()
        return child;
    }
}