---
layout: default
---

<style>

.wrap {
  display: flex;
  flex-wrap: wrap;
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
  pointer-events: none;

  box-shadow:
    inset 1px 1px 0 #fff3,
    inset -1px -1px 0 #fff1;
}

#controls {
  box-sizing: border-box;
  padding: 16px;
  max-width: 512px;
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

A tiny, dependency-free liquid glass effect for the web using CSS `backdrop-filter` and SVG displacement maps.

<hr>

<div class="layout">
  <div class="wrap">
    <div id="text"></div>
    <div id="glass"></div>
  </div>
  <div id="controls"></div>
</div>

<hr>

## Usage

```html
<div id="glass"></div>
```

```js
import LiquidGlass from "./index.js";

const glass = new LiquidGlass(
  document.querySelector("#glass")
);
```

<hr>

## Options

| Option                | Default | Description                                               |
| --------------------- | ------: | --------------------------------------------------------- |
| `strength`            |    `32` | Distortion strength                                       |
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

const lg = new LiquidGlass(glass, { radius: 32 });

for (const [key, label, min, max, step, start, unit] of [
  [           "strength",             "Strength", 0, 100,    1,   32,    ""],
  [              "depth",                "Depth", 0,  30,    1,    8, " px"],
  ["chromaticAberration", "Chromatic aberration", 0,  12,  0.5,    3,    ""],
  [               "blur",                 "Blur", 0,  12,  0.5,    1, " px"],
  [         "brightness",           "Brightness", 0, 1.5, 0.01,  0.9,    ""],
  [             "radius",               "Radius", 0, 128,    1,   32, " px"],
]) {
  let value = start;
  const box = document.createElement("div");
  box.innerHTML = `
    <div class="row"><span>${label}</span><span></span></div>
    <input type="range" min="${min}" max="${max}" step="${step}" value="${start}">`;
  const input = box.querySelector("input");
  const out = box.querySelector(".row span:last-child");
  const show = () =>
    (out.textContent = (key === "brightness" ? value.toFixed(2) : value) + unit);

  input.addEventListener("input", () => {
    value = +input.value;
    lg.set({ [key]: value });
    show();
  });
  show();
  controls.append(box);
}

</script>
