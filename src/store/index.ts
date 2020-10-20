import { createStore } from 'vuex'

export default createStore({
    state: () => ({
        waveDesJson: //'{"signal":[{"name":"clk","wave":"P.....|..."},{"name":"req","wave":"0.1..0|1.0"},{},{"name":"ack","wave":"1.....|01."}]}'
        {
            signal: [
                { name: 'clk', wave: 'P.....|...' },
                { name: 'clk', wave: 'N.....|...' },
                // {name: 'dat', wave: 'x.345x|=.x', data: ['head', 'body', 'tail', 'data']},
                { name: 'req', wave: '0.1..0|1.0' },
                {},
                { name: 'ack', wave: '1.....|01.' }
            ]
        }
    }),
    mutations: {
        drawFromJson() {

        }
    },
    actions: {
    },
    modules: {
    }
})
