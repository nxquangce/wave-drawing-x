<template>
  <div id="wave-img">
    <div class="title-row">
        <div class="title-tab">Wavegen</div>
    </div>
    <div class="wave-container">
      <div id="wave-space"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { WaveImageTs } from "./wave-img";
import "./wave-img.scss";
export default class WaveImage extends WaveImageTs {}
</script>