---
layout: default
---

<style>

.layout {
  display: flex;
  flex-wrap: wrap;
}

.wrap {
  position: relative;
  width: fit-content;
  max-width: 512px;
}

#text {
  box-sizing: border-box;
  padding: 16px;
  max-height: 512px;
  overflow-y: scroll;
}

#glass {
  position: absolute;
  width: 50%;
  height: 25%;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  z-index: 1;

  box-shadow:
    inset 1px 1px 0 #fff7,
    inset -1px -1px 0 #fff7;
}

/*#glass::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(-45deg, #fff8, #fff4, #fff0, #fff4, #fff);
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  pointer-events: none;
}*/

@keyframes glassClick {
  0% {
    transform: scale(1, 1);
  }
  25% {
    transform: scale(1.10, 0.88);
  }
  50% {
    transform: scale(0.96, 1.14);
  }
  70% {
    transform: scale(1.03, 0.94);
  }
  85% {
    transform: scale(0.99, 1.025);
  }
  100% {
    transform: scale(1, 1);
  }
}

#glass.click {
  animation: glassClick 0.7s cubic-bezier(.34, 1.56, .64, 1);
}

#controls {
  box-sizing: border-box;
  padding: 16px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 12px;
}

.row span:last-child { opacity: .65; font-variant-numeric: tabular-nums; }

input[type="range"] {
  display: block;
  width: 100%;
  cursor: pointer;
}

</style>

# Liquid Glass

A tiny, dependency-free liquid glass effect for the web using CSS `backdrop-filter` and SVG displacement maps. (Falls back to simple blur on WebKit.)

<hr>

## Playground

<div class="layout">
  <div class="wrap">
    <div id="text"></div>
    <div id="glass"></div>
  </div>
  <div id="controls"></div>
</div>

<img id="map">

The displacement map is generated only on initialization and when the element is resized. The map is built as an SVG and embedded as a Base64 data URI, avoiding per-frame image generation or rendering.

For width and height animations, use `transform: scale()` instead of animating width or height. Since transforms don't trigger the ResizeObserver, the displacement map doesn't need to be regenerated every frame.

<hr>

## Usage

```html
<div id="glass"></div>
```

```js
import LiquidGlass from "https://nxrix.github.io/liquid-glass/index.js";

const glass = new LiquidGlass(
  document.querySelector("#glass")
);
```

<hr>

## Options

| Option                | Default | Description                                               |
| --------------------- | ------: | --------------------------------------------------------- |
| `strength`            |    `64` | Distortion strength                                       |
| `depth`               |     `8` | Displacement depth                                        |
| `chromaticAberration` |     `3` | RGB separation                                            |
| `blur`                |     `1` | Backdrop blur                                             |
| `brightness`          |   `0.9` | Backdrop brightness                                       |
| `radius`              |  `null` | Border radius in px; `null` uses the element's CSS radius |

<hr>

## API

### Set

Change one or multiple options

```js
glass.set({
  strength: 50,
  blur: 3,
});
```

### Destroy

```js
glass.destroy();
```

<script type="module">

import LiquidGlass from "./index.js";

const li = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras in egestas lectus. Praesent interdum est eu elit porta, non posuere ligula porttitor. In eget feugiat augue, eu tristique ipsum. Nulla volutpat risus felis, ac suscipit tellus accumsan mattis. Aliquam erat volutpat. Aenean id nulla eget odio suscipit rutrum ut et tortor. Nullam eget fringilla eros. Donec non imperdiet enim. Mauris efficitur sit amet est ac pellentesque. Morbi at nulla id mi euismod sodales. Vivamus consectetur, turpis at fringilla interdum, neque dolor sollicitudin odio, sed varius nisi arcu vitae ligula.";
text.innerHTML += li.repeat(20);

glass.addEventListener("click", () => {
  glass.classList.remove("click");
  void glass.offsetWidth;
  glass.classList.add("click");
});

const lg = new LiquidGlass(glass, { radius: 32 });
const feImage = lg.holder.querySelector("feImage");

for (const [key, label, min, max, step, start, unit] of [
  [           "strength",             "Strength", 0, 128,    1,   64,    ""],
  [              "depth",                "Depth", 0,  32,    1,    8, " px"],
  ["chromaticAberration", "Chromatic aberration", 0,  16,  0.5,    3,    ""],
  [               "blur",                 "Blur", 0,  16,  0.5,    1, " px"],
  [         "brightness",           "Brightness", 0, 1.5,  0.1,  0.9,    ""],
  [             "radius",               "Radius", 0, 128,    1,   32, " px"],
]) {
  let value = start;
  const box = document.createElement("div");
  box.innerHTML = `
    <div class="row"><span>${label}</span><span></span></div>
    <input type="range" min="${min}" max="${max}" step="${step}" value="${start}">`;
  const input = box.querySelector("input");
  const out = box.querySelector(".row span:last-child");
  const show = () => {
    map.src = feImage.getAttribute("href");
    out.textContent = (key === "brightness" ? value.toFixed(2) : value) + unit
  };

  input.addEventListener("input", () => {
    value = +input.value;
    lg.set({ [key]: value });
    show();
  });
  show();
  controls.append(box);
}

</script>
