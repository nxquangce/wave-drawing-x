import store from '@/store';
import { Options, Vue } from 'vue-class-component';

export class JsonTextBoxTs extends Vue {
    xWaveDrawingJson = JSON.stringify(store.state.waveDesJson, undefined, 4);

    onJsonStringChange() {
        const preJson = { ...store.state.waveDesJson };

        const ugly = (document.getElementById('waveJson') as any).value;
        const obj = JSON.parse(ugly);
        const pretty = JSON.stringify(obj, undefined, 4);
        (document.getElementById('waveJson') as any).value = pretty;

        try {
            store.state.waveDesJson = JSON.parse(this.xWaveDrawingJson);
        }
        catch {
            store.state.waveDesJson = preJson;
        }
        store.commit('drawFromJson');
    }
}