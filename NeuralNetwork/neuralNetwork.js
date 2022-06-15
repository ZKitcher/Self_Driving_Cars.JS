NetworkError = function NetworkError(msg, method) {
    this.msg = msg;
    this.method = method;
};

NetworkError.prototype.warn = () => {
    console.warn('Warning: ' + this.message);
    console.warn('> ' + this.method);
    console.trace();
};

NetworkError.prototype.error = () => {
    console.error('Error: ' + this.message);
    console.error('> ' + this.method);

    console.trace();
};

NetworkError.warn = (warning, method) => {
    console.warn('Warning: ' + warning);
    console.warn('> ' + method);
    console.trace();
}

NetworkError.error = (error, method) => {
    console.error('Error: ' + error);
    console.error('> ' + method);
    console.trace();
};


const LayerType = {
    input: 'input',
    hidden: 'hidden',
    output: 'output',
    pool: 'pool'
}

// { String } type A string representing the type of this layer.
// { Number } Size The size of the downsampling layer.
// { Number } Sample The size of the 2d sample iterating trough the array.
// { Number } Stride The number of jumps the sample is going to perform for each iteration.

class Layer {
    constructor(type, size, activationFunc, arg3, arg4, arg5) {
        this.type = type;
        this.subtype = this.getSubtype();
        if (this.subtype !== LayerType.pool) {
            if (this.type === LayerType.hidden || this.type === LayerType.output) {
                this.size = size;
                this.setFunc(activationFunc);
                this.layer = new Matrix(this.size, 1);
            } else if (this.type === LayerType.input) {
                this.size = size;
                this.layer = new Matrix(this.size, 1);
            }
        } else if (this.subtype === LayerType.pool) {
            // Pooling Layers
            this.stride = arg3;
            this.sampleSize = activationFunc;
            this.inputSize = size;

            if (arg4 !== undefined && arg5 !== undefined) {
                this.sizeX = arg4;
                this.sizeY = arg5;
            } else {
                this.sizeX = Math.sqrt(this.inputSize);
                this.sizeY = this.sizeX;
                if (this.sizeX !== Math.floor(this.sizeX)) {
                    NetworkError.error('The array can not be set in a square matrix', 'Layer.constructor');
                    return;
                }
            }

            this.size = Layer.getPoolOutputLength(arg2, arg3, this.sizeX, this.sizeY);
            let divx = this.inputSize / this.sizeX;
            let divy = this.inputSize / this.sizeY;

            if (divx !== floor(divx) && divy !== floor(divy)) {
                NetworkError.error('The width & height value specified to arrange the inputted array as a matrix are not valid. (The array length must be divisible by the width & height values.)', 'Layer.constructor');
                return;
            }
            if (this.size !== floor(this.size)) {
                NetworkError.error(`The Width must be divisible by the stride (jumps size). Width is the root of the array's length.`, 'Layer.constructor');
                return;
            }

            this.input = new Matrix(this.inputSize, 1);
            this.layer = new Matrix(this.size, 1);

            // picking the pooling function:
            this.prefix = this.getPrefix();
            this.poolfunc = poolfuncs[this.prefix];

            //Downsampling function, appling the pool function to the segmented arrays.
            this.downsample = function (data, f, s) {
                this.input = Matrix.fromArray(data);
                //Split inputs in smaller pool arrays.
                let samples = Layer.selectPools(data, f, s, this.sizeX, this.sizeY);
                let output = [];
                for (let i = 0; i < samples.length; i++) {
                    output[i] = this.poolfunc(samples[i]);
                }
                this.layer = Matrix.fromArray(output);
                return output;
            };
        } else {
            if (typeof this.type === 'string') {
                NetworkError.error(`The Layer type '${this.type}' is not valid.`, 'Layer.constructor');
            } else {
                NetworkError.error('You need to specify a valid type of Layer', 'Layer.constructor');
            }
        }
    }


    feed(data, options) {
        if (this.subtype !== LayerType.pool) {
            NetworkError.error("This function can only be used by Layers with 'pool' subtype", 'Layer.feed');
        } else {
            let showLog = false;
            let table = false;
            let f = this.sampleSize;
            let s = this.stride;
            if (options !== undefined) {
                if (options.log) {
                    showLog = options.log;
                }
                if (options.table) {
                    table = options.table;
                }
            }
            if (data.length !== this.inputSize) {
                NetworkError.error(`The data you are trying to feed to this ${this.type} layer is not the same length as the number of input this layer has.`, 'Layer.feed');
                return;
            } else {
                let downsampled = this.downsample(data, f, s);
                if (showLog) {
                    if (table) {
                        console.table(downsampled);
                    } else {
                        console.log(downsampled);
                    }
                }
                return downsampled;
            }
        }
    };

    print() {
        console.log(this);
    };

    getSqIndex(w, i, j) {
        return w * j + i;
    };

    getSubtype() {
        let str = this.type;
        let len = str.length;
        let subtype = str.slice(len - 4, len);
        if (subtype === LayerType.pool) {
            return subtype;
        } else {
            return str;
        }
    };

    setFunc(act) {
        const lowerCaseAct = act.toLocaleLowerCase();
        let obj = Layer.stringTofunc(lowerCaseAct);
        if (obj !== undefined) {
            this.actname = obj.name;
            this.actname_d = obj.name_d;
            this.actfunc = obj.func;
            this.actfunc_d = obj.func_d;
        } else {
            NetworkError.error('Bad activation information', 'Layer.setFunc');
            return;
        }
    };

    static getPoolOutputLength(f, s, w, h) {
        return ((w - f) / s + 1) * ((h - f) / s + 1);
    };

    getPrefix() {
        let str = this.type;
        let len = str.length;
        let prefix = str.slice(0, len - 4);
        return prefix;
    };

    static selectPools(arr, f, s, w, h) {
        if (w !== Math.floor(w)) {
            return;
        } else if (w / s !== Math.floor(w / s)) {
            return;
        }
        let samples = [];
        for (let y = 0; y + f <= h; y += s) {
            for (let x = 0; x + f <= w; x += s) {
                let sample = [];
                for (let j = 0; j < f; j++) {
                    for (let i = 0; i < f; i++) {
                        sample.push(arr[Layer.getSqIndex(w, i + x, j + y)]);
                    }
                }
                samples.push(sample);
            }
        }
        return samples;
    };

    static stringTofunc(str) {
        let act = str.toLocaleLowerCase();
        let der = act + '_d';
        let func;
        let func_d;
        func = activations[act];
        func_d = activations[der];

        if (func !== undefined) {
            if (func_d !== undefined) {
                return { name: act, name_d: der, func: func, func_d: func_d };
            } else {
                NetworkError.error(`You need to create the derivative of your custom function. The activation function specified '${str}' does not have a derivative assigned. The activation function was set to the default 'sigmoid'.`, 'Layer.stringTofunc');
                return;
            }
        } else {
            NetworkError.error(`The activation function '${str}' is not a valid activation function. The activation function was set to the default 'sigmoid'.`, 'Layer.stringTofunc');
            return;
        }
    };

    log() {
        console.log(this);
    };
};

class NeuralNetwork {
    constructor(i = 1, o = 1) {
        this.i = i;
        this.o = o;

        this.inputs = new Layer(LayerType.input, i);
        this.outputs = new Layer(LayerType.output, o, 'sigmoid');

        this.Layers = [this.inputs, this.outputs];
        this.weights = [];
        this.biases = [];
        this.errors = [];
        this.gradients = [];
        this.dropout = [];

        this.outs = [];
        this.loss = 0;
        this.learningRate = 0.1;
        this.architecture = [i, o];

        this.epoch = 0;
        this.recordLoss = false;

        this.lossfunc = lossfuncs.mse;
        this.lossfunc_s = this.lossfunc.name;
        this.percentile = 0.5;
    }

    asLabel(array) {
        return array.indexOf(Math.max(...array));
    };

    checkArrayLength(arr, n) {
        return arr.length === n;
    };

    addHiddenLayer(size, act) {
        if (act !== undefined) {
            if (activations[act.toLocaleLowerCase()] === undefined) {
                if (typeof act === 'string') {
                    NetworkError.error(`'${act}' is not a valid activation function, as a result, the activation function was set to 'sigmoid'.`, 'NeuralNetwork.addHiddenLayer');
                }
                act = 'sigmoid';
            }
        } else {
            act = 'sigmoid';
        }

        this.architecture.splice(this.architecture.length - 1, 0, size);
        let layer = new Layer(LayerType.hidden, size, act);
        this.Layers.splice(this.Layers.length - 1, 0, layer);
    };

    makeWeights(arg1, arg2) {
        let min = -1;
        let max = 1;
        if (arg1 !== undefined && arg2 !== undefined) {
            min = arg1;
            max = arg2;
        }
        for (let i = 0; i < this.Layers.length - 1; i++) {
            let previousLayerObj = this.Layers[i];
            let layerObj = this.Layers[i + 1];

            let weights = new Matrix(layerObj.layer.rows, previousLayerObj.layer.rows);
            let biases = new Matrix(layerObj.layer.rows, 1);
            this.errors[i] = new Matrix(layerObj.layer.rows, 1);
            this.gradients[i] = new Matrix(layerObj.layer.rows, 1);

            this.weights[i] = weights.randomize(min, max);
            this.biases[i] = biases.randomize(1, -1);

            if (layerObj.actfunc === undefined) {
                layerObj.setFunc('sigmoid');
            }
        }

        for (let i = 0; i < this.Layers.length; i++) {
            this.architecture[i] = this.Layers[i].layer.rows;
        }

    };

    outputActivation(act) {
        const lowerCaseAct = act.toLocaleLowerCase();
        if (activations[lowerCaseAct] === undefined) {
            if (typeof act === 'string') {
                NetworkError.error(`'${act}' is not a valid activation function, as a result, the activation function is set to 'sigmoid' by default.`, 'NeuralNetwork.outputActivation');
                return;
            } else {
                NetworkError.error("Did not detect a string value, as a result, the activation function is set to 'sigmoid' by default.", 'NeuralNetwork.outputActivation');
                return;
            }
        }

        this.Layers[this.Layers.length - 1].setFunc(act);
    };

    ffwDefaults() {
        return {
            log: false,
            table: false,
            decimals: undefined,
            asLabel: false,
        };
    };

    bckDefaults() {
        return {
            log: false,
            mode: 'cpu',
            table: false,
            dropout: undefined,
        };
    };

    logDefaults() {
        return {
            struct: true,
            misc: true,
            weights: false,
            biases: false,
            gradients: false,
            errors: false,
            layers: false,
            table: false,
            decimals: undefined,
            details: false,
        };
    };

    feedForward(inputs, options = this.ffwDefaults()) {
        let roundData = options.decimals !== undefined ? true : false;
        let dec = pow(10, options.decimals) || 1000;

        if (this.checkArrayLength(inputs, this.i)) {
            this.Layers[0].layer = Matrix.fromArray(inputs);
        } else {
            NetworkError.error(`The input array length does not match the number of inputs the js model has.`, 'NeuralNetwork.feedForward');
            return;
        }

        if (this.checkArrayLength(this.weights, 0)) {
            NetworkError.warn('The weights were not initiated. Please use the .makeWeights(); function after the initialization of the layers.', 'NeuralNetwork.feedForward');
            this.makeWeights();
        }

        for (let i = 0; i < this.weights.length; i++) {
            let pLayer = this.Layers[i];
            let layerObj = this.Layers[i + 1];
            layerObj.layer = Matrix.mult(this.weights[i], pLayer.layer);
            layerObj.layer.add(this.biases[i]);
            layerObj.layer.map(layerObj.actfunc);
        }

        this.outs = Matrix.toArray(this.Layers[this.Layers.length - 1].layer);

        let out = this.outs;
        if (roundData && options.asLabel) {
            NetworkError.warn('Cannot round if output is a label', 'NeuralNetwork.feedForward');
        } else if (options.asLabel) {
            out = this.asLabel(out);
        } else if (roundData && !options.asLabel) {
            out = out.map((x) => round(x * dec) / dec);
        }

        if (options.log === true) {
            this.print('Prediction: ');
            this.print(out, options.table);
        }
        return out;
    };

    predict() {
        return this.feedForward.apply(this, arguments);
    };

    feed(input) {
        this.print('Inputs: ');
        this.print(input);
        return this.feedForward(input, { log: true, decimals: 3 });
    }

    exhibition(dataset) {
        dataset.forEach(e => {
            if (!e.input) {
                NetworkError.error(`Dataset missing (.input) property.`, 'NeuralNetwork.exhibition');
                return;
            }
        })

        dataset.forEach(e => {
            this.feedForward(e.input, { log: true, decimals: 3 });
            if (e.target) {
                this.print('Expected: ')
                this.print(e.target)
            }
            this.print('---------------------------')
        });
    }

    backpropagate(inputs, target, options = this.bckDefaults()) {
        let targets;
        if (this.checkArrayLength(target, this.o)) {
            targets = Matrix.fromArray(target);
        } else {
            NetworkError.error(`The target array length does not match the number of ouputs the model has.`, 'NeuralNetwork.backpropagate');
            return;
        }

        if (!this.checkLearningRate()) return;

        if (options.dropout !== undefined) {
            if (!this.checkDropoutRate(options.dropout)) return;
            this.addDropout(options.dropout);
        }

        this.outs = this.feedForward(inputs, { log: false, mode: options.mode });

        this.errors[this.errors.length - 1] = Matrix.sub(targets, this.Layers[this.Layers.length - 1].layer);

        this.gradients[this.gradients.length - 1] = Matrix.map(this.Layers[this.Layers.length - 1].layer, this.Layers[this.Layers.length - 1].actfunc_d)
            .mult(this.errors[this.errors.length - 1])
            .mult(this.learningRate);

        for (let i = this.weights.length - 1; i > 0; i--) {
            let weights_deltas = Matrix.mult(
                this.gradients[i],
                Matrix.transpose(this.Layers[i].layer)
            );

            if (options.dropout !== undefined) {
                weights_deltas = weights_deltas.mult(this.dropout[i]);
            }

            this.weights[i].add(weights_deltas);
            this.biases[i].add(this.gradients[i]);

            let weights_t = Matrix.transpose(this.weights[i]);
            this.errors[i - 1] = Matrix.mult(weights_t, this.errors[i]);
            this.gradients[i - 1] = Matrix.map(this.Layers[i].layer, this.Layers[i].actfunc_d)
                .mult(this.errors[i - 1])
                .mult(this.learningRate);
        }

        let i_t = Matrix.transpose(this.Layers[0].layer);
        let weights_deltas = Matrix.mult(this.gradients[0], i_t);

        if (options.dropout !== undefined) {
            weights_deltas = weights_deltas.mult(this.dropout[0]);
        }

        this.weights[0].add(weights_deltas);
        this.biases[0].add(this.gradients[0]);

        this.loss = this.lossfunc(this.outs, target, this.percentile);

        if (options.log === true) {
            this.print('Prediction: ');
            this.print(this.outs, options.table);
            this.print('target: ');
            this.print(target, options.table);
            this.print(`Loss: ${this.loss}`);
        }
    };

    train(generations, dataset, options) {
        dataset.forEach(e => {
            if (!e.input) {
                NetworkError.error(`Dataset missing (.input) property.`, 'NeuralNetwork.train');
                return;
            }
            if (!e.target === undefined) {
                NetworkError.error(`Dataset missing (.target) property.`, 'NeuralNetwork.train');
                return;
            }
        })

        for (this.epoch; this.epoch < generations; this.epoch++) {
            dataset.forEach(e => {
                this.backpropagate(e.input, e.target, options);
            })
        }
    };

    mapWeights(f) {
        if (typeof f === 'function') {
            for (let i = 0; i < this.weights.length; i++) {
                this.weights[i].map(f);
            }
        } else {
            NetworkError.error('Argument must be a function', 'NeuralNetwork.mapWeights');
        }
    };

    log(options = this.logDefaults()) {
        let decimals = 1000;
        if (options.decimals > 21) {
            NetworkError.error('Maximum number of decimals is 21.', 'NeuralNetwork.log');
            decimals = pow(10, 21);
        } else {
            decimals = pow(10, options.decimals) || decimals;
        }

        if (options.details) {
            let v = options.details;
            options.gradients = v;
            options.weights = v;
            options.errors = v;
            options.biases = v;
            options.struct = v;
            options.misc = v;
            options.layers = v;
        }

        if (this.weights.length === 0) {
            this.makeWeights();
        }
        if (options.struct) {
            console.log('🧠 Network:');
            console.log('Layers:');

            this.Layers.forEach((e, i) => {
                console.log(`\t${i ? 'output Layer:' : 'input Layer:'}\t${e.size}\t${i ? `(${e.actname})` : ''}`)
                if (options.layers) console.log(this.Layers[i]);
            })
        }
        if (options.weights) {
            console.log('Weights:');
            this.weights.forEach(e => e.log({ decimals: options.decimals, table: options.table }))
        }
        if (options.biases) {
            console.log('Biases:');
            this.biases.forEach(e => e.log({ decimals: options.decimals, table: options.table }))
        }
        if (options.errors) {
            console.log('Errors:');
            this.errors.forEach(e => e.log({ decimals: options.decimals, table: options.table }))
        }
        if (options.gradients) {
            console.log('Gradients:');
            this.gradients.forEach(e => e.log({ decimals: options.decimals, table: options.table }))
        }
        if (options.misc) {
            console.log('Other Values: ');
            console.log(`\tLearning rate:\t${this.learningRate}`);
            console.log(`\tLoss Function:\t${this.lossfunc_s}`);
            console.log(`\tCurrent Epoch:\t${(this.epoch).toLocaleString()}`);
            console.log(`\tLatest Loss:\t${this.loss}`);
            this.print(`---------------------------`);
        }
        console.log('\n');
        return;
    };

    print(v, option = false) {
        if (option) {
            console.table(v);
        } else {
            console.log(v);
        }
    };

    checkLearningRate() {
        if (!isNumber(this.learningRate)) {
            NetworkError.error('The learning rate specified (.learningRate property) is not a number.', 'NeuralNetwork.backpropagate');
            return false;
        } else {
            if (this.learningRate >= 1) {
                NetworkError.error('The learning rate specified is greater or equal to 1', 'NeuralNetwork.backpropagate');
                return false;
            }
        }
        return true;
    };


    fromJSON(data) {
        this.i = data.architecture[0];
        this.o = data.architecture[data.architecture.length - 1];
        this.inputs = new Matrix(this.i, 1);
        this.outputs = new Matrix(this.o, 1);
        data.layers.map((e, i) => this.Layers[i] = new Layer(e.type, e.size, e.actname))
        this.makeWeights();

        data.weights.map((e, i) => this.weights[i].set(e))
        data.biases.map((e, i) => this.biases[i].set(e))
        data.errors.map((e, i) => this.errors[i].set(e))
        data.gradients.map((e, i) => this.gradients[i].set(e))

        this.lossfunc = lossfuncs.mse;
        this.lossfunc_s = data.lossFunction;
        this.outs = Matrix.toArray(this.Layers[this.Layers.length - 1].layer);
        this.loss = data.latestLoss;
        this.learningRate = data.learningRate;
        this.architecture = data.architecture;
        this.epoch = data.epoch;
        this.percentile = data.percentile;
        return this;
    }

    toJSON() {
        return {
            architecture: this.architecture,
            epoch: this.epoch,
            learningRate: this.learningRate,
            lossFunction: this.lossfunc_s,
            latestLoss: this.loss,
            percentile: this.percentile,
            layers: this.Layers.map(e => e),
            weights: this.weights.map(e => e.matrix),
            biases: this.biases.map(e => e.matrix),
            gradients: this.gradients.map(e => e.matrix),
            errors: this.errors.map(e => e.matrix),
        };
    };

    static createFromJSON(JSON, options) {
        const model = new NeuralNetwork();
        model.fromJSON(JSON);
        if (options) {
            console.log('Network created from JSON', JSON)
        }
        return model;
    }

    downloadNetwork(title = 'Neural Network') {
        download(title, JSON.stringify(this.toJSON()))
    }

    // Neural Evolution

    copy() {
        return NeuralNetwork.createFromJSON(this.toJSON());
    }

    mutateAdd(randomFactor) {
        if (typeof randomFactor !== 'number') {
            NetworkError.error('randomFactor argument must be a number.', 'NeuralNetwork.mutateAdd');
            return;
        } else {
            for (let i = 0; i < this.weights.length; i++) {
                this.weights[i].addPercent(randomFactor);
            }
        }
    };

    mutateRandom(range, probability) {
        if (typeof range !== 'number') {
            NetworkError.error('Range argument must be a number.', 'NeuralNetwork.mutateRandom');
            return;
        }
        if (probability !== undefined) {
            if (typeof probability !== 'number') {
                NetworkError.error('Probability argument must be a number.', 'NeuralNetwork.mutateRandom');
                return;
            }
        } else {
            probability = 1;
        }
        for (let i = 0; i < this.weights.length; i++) {
            this.weights[i].addRandom(range, probability);
        }
    };

    static mergeNetworks(a, b) {
        if (!(a instanceof NeuralNetwork || b instanceof NeuralNetwork)) {
            NetworkError.error('Inputs must be Neural networrk objects.', 'NeuralNetwork.mergeNetworks');
            return;
        }

        const model = a.copy();

        for (let i = 0; i < model.weights.length; i++) {
            model.weights[i] = Matrix.merge(a.weights[i], b.weights[i])
        }
        for (let i = 0; i < model.biases.length; i++) {
            model.biases[i] = Matrix.merge(a.biases[i], b.biases[i])
        }

        return model
    };


    // P5js visualisation

    show(scaler = 1, x = width, y = 20) {
        let xPointer = x;
        let yPointer = y;
        let maxHeight = 0;

        this.Layers.forEach(e => maxHeight = e.size > maxHeight ? e.size : maxHeight)

        maxHeight *= (30 * scaler);

        let neurons = [];

        for (let i = this.Layers.length - 1; i > -1; i--) {
            xPointer = xPointer - (75 * scaler);
            yPointer = y;
            let pointLayer = []
            let layer = this.Layers[i]
            let increment = maxHeight / (layer.size + 1)

            for (let j = 0; j < layer.size; j++) {
                pointLayer.push(createVector(xPointer, yPointer + increment))
                yPointer += increment;
            }
            neurons.push(pointLayer)
        }

        neurons.reverse()

        const weights = this.weights.map(e => e.matrix);

        for (let i = 0; i < neurons.length; i++) {
            for (let j = 0; j < neurons[i].length; j++) {
                let n = neurons[i][j]
                if (i < neurons.length - 1) {
                    neurons[i + 1].forEach((e, f) => {
                        push()
                        let weight = weights[i][f][j]
                        stroke(weight > 0 ? 255 : 0)
                        strokeWeight(weight)
                        line(n.x, n.y, e.x, e.y)
                        pop()
                    })
                }
                ellipse(n.x, n.y, 6 * scaler, 6 * scaler)
            }
        }
    }
}

const download = (title, data) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(data);
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', title + '.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}