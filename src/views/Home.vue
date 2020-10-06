<template>
  <div class="home">
    <div class="header">
      <Header></Header>
    </div>

    <div class="container">
      <div class="main-col">
        <div class="row img-row">
          <WaveImage></WaveImage>
        </div>
        <div class="row">
          <div class="btn-row">
            <div class="btn inline">
              <span class="material-icons">playlist_add</span> Add signal
            </div>
            <div class="btn inline">
              <span class="material-icons">access_time</span> Add cycle
            </div>
            <div class="btn inline" v-on:click="draw"> Render</div>
          </div>
        </div>
        <div class="row text-row">
            <JsonTextBox></JsonTextBox>
        </div>
      </div>
      <div class="side-col"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Header from "@/components/header/header.vue"; // @ is an alias to /src
import WaveImage from "@/components/wave-img/wave-img.vue";
import JsonTextBox from "@/components/json-text-box/json-text-box.vue";
import store from '@/store';

@Options({
  components: {
    Header,
    WaveImage,
    JsonTextBox,
  },
})
export default class Home extends Vue {
    draw() {
        store.commit('drawFromJson');
    }
}
</script>

<style lang="scss">
.header {
    top: 0;
    width: 100%;
    height: 50px;
}

.container {
    width: 100%;
    height: calc(100vh - 50px);

    .main-col {
        width: 80%;
        height: 100%;
        max-width: calc(100% - 300px);

        .img-row {
            height: 50%;
        }

        .btn-row {
            height: 10%;
        }

        .text-row {
            height: 40%;
            overflow-x: scroll;
            overflow-y: scroll;
        }
    }

    .side-col {
        width: 20%;
        max-width: 300px;
    }

    .row {
        width: 100%;
    }
}
</style>
