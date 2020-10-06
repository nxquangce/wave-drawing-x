import { Options, Vue } from 'vue-class-component';
import { SVG, Svg, G } from '@svgdotjs/svg.js';
import { WaveDrawing as Wave, EdgeType } from '@/lib/wave-drawing';
import store from '@/store';

enum SignalType {
    HIGH,
    LOW,
    TRANSIT_HIGH,
    TRANSIT_LOW,
    GAP_TRANSIT_HIGH,
    GAP_TRANSIT_LOW
}

enum GeneralSignalType {
    CLK = 'clk',
    CUSTOM = 'custom',
    GAP = 'gap'
}

export class WaveImageTs extends Vue {

    baseX = 5;
    baseY = 5;
    padding = 5;
    totalCycle = 16;

    scale = 1;

    colors = ['#E0FEFE', '#C7CEEA', '#FFDAC1', '#FF9AA2', '#FFFFD8', '#B5EAD7', '#CCCCCC', '#FFFFFF', 'x', '#AA2822', '#D4342D', '#F3DDAC', '#E7BF71', '#C09645',
        '#B8860B', '#FFD700', '#019000', '#2AAF2D', '#81EE96'
    ];

    mounted() {
        const waveClassName = '#wave-space';
        const wave = this.initSvg(waveClassName, 1, 1);
        const waveJson = store.state.waveDesJson;
        this.drawFromJson(wave, JSON.stringify(waveJson));

        // Find your root SVG element
        const svg = document.querySelector('svg') as SVGSVGElement;
        this.startEventListener(wave, svg);

        store.subscribe((mutation, state) => {
            switch(mutation.type) {
              case 'drawFromJson':
                this.drawFromJson(wave, JSON.stringify(waveJson));
              break;
            } 
         })
    }

    initSvg(className: string, numOfLane: number, numOfCycle: number) {
        const width = numOfCycle * Wave.baseWidth;
        const height = numOfLane * Wave.baseHeight;
        const wave = SVG().addTo(className).size(width, height);
        wave.viewbox(0, 0, width, height);
        return wave;
    }

    resizeSvg(svg: Svg | G, width: number, height: number) {
        svg.size(width, height);
        svg.viewbox(0, 0, width, height);
    }

    startEventListener(svgBox: Svg, svg: SVGSVGElement) {
        const hoverBox = this.initHoverBox(svgBox);

        // Create an SVGPoint for future math
        const pt = svg.createSVGPoint();

        // Get point in global SVG space
        function cursorPoint(evt: MouseEvent) {
            pt.x = evt.clientX; pt.y = evt.clientY;
            return pt.matrixTransform((svg.getScreenCTM() as DOMMatrix).inverse());
        }

        svg.addEventListener('mousemove', (evt) => {
            const loc = cursorPoint(evt);
            hoverBox.opacity(0.7);
            this.hover(hoverBox, loc.x, loc.y);
        }, false);

        svg.addEventListener('mouseout', (evt) => {
            hoverBox.opacity(0);
        }, false);

        svg.addEventListener('click', (evt) => {
            const loc = cursorPoint(evt);
            console.log(loc.x, loc.y);
        }, false);

        svg.addEventListener('dblclick', (evt) => {
            const loc = cursorPoint(evt);
            console.log('dbclick')
            console.log(loc.x, loc.y);
        }, false);
    }

    findGroup(x: number, y: number) {

    }

    initHoverBox(svg: Svg | G) {
        const boxX = 0;
        const boxY = 0;
        const adjH = 4;
        const box = boxX + ',' + (boxY - adjH) + ' '
            + (boxX + 2 * Wave.baseWidth) + ',' + (boxY - adjH) + ' '
            + (boxX + 2 * Wave.baseWidth) + ',' + (boxY + Wave.baseHeight + adjH) + ' '
            + boxX + ',' + (boxY + Wave.baseHeight + adjH);
        const group = svg.group();
        group.polygon(box).fill({ color: '#a8d1ff', opacity: 0.7 });
        group.opacity(0);
        return group;
    }

    hover(svg: Svg | G, x: number, y: number) {
        const adjH = 4;
        const boxX = this.baseX + parseInt(((x - this.baseX) / (2 * Wave.baseWidth)).toString()) * 2 * Wave.baseWidth;
        const boxY = this.baseY + parseInt(((y - this.baseY) / (Wave.baseHeight + Wave.linePadding)).toString()) * (Wave.baseHeight + Wave.linePadding);
        svg.move(boxX, boxY - adjH);
    }

    drawFromJson(svg: Svg | G, json: string) {
        const wave = this.wavedromParse(JSON.parse(json));
        let numOfGroupSignals: number[] = [];
        let svgWidth = svg.width();
        let svgHeight = svg.height();
        let adjustedWaveJson = wave.groups ? wave : { groups: [{ name: '', signals: wave.signals }] };
        console.log(adjustedWaveJson);
        if (adjustedWaveJson.groups as any[]) {
            this.baseX = 105;
            adjustedWaveJson.groups.forEach((group: any, groupIndex: number) => {
                numOfGroupSignals[groupIndex] = group.signals.length;
                let totalDrawSignals = 0;
                for (let gIdx = 0; gIdx < groupIndex; gIdx++) {
                    totalDrawSignals += numOfGroupSignals[gIdx];
                }
                const baseGroupY = totalDrawSignals * (Wave.baseHeight + Wave.linePadding);
                const groupG = svg.group();
                Wave.text(groupG, this.padding + 25, this.padding + baseGroupY + ((group.signals.length - 1) * (Wave.baseHeight + Wave.linePadding) / 2) + (Wave.baseHeight / 2), group.name, 14);
                group.signals.forEach((signal: any, signalIndex: number) => {
                    const signalLineG = groupG.group();
                    const signalNameG = signalLineG.group();
                    const signalWaveG = signalLineG.group();
                    Wave.text(signalNameG, this.padding + 75, this.padding + baseGroupY + signalIndex * (Wave.baseHeight + Wave.linePadding) + (Wave.baseHeight / 2), signal.name, 14);
                    signal.wave.forEach((waveDes: any, waveIndex: number) => {
                        const numOfCycle = (waveDes.to == 'full') ? (this.totalCycle - waveDes.from) : (waveDes.to - waveDes.from + 1);
                        const signalBaseY = this.baseY + baseGroupY + signalIndex * (Wave.baseHeight + Wave.linePadding);
                        svgHeight = signalBaseY + Wave.baseHeight + Wave.linePadding;
                        svgWidth = this.baseX + this.totalCycle * Wave.baseWidth * 2;

                        switch (waveDes.type) {
                            case "clk": {
                                this.drawClk(
                                    signalWaveG,
                                    this.baseX,
                                    signalBaseY,
                                    numOfCycle,
                                    waveDes.isPosEdge,
                                    waveDes.isIdeal,
                                    waveDes.isArrow
                                );
                                break;
                            }
                            case 'custom': {
                                let beforeWaveIndex = waveIndex - 1 >= 0 ? waveIndex - 1 : waveIndex;
                                if (signal.wave[beforeWaveIndex].type == GeneralSignalType.GAP) beforeWaveIndex -= 1;
                                const parsedType = this.calSignalType(signal.wave[beforeWaveIndex], waveDes);
                                this.drawSignal(
                                    signalWaveG,
                                    this.baseX + waveDes.from * (Wave.baseWidth * 2),
                                    signalBaseY,
                                    numOfCycle,
                                    parsedType,
                                    waveDes.isIdeal
                                );
                                break;
                            }
                            case 'gap': {

                                break;
                            }
                            case null:
                            case undefined: {
                                break;
                            }
                        }
                    });
                })
            });
        }

        this.resizeSvg(svg, svgWidth, svgHeight);
    }

    wavedromParse(json: any) {
        let xWaveJson: any = {};
        json.signal.forEach((sigEl: any) => {
            if (sigEl.constructor === "string".constructor) {
                xWaveJson['name'] = sigEl;
            }
            else if (sigEl.constructor === [].constructor) {
                const xGroupJson = this.wavedromParse(sigEl);
                if (!xWaveJson['groups']) xWaveJson['groups'] = [];
                xWaveJson['groups'].push(xGroupJson);
            }
            else if (sigEl.constructor === ({}).constructor) {
                const xSignalJson = this.wavedromParseSignal(sigEl);
                if (!xWaveJson['signals']) xWaveJson['signals'] = [];
                xWaveJson['signals'].push(xSignalJson);
            }
        });
        return xWaveJson;
    }

    wavedromParseGroup(group: any[]) {
        group.forEach(gEl => {

        });
    }

    wavedromParseSignal(signal: any) {
        const xSignalJson = {
            name: signal.name ? signal.name : '',
            wave: signal.wave ? this.wavedromParseWave(signal.wave) : []
        }
        return xSignalJson;
    }

    wavedromParseWave(wave: string) {
        console.log(wave);
        const cycle = [...wave];
        let xCycleArray: any[] = [];
        cycle.forEach((level, cycleIdx) => {
            switch (level) {
                case 'p': {
                    const xCycleJson = {
                        type: GeneralSignalType.CLK,
                        from: cycleIdx,
                        to: cycleIdx,
                        isPosEdge: true,
                        isIdeal: true,
                        isArrow: false
                    };
                    xCycleArray.push(xCycleJson);
                    break;
                }
                case 'P': {
                    const xCycleJson = {
                        type: GeneralSignalType.CLK,
                        from: cycleIdx,
                        to: cycleIdx,
                        isPosEdge: true,
                        isIdeal: true,
                        isArrow: true
                    };
                    xCycleArray.push(xCycleJson);
                    break;
                }
                case 'n': {
                    const xCycleJson = {
                        type: GeneralSignalType.CLK,
                        from: cycleIdx,
                        to: cycleIdx,
                        isPosEdge: false,
                        isIdeal: true,
                        isArrow: false
                    };
                    xCycleArray.push(xCycleJson);
                    break;
                }
                case 'N': {
                    const xCycleJson = {
                        type: GeneralSignalType.CLK,
                        from: cycleIdx,
                        to: cycleIdx,
                        isPosEdge: false,
                        isIdeal: true,
                        isArrow: true
                    };
                    xCycleArray.push(xCycleJson);
                    break;
                }
                case '.': {
                    let preCycleIndex = xCycleArray.length - 1;
                    if (xCycleArray[preCycleIndex].type == GeneralSignalType.GAP) {
                        preCycleIndex -= 1;
                        const xCycleJson = { ...xCycleArray[preCycleIndex] };
                        xCycleJson.from = cycleIdx;
                        xCycleJson.to = cycleIdx;
                        xCycleArray.push(xCycleJson);
                    }
                    else {
                        xCycleArray[preCycleIndex].to = xCycleArray[preCycleIndex].to + 1;
                    }
                    break;
                }
                case '|': {
                    const xCycleJson = {
                        type: GeneralSignalType.GAP,
                        from: cycleIdx,
                        to: cycleIdx,
                    }
                    xCycleArray.push(xCycleJson);
                    break;
                }
                default: {
                    const xCycleJson = {
                        type: GeneralSignalType.CUSTOM,
                        from: cycleIdx,
                        to: cycleIdx,
                        value: level
                    }
                    xCycleArray.push(xCycleJson);
                    break;
                }
            }
        });
        return xCycleArray;
    }

    drawClk(svg: Svg | G, x: number, y: number, numOfCycle: number, direction: boolean, isIdeal: boolean, isArrow: boolean) {
        let condStr = direction ? '1' : '0';
        condStr += isIdeal ? '1' : '0';
        for (let i = 0; i < numOfCycle; i++) {
            switch (condStr) {
                case '00': {
                    Wave.negClock(svg, x + i * 2 * Wave.baseWidth, y, isArrow);
                    break;
                }
                case '01': {
                    Wave.negClockIdeal(svg, x + i * 2 * Wave.baseWidth, y, isArrow);
                    break;
                }
                case '10': {
                    Wave.posClock(svg, x + i * 2 * Wave.baseWidth, y, isArrow);
                    break;
                }
                case '11': {
                    Wave.posClockIdeal(svg, x + i * 2 * Wave.baseWidth, y, isArrow);
                    break;
                }
                default: {
                    Wave.posClockIdeal(svg, x + i * 2 * Wave.baseWidth, y, true);
                    break;
                }
            }
        }
        return svg;
    }

    calSignalType(before: any, current: any) {
        let result = '';
        if (before) {
            result += before.value.toString() + current.value.toString();
        }
        else {
            result += current.value.toString() + current.value.toString();
        }
        return result;
    }

    drawCycle(svg: Svg | G, x: number, y: number, numOfCycle: number, type: SignalType, isIdeal: boolean) {
        for (let i = 0; i < numOfCycle; i++) {
            switch (type) {
                case SignalType.HIGH: {
                    if (isIdeal)
                        Wave.highIdeal(svg, x + i * 2 * Wave.baseWidth, y);
                    else
                        Wave.highCycle(svg, x + i * 2 * Wave.baseWidth, y);
                    break;
                }
                case SignalType.LOW: {
                    if (isIdeal)
                        Wave.lowIdeal(svg, x + i * 2 * Wave.baseWidth, y);
                    else
                        Wave.lowCycle(svg, x + i * 2 * Wave.baseWidth, y);
                    break;
                }
                case SignalType.TRANSIT_HIGH: {
                    if (isIdeal)
                        Wave.transitHigh(svg, x + i * 2 * Wave.baseWidth, y);
                    else
                        Wave.transitHighCycle(svg, x + i * 2 * Wave.baseWidth, y);
                    break;
                }
                case SignalType.TRANSIT_LOW: {
                    if (isIdeal)
                        Wave.transitLow(svg, x + i * 2 * Wave.baseWidth, y);
                    else
                        Wave.transitLowCycle(svg, x + i * 2 * Wave.baseWidth, y);
                    break;
                }
                case SignalType.GAP_TRANSIT_HIGH: {
                    Wave.gapTransitHighCycle(svg, x + i * 2 * Wave.baseWidth, y, '#000000');
                    break;
                }
                case SignalType.GAP_TRANSIT_LOW: {
                    Wave.gapTransitLowCycle(svg, x + i * 2 * Wave.baseWidth, y, '#000000');
                    break;
                }
            }
        }
    }

    drawSignal(svg: Svg | G, x: number, y: number, numOfCycle: number, type: string, isIdeal: boolean) {
        switch (type) {
            case '00': {
                this.drawCycle(svg, x, y, numOfCycle, SignalType.LOW, isIdeal);
                break;
            }
            case '01': {
                this.drawCycle(svg, x, y, 1, SignalType.TRANSIT_HIGH, isIdeal);
                this.drawCycle(svg, x + (Wave.baseWidth * 2), y, numOfCycle - 1, SignalType.HIGH, isIdeal);
                break;
            }
            case '10': {
                this.drawCycle(svg, x, y, 1, SignalType.TRANSIT_LOW, isIdeal);
                this.drawCycle(svg, x + (Wave.baseWidth * 2), y, numOfCycle - 1, SignalType.LOW, isIdeal);
                break;
            }
            case '11': {
                this.drawCycle(svg, x, y, numOfCycle, SignalType.HIGH, isIdeal);
                break;
            }
        }
    }
}