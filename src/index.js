"use strict";

function setStyle() {
  const canvases = document.getElementsByClassName("ripple-effect-body");
  for (let canvas of canvases) {
    // @ts-ignore
    canvas.style.position = "absolute";
    // @ts-ignore
    canvas.style.top = 0;
    // @ts-ignore
    canvas.style.left = 0;
    canvas.parentElement.style.position = "relative";
  }
}

function setSize() {
  const canvases = document.getElementsByClassName("ripple-effect-body");
  for (let canvas of canvases) {
    var marginTB = 0,
      marginLR = 0;
    if (canvas.parentElement.tagName === "BODY") {
      var styles = getComputedStyle(canvas.parentElement);
      marginTB =
        parseFloat(styles["marginTop"]) + parseFloat(styles["marginBottom"]);
      marginLR =
        parseFloat(styles["marginLeft"]) + parseFloat(styles["marginRight"]);
    }
    if (canvas.tagName === "CANVAS") {
      // @ts-ignore
      canvas.height = canvas.parentElement.offsetHeight + marginTB;
      // @ts-ignore
      canvas.width = canvas.parentElement.offsetWidth + marginLR;
    }
  }
}

const isRequired = () => {
  throw new Error("param is required");
};

const isNode = (/** @type {HTMLElement} */ o) => {
  return typeof Node === "object"
    ? o instanceof Node
    : o &&
        typeof o === "object" &&
        typeof o.nodeType === "number" &&
        typeof o.nodeName === "string";
};

const isElement = (/** @type {HTMLElement} */ o) => {
  return typeof HTMLElement === "object"
    ? o instanceof HTMLElement
    : o &&
        typeof o === "object" &&
        o !== null &&
        o.nodeType === 1 &&
        typeof o.nodeName === "string";
};

const canvasExist = (/** @type {HTMLElement} */ parent, from = "creation") => {
  // @ts-ignore
  var canvas = Object.values(parent.children).map((val) => {
    var classname;
    if (
      val.classList.contains("ripple-effect-body") &&
      val.tagName === "CANVAS"
    ) {
      classname = "ripple-effect-body";
      return `${val.tagName.toLowerCase()}.${classname}`;
    }
  });
  if (
    canvas.filter((x) => x === "canvas.ripple-effect-body").length > 0 &&
    from === "creation"
  ) {
    throw new Error(
      "Parents can only have one child <canvas> with class 'ripple-effect-body'"
    );
  } else if (
    canvas.filter((x) => x === "canvas.ripple-effect-body").length > 1 &&
    from === "DOM"
  ) {
    throw new Error(
      "Parents can only have one child <canvas> with class 'ripple-effect-body'"
    );
  }
};

const runDataAttr = (/** @type {Canvas} */ canvas) => {
  // @ts-ignore
  if (canvas.canvas.dataset.rain && canvas.canvas.dataset.rainAmount) {
    // @ts-ignore
    canvas.rain.Rain = canvas.canvas.dataset.rain === "true";
    // @ts-ignore
    canvas.rain.Amount = Number(canvas.canvas.dataset.rainAmount);
  }
};

const findCanvas = () => {
  const canvases = document.getElementsByClassName("ripple-effect-body");
  for (var canvas of canvases) {
    if (
      canvas.tagName === "CANVAS" &&
      canvasArr.filter((x) => x.canvas === canvas).length === 0
    ) {
      if (canvas.parentElement.tagName != "BODY") {
        canvas.parentElement.classList.add("ripple-canvas-parent");
      }
      canvasExist(canvas.parentElement, "DOM");
      const cvs = new Canvas(canvas);
      addCanvasAttr(cvs);
      runDataAttr(cvs);
      canvasArr.push(cvs);
    }
  }
};

export const createCanvas = (parent = document.body) => {
  if (!isNode(parent) && !isElement(parent)) {
    throw new Error(
      "Function createCanvas() requires a DOM element or DOM node"
    );
  }
  if (parent.tagName != "BODY") {
    parent.classList.add("ripple-canvas-parent");
  }
  canvasExist(parent);
  const canvas = document.createElement("canvas");
  parent.prepend(canvas);
  var cvs = new Canvas(canvas);
  addCanvasAttr(cvs);
  canvasArr.push(cvs);
  return cvs;
};

/**
 * @type {any[]}
 */
const canvasArr = [];
/**
 * @type {number}
 */
var raf = null;
/**
 * @type {Element[]}
 */
const clickThroughArr = [];

const addCanvasAttr = (/** @type {Canvas} */ val) => {
  if (!val.canvas.classList.contains("ripple-effect-body")) {
    val.canvas.classList.add("ripple-effect-body");
  }
  val.canvas.addEventListener("mousedown", (/** @type {any} */ e) => {
    setRipple(e, val);
  });
  val.canvas.addEventListener("mousemove", createWave);
};

class Canvas {
  /**
   * @param {Element} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    // @ts-ignore
    this.ctx = canvas.getContext("2d");
    /**
     * @type {Ripple[]}
     */
    this.rippleArr = [];
    this.rain = {
      amount: 0,
      rain: false,
      get Amount() {
        return this.amount;
      },
      set Amount(val) {
        this.amount = val;
      },
      get Rain() {
        return this.rain;
      },
      set Rain(val) {
        this.rain = val;
        anim();
      },
    };
  }
}

Canvas.prototype.setRain = function (amount = isRequired(), raining = false) {
  if (typeof amount !== "number") {
    throw new Error(
      `expected type "number", instead got type "${typeof amount}"`
    );
  }

  if (typeof raining !== "boolean") {
    throw new Error(
      `expected type "boolean", instead got type "${typeof raining}"`
    );
  }
  this.rain.Amount = amount;
  this.rain.Rain = raining;
  return { amount: this.rain.Amount, raining: this.rain.Rain };
};

Canvas.prototype.fps = function () {
  var sec = 1;
  setInterval(() => {
    console.log(Math.round(raf / sec) + " fps");
    sec++;
  }, 1000);
  return Math.round(raf / sec);
};

Canvas.prototype.stopAnim = function () {
  cancelAnimationFrame(raf);
};

class Ripple {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} [velocity]
   * @param {string} [type]
   */
  constructor(x, y, velocity, type) {
    this.x = x;
    this.y = y;
    this.velocity = velocity || 5;
    this.radius = 0;
    this.lW = 0;
    this.outerStop = 0.36;
    this.type = type || "click";
    this.drawBool = false;
    this.thickestR = 50;
  }
}

Ripple.prototype.draw = function (
  /** @type {{ beginPath: () => void; arc: (arg0: number, arg1: number, arg2: number, arg3: number, arg4: number) => void; createRadialGradient: (arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number) => any; strokeStyle: any; lineWidth: number; stroke: () => void; }} */ ctx
) {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
  const strokeGradient = ctx.createRadialGradient(
    this.x,
    this.y,
    this.radius * 0.7,
    this.x,
    this.y,
    this.radius * 1.6
  );
  strokeGradient.addColorStop(this.outerStop, "transparent");
  strokeGradient.addColorStop(1, "black");
  ctx.strokeStyle = strokeGradient;
  ctx.lineWidth = this.lW;
  ctx.stroke();
  if (this.radius > this.thickestR) {
    if (this.type == "click") {
      this.outerStop += 0.0035;
    } else {
      this.outerStop += 0.007;
    }
    if (this.outerStop > 1) {
      this.outerStop = 1;
    }
  }
  this.lW += 2;
  this.radius += this.velocity;
};

const createWave = () => {
  //todo......
};

const setRipple = (
  /** @type {{ target: { getBoundingClientRect: () => any; }; clientX: number; clientY: number; }} */ e,
  /** @type {Canvas} */ canvas
) => {
  const positions = e.target.getBoundingClientRect();
  const ripple = new Ripple(
    e.clientX - positions.left,
    e.clientY - positions.top
  );
  canvas.rippleArr.push(ripple);
  anim();
};

const rainFall = (
  /**@type {number}*/ amount,
  /** @type {{ canvas: { parentElement: { getBoundingClientRect: () => any; }; }; rippleArr: Ripple[]; }} */ canvas
) => {
  const positions = canvas.canvas.parentElement.getBoundingClientRect();
  for (let i = 0; i < Math.round(amount); i++) {
    const ripple = new Ripple(
      Math.floor(Math.random() * (positions.right + 1)),
      Math.floor(Math.random() * (positions.bottom + 1)),
      4.5,
      "rain"
    );
    ripple.thickestR = Math.random() * 51;
    canvas.rippleArr.push(ripple);
  }
};

const anim = () => {
  if (raf) cancelAnimationFrame(raf);
  canvasArr.forEach((cv) => {
    cv.ctx.clearRect(0, 0, cv.canvas.width, cv.canvas.height);
    var t = cv.rippleArr.filter(
      (/** @type {{ type: string; drawBool: boolean; }} */ x) =>
        x.type === "rain" && x.drawBool === false
    );
    if (cv.rain.rain && raf % 60 == 0) {
      rainFall(cv.rain.amount - t.length, cv);
    }
    cv.rippleArr.forEach(
      (
        /** @type {{ outerStop: number; constructor: { name: string; }; }} */ val,
        /** @type {any} */ i
      ) => {
        if (val.outerStop > 0.6 || val.constructor.name !== "Ripple") {
          cv.rippleArr.splice(i, 1);
        }
      }
    );
    cv.rippleArr.forEach(
      (
        /** @type {{ type: string; drawBool: boolean; draw: (arg0: any) => void; }} */ val
      ) => {
        const rnd = Math.random();
        if (val.type == "click") {
          val.drawBool = true;
        } else if (val.type == "rain" && rnd < 0.01667) {
          val.drawBool = true;
        }
        if (val.drawBool) {
          val.draw(cv.ctx);
        }
      }
    );
  });
  raf = requestAnimationFrame(anim);
};

// @ts-ignore
const determineVelocity = (min = 12.59842, max = 18.89763) => {
  //not good visually but is accurate
  //maybe use???
  return Math.random() * (max - min) + min;
};

const determineCanvasClickState = (
  /** @type {{ clientX: number; clientY: number; }} */ e
) => {
  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  if (elements.length < 1) return;
  const firstEl = elements[0];
  if (firstEl.tagName === "CANVAS") {
    if (!firstEl.classList.contains("ripple-effect-body")) return;
    if (
      !elements[1].classList.contains("ripple-canvas-parent") &&
      elements[1].tagName !== "HTML" &&
      elements[1].tagName !== "BODY"
    ) {
      // @ts-ignore
      elements[0].style.pointerEvents = "none";
      clickThroughArr.push(elements[0]);
    }
  } else {
    if (
      elements[0].classList.contains("ripple-canvas-parent") ||
      elements[0].tagName === "HTML" ||
      elements[0].tagName === "BODY"
    ) {
      if (clickThroughArr.length > 0) {
        clickThroughArr.forEach((val) => {
          // @ts-ignore
          val.style.pointerEvents = "initial";
        });
        clickThroughArr.splice(0);
      }
    }
  }
};

addEventListener("mousemove", determineCanvasClickState);

addEventListener("resize", setSize);

addEventListener("load", () => {
  setStyle();
  setSize();
  findCanvas();
});

const exportObj = {
  createCanvas: createCanvas,
};

export default exportObj;
