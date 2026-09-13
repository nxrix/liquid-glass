import LiquidGlass from "./index.js";

class LiquidSwitch extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ["checked", "disabled"];

  #glass = null;
  #internals = this.attachInternals();
  #track;
  #knob;
  #active = false;
  #dragging = false;
  #x0 = 0;
  #pos = 0;
  #rest = 0;
  #scheme;
  #painted = false;

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
          width: 51px;
          height: 31px;
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
          inset: 0;
          border-radius: 15.5px;
          background: rgba(120, 120, 128, .32);
          transition: background-color .25s;
        }
        #track.on {
          background: light-dark(#34c759, #30d158);
        }
        #knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 27px;
          height: 27px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 3px 8px rgba(0, 0, 0, .15), 0 1px 1px rgba(0, 0, 0, .16);
          transition: translate .25s cubic-bezier(.2, .8, .3, 1), background-color .3s cubic-bezier(.4, 0, .2, 1), transform .3s cubic-bezier(.4, 0, .2, 1);
        }
        #knob.moving {
          background: #fff0;
          transform: scale(1.05);
        }
        #knob.drag {
          transition: background-color .3s cubic-bezier(.4, 0, .2, 1), transform .3s cubic-bezier(.4, 0, .2, 1);
        }
      </style>
      <div id="track"></div>
      <div id="knob"></div>`;
    this.role = "switch";
    this.#track = root.querySelector("#track");
    this.#knob = root.querySelector("#knob");
    this.addEventListener("pointerdown", this.#down);
    this.addEventListener("pointermove", this.#move);
    this.addEventListener("pointerup", this.#up);
    this.addEventListener("pointercancel", this.#up);
    this.addEventListener("keydown", this.#key);
  }

  get checked() {
    return this.hasAttribute("checked");
  }

  set checked(value) {
    this.toggleAttribute("checked", Boolean(value));
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(value) {
    this.toggleAttribute("disabled", Boolean(value));
  }

  get value() {
    return this.getAttribute("value") ?? "on";
  }

  set value(value) {
    this.setAttribute("value", value);
  }

  click() {
    super.click();
    if (this.disabled) return;
    this.#lens();
    this.#commit(!this.checked);
  }

  connectedCallback() {
    this.#glass ??= new LiquidGlass(this.#knob, { strength: 32, depth: 5, chromaticAberration: 1 });
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

  #lens(hold = 200) {
    clearTimeout(this.#rest);
    this.#knob.classList.add("moving");
    this.#rest = setTimeout(() => this.#knob.classList.remove("moving"), hold);
  }

  #accent() {
    const color = getComputedStyle(this).accentColor;
    return !color || color === "auto" ? "" : color;
  }

  #render() {
    if (!this.#painted) this.#track.style.transition = "none";
    this.#knob.style.translate = `${this.checked ? 20 : 0}px 0`;
    this.#track.classList.toggle("on", this.checked);
    this.#track.style.background = this.checked ? this.#accent() : "";
    this.tabIndex = this.disabled ? -1 : 0;
    this.setAttribute("aria-checked", this.checked);
    this.#internals.setFormValue(this.checked ? this.value : null);
    if (!this.#painted) {
      this.#painted = true;
      this.#track.offsetTop;
      this.#track.style.transition = "";
    }
  }

  #commit(next) {
    if (next === this.checked) return false;
    this.checked = next;
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    return true;
  }

  #down = (e) => {
    if (this.disabled || this.#active) return;
    this.#active = true;
    this.#dragging = false;
    this.#x0 = e.clientX;
    this.#pos = this.checked ? 20 : 0;
    clearTimeout(this.#rest);
    this.#knob.classList.add("moving");
    this.focus();
    this.setPointerCapture(e.pointerId);
  };

  #move = (e) => {
    if (!this.#active) return;
    const dx = e.clientX - this.#x0;
    if (!this.#dragging) {
      if (Math.abs(dx) < 3) return;
      this.#dragging = true;
      this.#knob.classList.add("drag");
    }
    this.#pos = Math.max(0, Math.min(20, (this.checked ? 20 : 0) + dx));
    this.#knob.style.translate = `${this.#pos}px 0`;
    this.#track.classList.toggle("on", this.#pos > 10);
  };

  #up = () => {
    if (!this.#active) return;
    this.#active = false;
    const drag = this.#dragging;
    this.#dragging = false;
    this.#knob.classList.remove("drag");
    if (drag) {
      clearTimeout(this.#rest);
      this.#knob.classList.remove("moving");
    } else {
      this.#lens();
    }
    const next = drag ? this.#pos > 10 : !this.checked;
    if (!this.#commit(next)) this.#render();
  };

  #key = (e) => {
    if (this.disabled || (e.key !== " " && e.key !== "Enter")) return;
    e.preventDefault();
    this.#lens();
    this.#commit(!this.checked);
  };
}

export { LiquidSwitch };

customElements.define("liquid-switch", LiquidSwitch);
