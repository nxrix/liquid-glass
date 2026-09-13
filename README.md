# Liquid Glass

A tiny, dependency-free liquid glass effect for the web using CSS `backdrop-filter` and SVG displacement maps. (Falls back to simple blur on WebKit.)

The displacement map is generated only on initialization and when the element is resized. The map is built as an SVG and embedded as a Base64 data URI, avoiding per-frame image generation or rendering.

For width and height animations, use `transform: scale()` instead of animating width or height. Since transforms don't trigger the ResizeObserver, the displacement map doesn't need to be regenerated every frame.

## Usage

```html
<div id="glass"></div>
```

```js
import LiquidGlass from "https://nxrix.github.io/liquid-glass/src/index.js";

const options = { radius: 8 };

const glass = new LiquidGlass(
  document.querySelector("#glass"),
  options
);
```

## Options

| Option                | Default | Description                                               |
| --------------------- | ------: | --------------------------------------------------------- |
| `strength`            |    `64` | Distortion strength                                       |
| `depth`               |     `8` | Displacement depth                                        |
| `chromaticAberration` |     `3` | RGB separation                                            |
| `blur`                |     `1` | Backdrop blur                                             |
| `brightness`          |   `0.9` | Backdrop brightness                                       |
| `radius`              |  `null` | Border radius in px; `null` uses the element's CSS radius |

## API

### Set

```js
glass.set(options);
```

### Destroy

```js
glass.destroy();
```
