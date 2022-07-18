const urlTree = [

    {
        baseURL: 'NeuralNetwork',
        extension: 'js',
        endpoint: [
            'math',
            'neuralNetwork',
            'population',
        ]
    },
    {
        baseURL: 'js/class',
        extension: 'js',
        endpoint: [
            'ray',
            'boundary',
            'car',
            'raceTrack',
        ]
    },
    {
        baseURL: 'js/script',
        extension: 'js',
        endpoint: [
            'main'
        ]
    }
]

urlTree.forEach(e => {
    e.endpoint.forEach(endpoint => {
        var script = document.createElement('script')
        script.src = `${e.baseURL}/${endpoint}.${e.extension}`
        document.head.appendChild(script)
    })
})
