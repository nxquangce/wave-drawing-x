import { SVG, Svg, G } from '@svgdotjs/svg.js';

export enum EdgeType {
    RISING,
    FALLING
}

export class WaveDrawing {
    public static baseHeight = 30;
    public static baseWidth = 35;
    public static strokeWidth = 1;
    public static linePadding = 15;
    public static transitionWidth = 4;

    public static arrowUpIdeal(svg: Svg | G, x: number, y: number) {
        const sizeH = 7;
        const sizeW = 3;
        const posString = x + ',' + y + ' ' + (x - sizeW) + ',' + (y + sizeH) + ' ' + (x + sizeW) + ',' + (y + sizeH);
        return svg.polygon(posString).fill('#000000');
    }

    public static arrowUp(svg: Svg | G, x: number, y: number) {
        const sizeH = 7;
        const sizeW = 3;
        const angle = Math.atan((this.transitionWidth) / (this.baseHeight / 2)) * 180 / Math.PI;
        const offsetY = this.baseHeight / 2 - (this.baseHeight / 2 * Math.cos(angle * Math.PI / 180));
        const offsetX = ((this.transitionWidth) / (this.baseHeight / 2)) * offsetY;
        const posString = x + ',' + y + ' ' + (x - sizeW) + ',' + (y + sizeH) + ' ' + (x + sizeW) + ',' + (y + sizeH);
        return svg.polygon(posString).fill('#000000').rotate(angle, x, y + this.baseHeight / 2).translate(offsetX, - offsetY);
    }

    public static arrowDownIdeal(svg: Svg | G, x: number, y: number) {
        const sizeH = 7;
        const sizeW = 3;
        const posString = x + ',' + y + ' ' + (x - sizeW) + ',' + (y - sizeH) + ' ' + (x + sizeW) + ',' + (y - sizeH);
        return svg.polygon(posString).fill('#000000');
    }

    public static arrowDown(svg: Svg | G, x: number, y: number) {
        const sizeH = 7;
        const sizeW = 3;
        const angle = - Math.atan(this.transitionWidth / (this.baseHeight / 2)) * 180 / Math.PI;
        const offsetY = this.baseHeight / 2 - (this.baseHeight / 2 * Math.cos(angle * Math.PI / 180));
        const offsetX = ((this.transitionWidth) / (this.baseHeight / 2)) * offsetY;
        const posString = x + ',' + y + ' ' + (x - sizeW) + ',' + (y - sizeH) + ' ' + (x + sizeW) + ',' + (y - sizeH);
        return svg.polygon(posString).fill('#000000').rotate(angle, x, y - this.baseHeight / 2).translate(offsetX, offsetY);
    }

    public static baseLine(svg: Svg | G, x: number, y: number, numOfLine: number) {
        return svg.line(x, y - this.linePadding / 2, x, y + numOfLine * (this.baseHeight + this.linePadding) + this.linePadding)
            .stroke({ width: 0.5, dasharray: '1, 3', color: '#000000' });
    }

    public static edgeIdeal(svg: Svg | G, x: number, y: number, arrow: boolean = false, arrowDirection?: EdgeType) {
        const edge = svg.line(x, y, x, y + this.baseHeight).stroke({ width: this.strokeWidth, color: '#000000' });
        if (arrow && (arrowDirection == EdgeType.RISING))
            this.arrowUpIdeal(svg, x, y);
        else if (arrow && (arrowDirection == EdgeType.FALLING))
            this.arrowDownIdeal(svg, x, y + this.baseHeight)
        return svg;
    }

    public static edgeRising(svg: Svg | G, x: number, y: number, arrow: boolean = false) {
        svg.line(x + this.transitionWidth, y, x - this.transitionWidth, y + this.baseHeight).stroke({ width: this.strokeWidth, color: '#000000' });
        if (arrow)
            this.arrowUp(svg, x, y);
        return svg;
    }

    public static edgeFalling(svg: Svg | G, x: number, y: number, arrow: boolean = false) {
        svg.line(x - this.transitionWidth, y, x + this.transitionWidth, y + this.baseHeight).stroke({ width: this.strokeWidth, color: '#000000' });
        if (arrow)
            this.arrowDown(svg, x, y + this.baseHeight);
        return svg;
    }

    public static highIdeal(svg: Svg | G, x: number, y: number) {
        const adjW = this.strokeWidth / 2;
        return svg.line(x - adjW, y, x + this.baseWidth + adjW, y).stroke({ width: this.strokeWidth, color: '#000000' });
    }

    public static high(svg: Svg | G, x: number, y: number) {
        const adjW = this.strokeWidth / 2;
        return svg.line(x + this.transitionWidth - adjW, y, x + this.baseWidth - this.transitionWidth + adjW, y).stroke({ width: this.strokeWidth, color: '#000000' });
    }

    public static lowIdeal(svg: Svg | G, x: number, y: number) {
        const adjW = this.strokeWidth / 2;
        return svg.line(x - adjW, y + this.baseHeight, x + this.baseWidth + adjW, y + this.baseHeight).stroke({ width: this.strokeWidth, color: '#000000' });
    }

    public static low(svg: Svg | G, x: number, y: number) {
        const adjW = this.strokeWidth / 2;
        return svg.line(x + this.transitionWidth - adjW, y + this.baseHeight, x + this.baseWidth - this.transitionWidth + adjW, y + this.baseHeight).stroke({ width: this.strokeWidth, color: '#000000' });
    }

    public static posClockIdeal(svg: Svg | G, x: number, y: number, arrow: boolean = false) {
        const group = svg.group();
        this.edgeIdeal(group, x, y, arrow, EdgeType.RISING);
        this.highIdeal(group, x, y);
        this.edgeIdeal(group, x + this.baseWidth, y, false);
        this.lowIdeal(group, x + this.baseWidth, y);
    }

    public static negClockIdeal(svg: Svg | G, x: number, y: number, arrow: boolean = false) {
        const group = svg.group();
        this.edgeIdeal(group, x, y, arrow, EdgeType.FALLING);
        this.lowIdeal(group, x, y);
        this.edgeIdeal(group, x + this.baseWidth, y, false);
        this.highIdeal(group, x + this.baseWidth, y);
    }

    public static posClock(svg: Svg | G, x: number, y: number, arrow: boolean = false) {
        const group = svg.group();
        this.edgeRising(group, x, y, arrow);
        this.high(group, x, y);
        this.edgeFalling(group, x + this.baseWidth, y, false);
        this.low(group, x + this.baseWidth, y);
    }

    public static negClock(svg: Svg | G, x: number, y: number, arrow: boolean = false) {
        const group = svg.group();
        this.edgeFalling(group, x, y, arrow);
        this.low(group, x, y);
        this.edgeRising(group, x + this.baseWidth, y, false);
        this.high(group, x + this.baseWidth, y);
    }

    public static transitHigh(svg: Svg | G, x: number, y: number) {
        const startTransit = 2;
        const adjW = this.strokeWidth / 2;
        svg.line(x, y + this.baseHeight, x + startTransit + adjW, y + this.baseHeight).stroke({ width: this.strokeWidth, color: '#000000' });
        this.edgeRising(svg, x + startTransit + this.transitionWidth, y, false);
    }

    public static transitLow(svg: Svg | G, x: number, y: number) {
        const startTransit = 2;
        const adjW = this.strokeWidth / 2;
        svg.line(x, y, x + startTransit + adjW, y).stroke({ width: this.strokeWidth, color: '#000000' });
        this.edgeFalling(svg, x + startTransit + this.transitionWidth, y, false);
    }

    public static transitHighCycle(svg: Svg | G, x: number, y: number) {
        const startTransit = 2;
        const adjW = this.strokeWidth / 2;
        const group = svg.group();
        this.transitHigh(group, x, y);
        group.line(x + startTransit + 2 * this.transitionWidth - adjW, y, x + 2 * this.baseWidth + adjW, y).stroke({ width: this.strokeWidth, color: '#000000' });
        return group;
    }

    public static highCycle(svg: Svg | G, x: number, y: number) {
        const group = svg.group();
        group.line(x, y, x + 2 * this.baseWidth, y).stroke({ width: this.strokeWidth, color: '#000000' });
        return group;
    }

    public static transitLowCycle(svg: Svg | G, x: number, y: number) {
        const startTransit = 2;
        const adjW = this.strokeWidth / 2;
        const group = svg.group();
        this.transitLow(group, x, y);
        group.line(x + startTransit + 2 * this.transitionWidth - adjW, y + this.baseHeight, x + 2 * this.baseWidth + adjW, y + this.baseHeight).stroke({ width: this.strokeWidth, color: '#000000' });
        return group;
    }

    public static lowCycle(svg: Svg | G, x: number, y: number) {
        const group = svg.group();
        group.line(x, y + this.baseHeight, x + 2 * this.baseWidth, y + this.baseHeight).stroke({ width: this.strokeWidth, color: '#000000' });
        return group;
    }

    public static busCycle(svg: Svg | G, x: number, y: number, previousColor: string, currentColor: string, value: string, textSize: number) {
        const startTransit = 2;
        const group = svg.group();
        const previousPart = 'M' + x + ',' + y + ' L '
            + (x + startTransit) + ',' + y + ' '
            + (x + startTransit + this.transitionWidth / 2) + ',' + (y + this.baseHeight / 2) + ' '
            + (x + startTransit) + ',' + (y + this.baseHeight) + ' '
            + x + ',' + (y + this.baseHeight);
        const currentPart = 'M' + (x + 2 * this.baseWidth) + ',' + y + ' L '
            + (x + startTransit + this.transitionWidth) + ',' + y + ' '
            + (x + startTransit + this.transitionWidth / 2) + ',' + (y + this.baseHeight / 2) + ' '
            + (x + startTransit + this.transitionWidth) + ',' + (y + this.baseHeight) + ' '
            + (x + 2 * this.baseWidth) + ',' + (y + this.baseHeight);

        const xPattern = group.pattern(20, 20, function (add) {
            add.line(20, 0, 0, 20).stroke({ width: 1, color: '#000000' });
            add.line(10, 0, 0, 10).stroke({ width: 1, color: '#000000' });
            add.line(20, 10, 10, 20).stroke({ width: 1, color: '#000000' });
        });

        const pColor = previousColor == 'x' ? xPattern : previousColor;
        const cColor = currentColor == 'x' ? xPattern : currentColor;

        group.path(previousPart).stroke({ width: this.strokeWidth, color: '#000000' }).fill(pColor as string);
        group.path(currentPart).stroke({ width: this.strokeWidth, color: '#000000' }).fill(cColor as string);
        group.text(value)
            .x(x + startTransit + this.transitionWidth / 2 + this.baseWidth)
            .y(y + this.baseHeight / 2 - textSize / 2)
            .font({ size: textSize, anchor: 'middle' });
        return group;
    }

    public static doubleCurve(svg: Svg | G, x: number, y: number, strokeColor: string = 'none') {
        const curveWidth = 4;
        const stretchHeight = 4;
        const x1 = x - 2;
        const x2 = x + 2;
        const curve1 = 'M ' + (x1 + curveWidth) + ',' + (y - stretchHeight) + ' Q '
            + (x1 + curveWidth / 2) + ',' + (y + 1 - stretchHeight) + ' '
            + x1 + ',' + (y + this.baseHeight / 2) + ' '
            + (x1 - curveWidth / 2) + ',' + (y + this.baseHeight - 1 + stretchHeight) + ' '
            + (x1 - curveWidth) + ',' + (y + this.baseHeight + stretchHeight);
        const curve2 = 'M ' + (x2 + curveWidth) + ',' + (y - stretchHeight) + ' Q '
            + (x2 + curveWidth / 2) + ',' + (y + 1 - stretchHeight) + ' '
            + x2 + ',' + (y + this.baseHeight / 2) + ' '
            + (x2 - curveWidth / 2) + ',' + (y + this.baseHeight - 1 + stretchHeight) + ' '
            + (x2 - curveWidth) + ',' + (y + this.baseHeight + stretchHeight);
        const curveSpace = 'M ' + (x1 + curveWidth) + ',' + (y - stretchHeight) + ' Q '
            + (x1 + curveWidth / 2) + ',' + (y + 1 - stretchHeight) + ' '
            + x1 + ',' + (y + this.baseHeight / 2) + ' '
            + (x1 - curveWidth / 2) + ',' + (y + this.baseHeight - 1 + stretchHeight) + ' '
            + (x1 - curveWidth) + ',' + (y + this.baseHeight + stretchHeight) + ' L '
            + (x2 - curveWidth) + ',' + (y + this.baseHeight + stretchHeight) + ' Q '
            + (x2 - curveWidth / 2) + ',' + (y + this.baseHeight - 1 + stretchHeight) + ' '
            + x2 + ',' + (y + this.baseHeight / 2) + ' '
            + (x2 + curveWidth / 2) + ',' + (y + 1 - stretchHeight) + ' '
            + (x2 + curveWidth) + ',' + (y - stretchHeight);
        svg.path(curveSpace).stroke('none').fill('none');
        svg.path(curve1).stroke({ width: this.strokeWidth, color: strokeColor }).fill('none');
        svg.path(curve2).stroke({ width: this.strokeWidth, color: strokeColor }).fill('none');
    }

    public static gapPosClockIdeal(svg: Svg | G, x: number, y: number, arrow: boolean = false) {
        const group = svg.group();
        this.edgeIdeal(group, x, y, arrow, EdgeType.RISING);
        this.highIdeal(group, x, y);
        this.doubleCurve(group, x + this.baseWidth, y);
        this.lowIdeal(group, x + this.baseWidth, y);
    }

    public static gapNegClockIdeal(svg: Svg | G, x: number, y: number, arrow: boolean = false) {
        const group = svg.group();
        this.edgeIdeal(group, x, y, arrow, EdgeType.FALLING);
        this.highIdeal(group, x, y);
        this.doubleCurve(group, x + this.baseWidth, y);
        this.lowIdeal(group, x + this.baseWidth, y);
    }

    public static gapPosClock(svg: Svg | G, x: number, y: number, arrow: boolean = false, strokeColor: string = '#000000') {
        const group = svg.group();
        this.edgeRising(group, x, y, arrow);
        this.high(group, x, y);
        this.edgeFalling(group, x + this.baseWidth, y, false);
        this.doubleCurve(group, x + this.baseWidth, y, strokeColor);
        this.low(group, x + this.baseWidth, y);
    }

    public static gapNegClock(svg: Svg | G, x: number, y: number, arrow: boolean = false, strokeColor: string = '#000000') {
        const group = svg.group();
        this.edgeFalling(group, x, y, arrow);
        this.low(group, x, y);
        this.edgeRising(group, x + this.baseWidth, y, false);
        this.doubleCurve(group, x + this.baseWidth, y, strokeColor);
        this.high(group, x + this.baseWidth, y);
    }

    public static gapHighCycle(svg: Svg | G, x: number, y: number, strokeColor: string) {
        const startTransit = 2;
        const group = svg.group();
        this.highCycle(group, x, y);
        this.doubleCurve(group, x + this.baseWidth + startTransit + this.transitionWidth, y, strokeColor)
        return group;
    }

    public static gapLowCycle(svg: Svg | G, x: number, y: number, strokeColor: string) {
        const startTransit = 2;
        const group = svg.group();
        this.lowCycle(group, x, y);
        this.doubleCurve(group, x + this.baseWidth + startTransit + this.transitionWidth, y, strokeColor)
        return group;
    }

    public static gapTransitHighCycle(svg: Svg | G, x: number, y: number, fillColor: string) {
        const startTransit = 2;
        const adjW = this.strokeWidth / 2;
        const group = svg.group();
        this.transitHigh(group, x, y);
        group.line(x + startTransit + 2 * this.transitionWidth - adjW, y, x + 2 * this.baseWidth + adjW, y).stroke({ width: this.strokeWidth, color: '#000000' });
        this.doubleCurve(group, x + this.baseWidth + startTransit + this.transitionWidth, y, fillColor)
        return group;
    }

    public static gapTransitLowCycle(svg: Svg | G, x: number, y: number, fillColor: string) {
        const startTransit = 2;
        const adjW = this.strokeWidth / 2;
        const group = svg.group();
        this.transitLow(group, x, y);
        group.line(x + startTransit + 2 * this.transitionWidth - adjW, y + this.baseHeight, x + 2 * this.baseWidth + adjW, y + this.baseHeight)
            .stroke({ width: this.strokeWidth, color: '#000000' });
        this.doubleCurve(group, x + this.baseWidth + startTransit + this.transitionWidth, y, fillColor)
        return group;
    }

    public static text(svg: Svg | G, x: number, y: number, value: string, textSize: number) {
        svg.text(value)
            .x(x)
            .y(y)
            .font({ size: textSize, anchor: 'middle' });
        return svg;
    }
}