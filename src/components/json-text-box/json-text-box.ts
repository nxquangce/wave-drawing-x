import store from '@/store';
import { Options, Vue } from 'vue-class-component';

export class JsonTextBoxTs extends Vue {
    xWaveDrawingJson = JSON.stringify(store.state.waveDesJson);
}