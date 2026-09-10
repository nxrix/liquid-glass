# Liquid Glass

A tiny, dependency-free liquid glass effect for the web using CSS `backdrop-filter` and SVG displacement maps.

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

## Options

| Option                | Default | Description                                               |
| --------------------- | ------: | --------------------------------------------------------- |
| `strength`            |    `32` | Distortion strength                                       |
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
