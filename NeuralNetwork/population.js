if (!document.getElementById('d3js')) {
    const D3JS = 'https://d3js.org/d3.v2.min.js?2.9.3';
    const script = document.createElement('script');
    script.id = 'd3js';
    script.setAttribute('src', D3JS);
    document.head.appendChild(script);
}

class NEATPopulation {
    constructor(constructor, popSize = 25) {
        this.popSize = popSize;
        this.agents = [];
        this.matingPool = [];
        this.datacollection = [];
        this.generation = 1;
        this.constructor = constructor;

        this.mutationRate = 0.1;

        this.timerEnabled = true;
        this.timerCount = 30;
        this.timer = this.timerCount;

        this.topAgent = null;
        this.eliteAgents = 5;

        for (let i = 0; i < this.popSize; i++) {
            this.agents.push(new this.constructor(i))
            this.agents[i].brain.generateNetwork();
            this.agents[i].brain.mutate();
        }

        if (typeof completedGeneration === 'undefined') {
            NetworkError.warn('completedGeneration(topAgent) not set to fire after each generation.', 'MLObject.constructor')
        }

        this.styling = {
            fontColour: null,
        }
    }

    run() {
        this.runTimer();

        this.agents.forEach(e => e.run());

        this.checkDone();

        this.render();
    }

    runTimer() {
        if (!this.timerEnabled) return;

        if (frameCount % 60 == 0 && this.timer > 0) this.timer--;

        if (this.timer == 0) this.reset()

        push()
        fill(this.styling.fontColour ?? '#000000');
        text(this.timer, width - 20, 15);
        pop()

    }

    checkDone() {
        if (this.agents.filter(e => !e.done).length === 0) this.reset()
    }

    evaluate() {
        let max = -Infinity;
        let min = Infinity;
        this.matingPool = [];

        this.agents.forEach(e => {
            e.calculateFitness()

            if (e.fitness > max) {
                max = e.fitness;
                this.topAgent = e;
                this.topAgent.brain.id = "BestGenome";
            }
            if (e.fitness < min) min = e.fitness;
        })

        this.agents.forEach(e => e.fitness = (min === max ? (e.fitness / max) : ((e.fitness - min) / (max - min))));
        this.fillMatingPool();
        this.drawAgentBrain(this.topAgent.brain);
        this.selection();
    }

    selection() {
        this.agents = this.agents.map((e, i) => {
            let newChild = new this
                .constructor(
                    i < this.eliteAgents + 1 ?
                        e.brain.clone() :
                        NEATAgent
                            .crossover(
                                this.selectAgent(),
                                this.selectAgent(),
                                this.mutationRate
                            )
                );

            newChild.brain.generateNetwork()

            if (i === 0) {
                newChild.topAgent = true;
            } else if (i < this.eliteAgents) {
                newChild.eliteAgent = true;
            }

            return newChild;
        })

        this.generation++;

        if (typeof completedGeneration !== 'undefined') {
            completedGeneration(this.topAgent)
        }
    }

    rerun() {
        this.agents = this.agents.map(e => {
            let newChild = new this.constructor(e.brain.clone());
            if (e.topAgent) {
                newChild.topAgent = true;
            } else if (e.eliteAgents) {
                newChild.eliteAgent = true;
            }
            return newChild
        })
        this.timer = this.timerCount;
    }

    fillMatingPool() {
        let average = this.getAverageFitness();
        this.matingPool = [];
        this.agents
            .sort((a, b) => b.fitness - a.fitness)
            .forEach((e, index) => {
                if (!e.topAgent && !e.eliteAgent) {
                    if (e.fitness >= average) {
                        let n = e.fitness * 100;
                        for (let i = 0; i < n; i++) {
                            this.matingPool.push(index);
                        }
                    }
                }
            });
    }

    selectAgent() {
        return this.agents[rand(this.matingPool)]
    }

    getAverageFitness() {
        let avSum = 0;
        this.agents.forEach((e) => avSum += e.fitness);
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
        if (typeof time === 'boolean') {
            this.timerEnabled = time;
            if (this.timerEnabled) this.setTimer(this.timerCount);
        } else if (isNumber(time)) {
            this.timerCount = time;
            this.timer = time;
            this.timerEnabled = true;
            this.rerun();
        } else {
            NetworkError.error('Neither a bool or number provided.')
        }
    }

    downloadDataset(title = 'Dataset') {
        download(title, JSON.stringify(this.datacollection));
    }

    render() {
        push();
        fill(this.styling.fontColour ?? '#000000');
        text(this.generation, 10, 15);
        pop();
    }

    reset() {
        this.evaluate()
        this.timer = this.timerCount
    }

    drawAgentBrain(agent, width = 500, height = 400, container = 'svgContainer') {
        const svgElement = document.getElementById(container);
        if (!svgElement) {
            const newSVGContainer = document.createElement('div');
            newSVGContainer.id = container;
            newSVGContainer.style.position = 'absolute';
            newSVGContainer.style.top = '5px';
            newSVGContainer.style.right = '5px';
            document.body.prepend(newSVGContainer);
        }

        let element = document.getElementById(agent.id);
        if (element) element.parentNode.removeChild(element);

        let svg = d3.select('body').append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('id', agent.id);


        let force = d3.layout.force()
            .size([width, height]);

        const connections = agent.connections.map(e => {
            return {
                source: agent.getNode(e.fromNode.number),
                target: agent.getNode(e.toNode.number),
                weight: e.weight,
                enabled: e.enabled
            }
        });

        const nodes = agent.nodes.map(e => {
            let node = e.clone();
            if (node.layer === 0) {
                node.fixed = true;
                node.y = height - (height * 0.2);
                node.x = ((width / agent.inputs) * node.number) + (width / agent.inputs) / 2;
                // node.y = ((height / agent.inputs) * node.number) + (height / agent.inputs) / 2;
                // node.x = (width * 0.2);
            }

            if (node.output) {
                node.fixed = true;
                node.y = (height * 0.2);
                node.x = ((width / agent.outputs) * (node.number - agent.inputs)) + (width / agent.outputs) / 2;
                // node.x = width - (width * 0.2);
                // node.y = ((height / agent.outputs) * (node.number - agent.inputs)) + (height / agent.outputs) / 2;
            }
            return node
        });

        force.nodes(nodes)
            .links(connections)
            .gravity(0.001)
            .linkStrength(1)
            .start();

        let link = svg.selectAll('.link')
            .data(connections)
            .enter().append('line')
            .attr('class', 'link')
            .style('stroke-width', (d) => { return d.enabled ? abs(d.weight) + 1 : 0 })
            .style('stroke', (d) => { return d.weight > 0 ? '#0f0' : '#f00'; })
            .style('opacity', (d) => { return d.source.layer === 0 && d.target.output ? '0.2' : '1' });

        let node = svg.selectAll('.node')
            .data(nodes)
            .enter().append('g')
            .attr('class', 'node')
            .call(force.drag);

        node.append('circle')
            .attr('r', '5')
            .attr('fill', (d) => { return d.layer == 0 ? '#00f' : d.output ? '#f00' : '#000' });

        node.append('text')
            .attr('dx', 10)
            .attr('dy', 4)
            .style('fill', this.styling.fontColour ?? '#000000')
            .text((d) => { return (d.output ? `(${d.activation})` : null) })
            .on('mouseover', function (d) {
                d3.select(this)
                    .text(`${d.number}: (${d.activation})`)
            })
            .on('mouseleave', function (d) {
                d3.select(this)
                    .text(d.output ? `(${d.activation})` : d.layer ? d.number : null)
            });

        force.on('tick', () => {
            link
                .attr('x1', (d) => { return d.source.x; })
                .attr('y1', (d) => { return d.source.y; })
                .attr('x2', (d) => { return d.target.x; })
                .attr('y2', (d) => { return d.target.y; });

            node.attr('transform', (d) => { return `translate(${d.x},${d.y})`; });
        });

        element = document.getElementById(agent.id);
        document.getElementById(container).append(element);
    }
}

class NEATAgent {
    constructor(brain) {
        if (brain instanceof NEATGenome) {
            this.brain = brain;
        } else if (typeof createMLObjectBrain !== 'undefined') {
            this.brain = createMLObjectBrain(brain);
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
        this.score = 0;
    }

    static crossover(parent1, parent2, mutationRate = 0.1) {
        let brain;
        if (parent1.fitness > parent2.fitness) {
            brain = parent1.brain.crossover(parent2.brain);
        } else {
            brain = parent2.brain.crossover(parent1.brain);
        }

        brain.mutate(mutationRate)
        return brain;
    }
}