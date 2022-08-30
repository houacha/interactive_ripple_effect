// Type definitions for [interactive_raindrop_ripple -v 1.0.1]
// Project: [interactive_raindrop_ripple]
// Definitions by: [Houa Cha] <[https://github.com/houacha]>


export function createCanvas(parent?: HTMLElement): Canvas;
export default exportObj;
declare class Canvas {
    /**
     * @param {Element} canvas
     */
    constructor(canvas: Element);
    canvas: Element;
    ctx: any;
    /**
* @type {Ripple[]}
*/
    rippleArr: Ripple[];
    rain: {
        amount: number;
        rain: boolean;
        Amount: number;
        Rain: boolean;
    };
    setRain(amount?: never, raining?: boolean): {
        amount: number;
        raining: boolean;
    };
    fps(): number;
    stopAnim(): void;
}
declare namespace exportObj {
    export { createCanvas };
}
declare class Ripple {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} [velocity]
     * @param {string} [type]
     */
    constructor(x: number, y: number, velocity?: number, type?: string);
    x: number;
    y: number;
    velocity: number;
    radius: number;
    lW: number;
    outerStop: number;
    type: string;
    drawBool: boolean;
    thickestR: number;
    draw(ctx: {
        beginPath: () => void;
        arc: (arg0: number, arg1: number, arg2: number, arg3: number, arg4: number) => void;
        createRadialGradient: (arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number) => any;
        strokeStyle: any;
        lineWidth: number;
        stroke: () => void;
    }): void;
}