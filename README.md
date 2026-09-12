# Liquid Glass

A tiny, dependency-free liquid glass effect for the web using CSS `backdrop-filter` and SVG displacement maps. (Falls back to simple blur on WebKit.)

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
