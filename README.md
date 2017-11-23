# blob-slide

A lightweight, dependency-free Javascript animation library to toggle elements from nothingness to somethingness and vice versa, using a vertical or horizontal slide animation.



&nbsp;
##### Table of Contents

1. [Features](#features)
2. [How It Works](#how-it-works)
3. [Use](#use)
4. [Compatibility](#compatibility)
5. [License](#license)



&nbsp;
## Features

It is not possible to transition elements to or from a non-layout hidden state (e.g. `display: none;`), or to or from an automatic dimension (e.g. `height: auto;`), using CSS3 animations alone.

Such tasks require Javascript, and for most projects, that means leveraging a large framework like jQuery or Velocity.

blob-slide is a small, dependency-free Javascript library with a single focus: horizontal and vertical layout-visibility slide toggling. **That's it!** No more, no less.

*Note:* only layout-affecting visibility is toggled. Properties like `opacity` or `scale` are ignored.



&nbsp;
## How It Works

blob-slide computes the current sizing properties for an element (width, height, margins, and padding), and then computes the sizing properties of the reverse state (either visible or hidden).

Once the to/from values have been established, it generates a temporary CSS3 `@keyframe` animation and applies it to the element.

When the animation has finished, the element's temporary styles are cleared. If it is now visible, it is assigned a display type (by default `"block"`). If it is now invisible, it is given the HTML5 `hidden` attribute.

Simple, clean, done!



&nbsp;
## Use

### Getting Started

Download and add [blob-slide.min.js](https://raw.githubusercontent.com/Blobfolio/blob-slide/master/blob-slide.min.js) to your project.

```html
<script src="blob-slide.min.js"></script>
```

### Methods

blob-slide exists as a global variable, `blobSlide`, with two methods: `hslide()` for horizontal movement and `vslide()` for vertical movement.

Both methods work the same way. If a `DOMElement` is fully hidden, it will slide to visibility; if it is already visible, it will slide to nothingness.

**Arguments:**

| Type | Name | Description |
| ---- | ---- | ----------- |
| *DOMElement* or *NodeList* | Element(s) | A single element or NodeList of elements to transition. |
| *object* | Options | An optional object containing behavioral overrides. |

**Options:**

| Type | Name | Description | Default |
| ---- | ---- | ----------- | ------- |
| *string* | display | When transitioning to visibility, this display type will be applied to the element. | `"block"` |
| *int* | duration | Animation duration in milliseconds. | `100` |
| *string* | transition | Transition type to use, either `"ease"` or `"linear"`. | `"linear"` |
| *string* | force | Rather than toggle, transition to a specific state, either `"show"` or `"hide"`. | `NULL` |

### Example

```javascript
// Vertically slide-toggle an element called #foo with a
// 500ms transition.
var el = document.getElementById('foo');
blobSlide.vslide(el, { duration: 500 });

// Horizontally slide-toggle multiple items to inline-block.
var els = document.querySelectorAll('.foo');
blobSlide.hslide(els, { display: 'inline-block' });
```



&nbsp;
## Compatibility

blob-slide is compatible with all major modern web browsers and IE 11.



&nbsp;
## License

Copyright © 2017 [Blobfolio, LLC](https://blobfolio.com) &lt;hello@blobfolio.com&gt;

This work is free. You can redistribute it and/or modify it under the terms of the Do What The Fuck You Want To Public License, Version 2.

    DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
    Version 2, December 2004
    
    Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>
    
    Everyone is permitted to copy and distribute verbatim or modified
    copies of this license document, and changing it is allowed as long
    as the name is changed.
    
    DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
    TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
    
    0. You just DO WHAT THE FUCK YOU WANT TO.
