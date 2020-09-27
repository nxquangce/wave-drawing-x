import { Options, Vue } from 'vue-class-component';
import { SVG, Svg, G } from '@svgdotjs/svg.js';
import { WaveDrawing as Wave, EdgeType } from '@/lib/wave-drawing';

enum SignalType {
    HIGH,
    LOW,
    TRANSIT_HIGH,
    TRANSIT_LOW,
    GAP_TRANSIT_HIGH,
    GAP_TRANSIT_LOW
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
        console.log('wave image created')
        const wave = SVG().addTo('#wave-space').size(1000, 768);
        wave.viewbox(0, 0, 1000, 768);

        const waveJson = {
            groups: [
                {
                    name: 'group 1',
                    signals: [
                        {
                            name: 'clk',
                            wave: [
                                {
                                    type: 'clk',
                                    from: 0,
                                    to: 'full',
                                    isPosEdge: true,
                                    isIdeal: true,
                                    isArrow: true
                                }
                            ]
                        },
                        {
                            name: 'signal 1',
                            wave: [
                                {
                                    type: 'custom',
                                    from: 0,
                                    to: 2,
                                    value: 0
                                },
                                {
                                    from: 3,
                                    to: 5,
                                    value: 1
                                },
                                {
                                    type: 'gap',
                                    from: 6,
                                    to: 6,
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'group 2',
                    signals: [
                        {
                            name: 'clk',
                            wave: [
                                {
                                    type: 'clk',
                                    from: 0,
                                    to: 'full',
                                    isPosEdge: false,
                                    isIdeal: true,
                                    isArrow: true
                                }
                            ]
                        }
                    ]
                }
            ]
        }

        this.drawFromJson(wave, JSON.stringify(waveJson));

        // let group: any[] = [];
        // for (let i = 0; i < 9; i++) {
        //     group[i] = wave.group();
        // }

        // for (let j = 0; j < 16; j++) {
        //     Wave.baseLine(group[0], j * 2 * Wave.baseWidth, 0, 7);
        //     Wave.posClockIdeal(group[1], 2 * j * Wave.baseWidth, 0, true);
        //     Wave.negClockIdeal(group[2], 2 * j * Wave.baseWidth, Wave.baseHeight + Wave.linePadding, true);
        //     Wave.posClock(group[3], 2 * j * Wave.baseWidth, 2 * (Wave.baseHeight + Wave.linePadding), true);
        //     Wave.negClock(group[4], 2 * j * Wave.baseWidth, 3 * (Wave.baseHeight + Wave.linePadding), true);

        //     if (j > 0 && j < 3)
        //         Wave.highCycle(group[5], 2 * j * Wave.baseWidth, 4 * (Wave.baseHeight + Wave.linePadding));
        //     else if (j == 4)
        //         Wave.gapTransitHighCycle(group[5], 2 * j * Wave.baseWidth, 4 * (Wave.baseHeight + Wave.linePadding), '#ffffff')
        //     else if (j == 7)
        //         Wave.gapTransitLowCycle(group[5], 2 * j * Wave.baseWidth, 4 * (Wave.baseHeight + Wave.linePadding), '#ffffff')
        //     else if (j > 6)
        //         Wave.lowCycle(group[5], 2 * j * Wave.baseWidth, 4 * (Wave.baseHeight + Wave.linePadding));
        //     else if (j % 2 == 0)
        //         Wave.transitHighCycle(group[5], 2 * j * Wave.baseWidth, 4 * (Wave.baseHeight + Wave.linePadding));
        //     else
        //         Wave.transitLowCycle(group[5], 2 * j * Wave.baseWidth, 4 * (Wave.baseHeight + Wave.linePadding));

        //     Wave.busCycle(group[6], 2 * j * Wave.baseWidth, 5 * (Wave.baseHeight + Wave.linePadding), this.colors[j], this.colors[j + 1], '0x' + j, 14);
        //     Wave.gapPosClock(group[7], 2 * j * Wave.baseWidth, 6 * (Wave.baseHeight + Wave.linePadding), true, '#ffffff');
        //     Wave.gapNegClock(group[8], 2 * j * Wave.baseWidth, 7 * (Wave.baseHeight + Wave.linePadding), true, '#ffffff');
        // }

        const hoverBox = this.initHoverBox(wave);

        // Find your root SVG element
        const svg = document.querySelector('svg') as SVGSVGElement;
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
        const wave = JSON.parse(json);
        let numOfGroupSignals: number[] = [];
        if (wave.groups as any[]) {
            this.baseX = 105;
            wave.groups.forEach((group: any, groupIndex: number) => {
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
                        switch (waveDes.type) {
                            case "clk": {
                                this.drawClk(
                                    signalWaveG,
                                    this.baseX,
                                    this.baseY + baseGroupY + signalIndex * (Wave.baseHeight + Wave.linePadding),
                                    numOfCycle,
                                    waveDes.isPosEdge,
                                    waveDes.isIdeal,
                                    waveDes.isArrow
                                );
                                break;
                            }
                            case 'custom':
                            case undefined:
                            case null: {
                                const parsedType = this.calSignalType(signal.wave[waveIndex - 1], waveDes);
                                this.drawSignal(
                                    signalWaveG,
                                    this.baseX + waveDes.from * (Wave.baseWidth * 2),
                                    this.baseY + baseGroupY + signalIndex * (Wave.baseHeight + Wave.linePadding),
                                    numOfCycle,
                                    parsedType,
                                    waveDes.isIdeal
                                );
                                break;
                            }
                            case 'gap': {

                                break;
                            }
                        }
                    });
                })
            });
        }
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