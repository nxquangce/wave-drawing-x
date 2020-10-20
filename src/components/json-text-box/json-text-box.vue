<template>
<textarea id="waveJson" v-model="xWaveDrawingJson" @input="onJsonStringChange()"></textarea>
</template>

<script lang="ts">
import { JsonTextBoxTs } from "./json-text-box";
import "./json-text-box.scss";
export default class JsonTextBox extends JsonTextBoxTs {}
</script>