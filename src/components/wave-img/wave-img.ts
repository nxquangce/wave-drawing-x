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
    GAP_TRANSIT_LOW,
    GAP_CLOCK_POS_IDEAL,
    GAP_CLOCK_NEG_IDEAL,
    GAP_CLOCK_POS,
    GAP_CLOCK_NEG,
    GAP_HIGH,
    GAP_LOW
}

enum GeneralSignalType {
    CLK = 'clk',
    CUSTOM = 'custom',
    GAP = 'gap',
    BUS = 'bus'
}

export class WaveImageTs extends Vue {

    wave: Svg | undefined;

    baseX = 5;
    baseY = 5;
    padding = 5;
    totalCycle = 16;

    scale = 1;

    cycleAtPointer = {
        x: 0,
        y: 0
    }

    colors = ['#E0FEFE', '#C7CEEA', '#FFDAC1', '#FF9AA2', '#FFFFD8', '#B5EAD7', '#CCCCCC', '#FFFFFF', 'x', '#AA2822', '#D4342D', '#F3DDAC', '#E7BF71', '#C09645',
        '#B8860B', '#FFD700', '#019000', '#2AAF2D', '#81EE96'
    ];

    mounted() {
        this.initRenderSvg();

        store.subscribe((mutation, state) => {
            switch (mutation.type) {
                case 'drawFromJson':
                    this.wave?.remove();
                    this.initRenderSvg();
                    break;
            }
        })
    }

    initRenderSvg() {
        const waveClassName = '#wave-space';
        this.wave = this.initSvg(waveClassName, 1, 1);
        const wave = this.wave;
        const waveJson = store.state.waveDesJson;
        this.drawFromJson(wave, JSON.stringify(waveJson));

        // Find your root SVG element
        const svg = document.querySelector('svg') as SVGSVGElement;
        this.startEventListener(wave, svg);
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

    startEventListener(svgBox: Svg | G, svg: SVGSVGElement) {
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
            this.findGroup(svgBox, this.cycleAtPointer.x, this.cycleAtPointer.y)
        }, false);

        svg.addEventListener('dblclick', (evt) => {
            const loc = cursorPoint(evt);
            console.log('dbclick')
            console.log(loc.x, loc.y);
            console.log(evt.target);
        }, false);
    }

    findGroup(root: Svg | G, cycleX: number, cycleY: number) {
        const signal = root.get(0).get(cycleY + 1);
        const cycle = signal.get(1).get(cycleX);
        (cycle as G).rect(Wave.baseWidth * 2, Wave.baseHeight + Wave.linePadding).fill('#999999')
            .move(this.baseX + cycleX * 2 * Wave.baseWidth, this.baseY + cycleY * (Wave.baseHeight + Wave.linePadding) - Wave.linePadding / 2).back();
        console.log(cycle)
    }

    issueToHandler(event: string, param: {}) {
        switch (event) {
            case 'click': {
                this.changeSignalLevel(param);
                break;
            }
            case 'dbclick': {

                break;
            }
            default: { }
        }
    }

    changeSignalLevel(param: {}) {

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

    calCyclePos(x: number, y: number, baseX: number, baseY: number) {
        const cycleX = parseInt(((x - baseX) / (2 * Wave.baseWidth)).toString());
        const cycleY = parseInt(((y - baseY) / (Wave.baseHeight + Wave.linePadding)).toString());
        return { cycleX, cycleY };
    }

    hover(svg: Svg | G, x: number, y: number) {
        const adjH = 4;
        const { cycleX, cycleY } = this.calCyclePos(x, y, this.baseX, this.baseY);
        this.cycleAtPointer.x = cycleX;
        this.cycleAtPointer.y = cycleY;
        console.log(cycleX, cycleY)
        const boxX = this.baseX + cycleX * 2 * Wave.baseWidth;
        const boxY = this.baseY + cycleY * (Wave.baseHeight + Wave.linePadding);
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
                        const xStart = this.baseX + waveDes.from * (Wave.baseWidth * 2);

                        switch (waveDes.type) {
                            case "clk": {
                                this.drawClk(
                                    signalWaveG,
                                    xStart,
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
                                    xStart,
                                    signalBaseY,
                                    numOfCycle,
                                    parsedType,
                                    waveDes.isIdeal
                                );
                                break;
                            }
                            case 'gap': {
                                const parsedGapType = this.calGapType(signal.wave[waveIndex - 1]);
                                console.log(parsedGapType)
                                this.drawGap(
                                    signalWaveG,
                                    xStart,
                                    signalBaseY,
                                    numOfCycle,
                                    parsedGapType,
                                    waveDes.isIdeal
                                );
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

        this.drawBaseLines(svg, svgHeight / (Wave.baseHeight + Wave.linePadding));
        this.resizeSvg(svg, svgWidth, svgHeight);
    }

    drawBaseLines(svg: Svg | G, numOfSignals: number) {
        for (let i = 0; i <= this.totalCycle; i++)
            Wave.baseLine(svg, this.baseX + i * Wave.baseWidth * 2, this.baseY - Wave.linePadding, numOfSignals);
    }

    wavedromParse(json: any) {
        let xWaveJson: any = {};
        let maxCycle = 0;
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

                maxCycle = ((sigEl.wave?.length ?? 0) > maxCycle) ? sigEl.wave.length : maxCycle;
            }
        });

        this.totalCycle = maxCycle;
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
        const result = before ?
            before.value.toString() + current.value.toString() :
            current.value.toString() + current.value.toString();
        return result;
    }

    calGapType(before: any) {
        switch (before.type) {
            case GeneralSignalType.CUSTOM: {
                return before.value.toString();
            }
            case GeneralSignalType.CLK: {
                let result = before.isPosEdge ? 'p' : 'n';
                result = before.isArrow ? result.toUpperCase() : result;
                result += before.isIdeal ? 'i' : '';
                return result;
            }
            case GeneralSignalType.BUS: {
                return 'b';
            }
        }
    }

    drawCycle(svg: Svg | G, x: number, y: number, numOfCycle: number, type: SignalType, isIdeal: boolean, isArrow: boolean = true) {
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
                case SignalType.GAP_HIGH: {
                    Wave.gapHighCycle(svg, x + i * 2 * Wave.baseWidth, y, '#000000');
                    break;
                }
                case SignalType.GAP_LOW: {
                    Wave.gapLowCycle(svg, x + i * 2 * Wave.baseWidth, y, '#000000');
                    break;
                }
                case SignalType.GAP_CLOCK_POS: {
                    Wave.gapPosClock(svg, x + i * 2 * Wave.baseWidth, y, isArrow, '#000000');
                    break;
                }
                case SignalType.GAP_CLOCK_POS_IDEAL: {
                    Wave.gapPosClockIdeal(svg, x + i * 2 * Wave.baseWidth, y, isArrow, '#000000');
                    break;
                }
                case SignalType.GAP_CLOCK_NEG: {
                    Wave.gapNegClock(svg, x + i * 2 * Wave.baseWidth, y, isArrow, '#000000');
                    break;
                }
                case SignalType.GAP_CLOCK_NEG_IDEAL: {
                    Wave.gapNegClockIdeal(svg, x + i * 2 * Wave.baseWidth, y, isArrow, '#000000');
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

    drawGap(svg: Svg | G, x: number, y: number, numOfCycle: number, typeOfPreCycle: string, isIdeal: boolean) {
        switch (typeOfPreCycle) {
            case '0': {
                this.drawCycle(svg, x, y, numOfCycle, SignalType.GAP_LOW, isIdeal);
                break;
            }
            case '1': {
                this.drawCycle(svg, x, y, numOfCycle, SignalType.GAP_HIGH, isIdeal);
                break;
            }
            case 'P': {
                this.drawCycle(svg, x, y, numOfCycle, SignalType.GAP_CLOCK_POS, false, true);
                break;
            }
            case 'Pi': {
                this.drawCycle(svg, x, y, numOfCycle, SignalType.GAP_CLOCK_POS_IDEAL, true, true);
                break;
            }
            case 'p': {
                this.drawCycle(svg, x, y, numOfCycle, SignalType.GAP_CLOCK_POS, false, false);
                break;
            }
            case 'pi': {
                this.drawCycle(svg, x, y, numOfCycle, SignalType.GAP_CLOCK_POS_IDEAL, true, false);
                break;
            }
            case 'N': {
                this.drawCycle(svg, x, y, numOfCycle, SignalType.GAP_CLOCK_NEG, false, true);
                break;
            }
            case 'Ni': {
                this.drawCycle(svg, x, y, numOfCycle, SignalType.GAP_CLOCK_NEG_IDEAL, true, true);
                break;
            }
            case 'n': {
                this.drawCycle(svg, x, y, numOfCycle, SignalType.GAP_CLOCK_NEG, false, false);
                break;
            }
            case 'ni': {
                this.drawCycle(svg, x, y, numOfCycle, SignalType.GAP_CLOCK_NEG_IDEAL, true, false);
                break;
            }
        }
    }
}