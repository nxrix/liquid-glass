import LiquidGlass from "./index.js";

class LiquidSlider extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ["min", "max", "step", "value", "disabled"];

  #glass = null;
  #internals = this.attachInternals();
  #track;
  #fill;
  #thumb;
  #active = false;
  #dragging = false;
  #rect = null;
  #value0 = 0;
  #rest = 0;
  #scheme;

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
          width: 129px;
          height: 27px;
          touch-action: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        :host(:focus) {
          outline: none;
        }
        :host([disabled]) {
          opacity: .4;
          pointer-events: none;
        }
        #track {
          position: absolute;
          top: 50%;
          translate: 0 -50%;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: light-dark(rgba(120, 120, 128, .26), rgba(120, 120, 128, .36));
        }
        #fill {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          border-radius: inherit;
          background: light-dark(#007aff, #0a84ff);
        }
        #thumb {
          position: absolute;
          top: 50%;
          translate: -50% -50%;
          width: 32px;
          height: 22px;
          border-radius: 11px;
          background: #fff;
          box-shadow: 0 3px 8px rgba(0, 0, 0, .15), 0 1px 1px rgba(0, 0, 0, .16);
          transition: background-color .3s cubic-bezier(.4, 0, .2, 1), transform .3s cubic-bezier(.4, 0, .2, 1);
        }
        #thumb.moving {
          background: #fff0;
          transform: scale(1.05);
        }
      </style>
      <div id="track"><div id="fill"></div></div>
      <div id="thumb"></div>`;
    this.role = "slider";
    this.#track = root.querySelector("#track");
    this.#fill = root.querySelector("#fill");
    this.#thumb = root.querySelector("#thumb");
    this.addEventListener("pointerdown", this.#down);
    this.addEventListener("pointermove", this.#move);
    this.addEventListener("pointerup", this.#up);
    this.addEventListener("pointercancel", this.#up);
    this.addEventListener("keydown", this.#key);
  }

  get min() {
    return this.#num("min", 0);
  }

  set min(value) {
    this.setAttribute("min", value);
  }

  get max() {
    return this.#num("max", 100);
  }

  set max(value) {
    this.setAttribute("max", value);
  }

  get step() {
    return this.#num("step", 1) || 1;
  }

  set step(value) {
    this.setAttribute("step", value);
  }

  get value() {
    const value = parseFloat(this.getAttribute("value"));
    return Number.isNaN(value) ? (this.min + this.max) / 2 : value;
  }

  set value(value) {
    const { min, max, step } = this;
    value = Math.max(min, Math.min(max, value));
    value = min + Math.round((value - min) / step) * step;
    this.setAttribute("value", value.toFixed((String(step).split(".")[1] ?? "").length));
  }

  connectedCallback() {
    this.#glass ??= new LiquidGlass(this.#thumb, { strength: 24, depth: 4, chromaticAberration: 1 });
    this.#scheme ??= matchMedia("(prefers-color-scheme: dark)");
    this.#scheme.onchange = () => this.#render();
    this.#render();
  }

  disconnectedCallback() {
    this.#scheme.onchange = null;
    this.#glass?.destroy();
    this.#glass = null;
  }

  attributeChangedCallback() {
    this.#render();
  }

  #num(name, fallback) {
    const value = parseFloat(this.getAttribute(name));
    return Number.isNaN(value) ? fallback : value;
  }

  #accent() {
    const color = getComputedStyle(this).accentColor;
    return !color || color === "auto" ? "" : color;
  }

  #render() {
    const p = Math.max(0, Math.min(1, (this.value - this.min) / (this.max - this.min || 1)));
    this.#fill.style.width = `${p * 100}%`;
    this.#fill.style.background = this.#accent();
    this.#thumb.style.left = `${p * 100}%`;
    this.tabIndex = this.disabled ? -1 : 0;
    this.setAttribute("aria-valuemin", this.min);
    this.setAttribute("aria-valuemax", this.max);
    this.setAttribute("aria-valuenow", this.value);
    this.#internals.setFormValue(this.disabled ? null : this.value);
  }

  #apply(value) {
    const prev = this.value;
    this.value = value;
    if (this.value !== prev) this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  }

  #down = (e) => {
    if (this.disabled || this.#active) return;
    this.#active = true;
    this.#dragging = false;
    this.#rect = this.getBoundingClientRect();
    this.#value0 = this.value;
    clearTimeout(this.#rest);
    this.#thumb.classList.add("moving");
    this.focus();
    this.setPointerCapture(e.pointerId);
    this.#pick(e.clientX);
  };

  #move = (e) => {
    if (!this.#active) return;
    this.#dragging = true;
    this.#pick(e.clientX);
  };

  #pick = (x) => {
    const p = Math.max(0, Math.min(1, (x - this.#rect.left) / this.#rect.width));
    this.#apply(this.min + p * (this.max - this.min));
  };

  #up = () => {
    if (!this.#active) return;
    this.#active = false;
    const drag = this.#dragging;
    this.#dragging = false;
    if (drag) {
      clearTimeout(this.#rest);
      this.#thumb.classList.remove("moving");
    } else {
      this.#rest = setTimeout(() => this.#thumb.classList.remove("moving"), 200);
    }
    if (this.value !== this.#value0) this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  #key = (e) => {
    if (this.disabled) return;
    const delta = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
    if (!delta) return;
    e.preventDefault();
    const prev = this.value;
    this.#apply(this.value + delta * this.step);
    if (this.value !== prev) this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };
}

export { LiquidSlider };

customElements.define("liquid-slider", LiquidSlider);
