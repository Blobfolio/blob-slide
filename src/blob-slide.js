/**
 * blob-slide
 *
 * @version 1.1.0
 * @home https://github.com/Blobfolio/blob-slide
 *
 * Copyright © 2017 Blobfolio, LLC <https://blobfolio.com>
 *
 * This work is free. You can redistribute it and/or modify
 * it under the terms of the Do What The Fuck You Want To
 * Public License, Version 2.
 */
var blobSlide = {
	// Keep track of what's animating.
	progress: {},

	/**
	 * Horizontal Slide Toggle
	 *
	 * Slide an element to or from nothingness horizontally.
	 *
	 * @param DOMElement $el Element.
	 * @param string $options Transition options.
	 * @return void|bool Nothing or false.
	 */
	hslide: function(el, options) {
		// Recurse?
		if (el instanceof NodeList) {
			var m = this;
			el.forEach(function(e){
				m.hslide(e, options);
			});
			return;
		}

		var to = {},
			next;

		if (options.force === 'show') {
			next = this.getSomething(el);
		}
		else if (options.force === 'hide') {
			next = this.getNothing();
		}
		else {
			next = this.getNext(el);
		}

		if (false === next) {
			return false;
		}

		// Focus on left/right stuff.
		to.width = next.width;
		to.paddingRight = next.paddingRight;
		to.paddingLeft = next.paddingLeft;
		to.marginRight = next.marginRight;
		to.marginLeft = next.marginLeft;

		return this.slide(el, to, options);
	},

	/**
	 * Vertical Slide Toggle
	 *
	 * Slide an element to or from nothingness vertically.
	 *
	 * @param DOMElement|NodeList $el Element.
	 * @param string $options Transition options.
	 * @return void|bool Nothing or false.
	 */
	vslide: function(el, options) {
		// Recurse?
		if (el instanceof NodeList) {
			var m = this;
			el.forEach(function(e){
				m.vslide(e, options);
			});
			return;
		}

		var to = {},
			next;

		if (options.force === 'show') {
			next = this.getSomething(el);
		}
		else if (options.force === 'hide') {
			next = this.getNothing();
		}
		else {
			next = this.getNext(el);
		}

		if (false === next) {
			return false;
		}

		// Focus on top/bottom stuff.
		to.height = next.height;
		to.paddingTop = next.paddingTop;
		to.paddingBottom = next.paddingBottom;
		to.marginTop = next.marginTop;
		to.marginBottom = next.marginBottom;

		return this.slide(el, to, options);
	},

	/**
	 * Generic Slide
	 *
	 * @param DOMElement $el Element.
	 * @param object $to Destination values for width, height, etc.
	 * @param string $options Transition options.
	 * @return void|bool Nothing or false.
	 */
	slide: function(el, to, options) {
		if (
			!el.nodeType ||
			(typeof to !== 'object')
		) {
			return false;
		}

		var progressKey = parseInt(el.getAttribute('data-progress-key'), 10) || false;

		// Stop any in-progress animations.
		if (typeof this.progress[progressKey] !== 'undefined') {
			this.progress[progressKey].abort = true;
		}

		// Make sure we have a sane transition duration.
		if (typeof options !== 'object') {
			options = {};
		}
		options.duration = parseInt(options.duration, 10) || 0;
		if (options.duration <= 0) {
			options.duration = 100;
		}

		// And a somewhat sane display type.
		if (!options.display || (typeof options.display !== 'string')) {
			options.display = 'block';
		}
		else {
			options.display = (options.display + '').toLowerCase();
			if (options.display === 'none') {
				options.display = 'block';
			}
		}

		// Sanitize transition.
		if (!options.transition || (typeof this.easing[options.transition] === 'undefined')) {
			options.transition = 'linear';
		}

		// Generate a new animation key.
		progressKey = parseInt((Math.random() + '').replace('.', ''), 10);
		while(this.progress[progressKey]) {
			progressKey++;
		}
		this.progress[progressKey] = {
			start: null,
			abort: false,
			props: {},
		};
		el.setAttribute('data-progress-key', progressKey);

		var from = this.getCurrent(el),
			toKeys = Object.keys(to),
			propKeys = Object.keys(this.getNothing());

		// Find out which properties we should be changing to.
		propKeys.forEach(function(i){
			if ((toKeys.indexOf(i) !== -1) && !isNaN(to[i])) {
				if (to[i] !== from[i]) {
					blobSlide.progress[progressKey].props[i] = [from[i], to[i]];
				}
			}
		});

		// Nothing to animate?
		if (!Object.keys(this.progress[progressKey].props).length) {
			delete(this.progress[progressKey]);
			el.removeAttribute('data-progress-key');
			return false;
		}

		var tick = function(timestamp) {
			if (blobSlide.progress[progressKey].start === null) {
				blobSlide.progress[progressKey].start = timestamp;
			}

			// Early abort?
			if (blobSlide.progress[progressKey].abort) {
				delete(blobSlide.progress[progressKey]);
				el.removeAttribute('data-progress-key');
				return;
			}

			// Figure out time and scale.
			var elapsed = timestamp - blobSlide.progress[progressKey].start,
				progress = Math.min(elapsed / options.duration, 1),
				scale = blobSlide.easing[options.transition](progress),
				from = blobSlide.getCurrent(el),
				propsKeys = Object.keys(blobSlide.progress[progressKey].props);

			// Update the draw.
			propsKeys.forEach(function(i){
				var oldV = blobSlide.progress[progressKey].props[i][0],
					newV = blobSlide.progress[progressKey].props[i][1],
					diff = newV - oldV;

				el.style[i] = oldV + (diff * scale) + 'px';
			});

			// Call again?
			if (scale < 1) {
				return window.requestAnimationFrame(tick);
			}

			// We've transitioned to somethingness.
			if (
				((propsKeys.indexOf('width') !== -1) && (blobSlide.progress[progressKey].props.width[1] > 0)) ||
				((propsKeys.indexOf('height') !== -1) && (blobSlide.progress[progressKey].props.height[1] > 0))
			) {
				el.removeAttribute('style');
				el.style.display = options.display;
			}
			else {
				el.setAttribute('hidden', true);
				el.removeAttribute('style');
			}

			el.removeAttribute('data-progress-key');
		};

		// Make sure the element is visible.
		if (!this.isPainted(el)) {
			el.removeAttribute('hidden');
			el.style.display = options.display;
		}

		// And call it.
		el.style.overflow = 'hidden';
		window.requestAnimationFrame(tick);
	},

	/**
	 * State of Nothing
	 *
	 * Return an object of properties to animate with everything in a
	 * zeroed-out state.
	 *
	 * @return array Properties.
	 */
	getNothing: function() {
		return 	{
			width: 0.0,
			height: 0.0,
			paddingTop: 0.0,
			paddingRight: 0.0,
			paddingBottom: 0.0,
			paddingLeft: 0.0,
			marginTop: 0.0,
			marginRight: 0.0,
			marginBottom: 0.0,
			marginLeft: 0.0,
		};
	},

	/**
	 * State of Something
	 *
	 * Clone an object to find its natural dimensions.
	 *
	 * @param DOMElement $el Element.
	 * @return array Properties.
	 */
	getSomething: function(el) {
		if (!el.nodeType) {
			return false;
		}

		// If our element is hidden, we need to quickly make a
		// visible clone so we can see what kind of space it would
		// take up.
		var parent = el.parentNode,
			newEl = el.cloneNode(true);

		newEl.removeAttribute('hidden');
		newEl.removeAttribute('style');
		newEl.style.display = 'block';
		newEl.style.visibility = 'visible';
		newEl.style.opacity = 0;

		parent.appendChild(newEl);
		var out = this.getCurrent(newEl);
		parent.removeChild(newEl);

		return out;
	},

	/**
	 * Next Properties
	 *
	 * This is all about toggling, right?, so this will either
	 * return the size an element would have were it visible, or
	 * a bunch of zeroes (because the next state is nothingness).
	 *
	 * @param DOMElement $el Element.
	 * @return void|bool Nothing or false.
	 */
	getNext: function(el) {
		if (!el.nodeType) {
			return false;
		}

		// The object is visible, so we want to zero it out.
		if (this.isPainted(el)) {
			return this.getNothing();
		}

		// And return the results.
		return this.getSomething(el);
	},

	/**
	 * Current Properties
	 *
	 * Return an element's current sizing.
	 *
	 * @param DOMElement $el Element.
	 * @param int $duration Transition duration in milliseconds.
	 * @return void|bool Nothing or false.
	 */
	getCurrent: function(el) {
		if (!el.nodeType) {
			return false;
		}

		if (!this.isPainted(el)) {
			return this.getNothing();
		}

		// Computed can give us everything we need.
		var out = {},
			computed = window.getComputedStyle(el, null);

		// Copy the values over, but make sure everything's a float.
		out.width = parseFloat(computed.getPropertyValue('width')) || 0.0;
		out.height = parseFloat(computed.getPropertyValue('height')) || 0.0;
		out.paddingTop = parseFloat(computed.getPropertyValue('padding-top')) || 0.0;
		out.paddingRight = parseFloat(computed.getPropertyValue('padding-right')) || 0.0;
		out.paddingBottom = parseFloat(computed.getPropertyValue('padding-bottom')) || 0.0;
		out.paddingLeft = parseFloat(computed.getPropertyValue('padding-left')) || 0.0;
		out.marginTop = parseFloat(computed.getPropertyValue('margin-top')) || 0.0;
		out.marginRight = parseFloat(computed.getPropertyValue('margin-right')) || 0.0;
		out.marginBottom = parseFloat(computed.getPropertyValue('margin-bottom')) || 0.0;
		out.marginLeft = parseFloat(computed.getPropertyValue('margin-left')) || 0.0;

		// And done.
		return out;
	},

	/**
	 * Is An Element "Painted"?
	 *
	 * Determine whether or not an element is taking up space in the
	 * DOM. (We don't really care about visibility so much as
	 * existence.)
	 *
	 * @param DOMElement $el Element.
	 * @param int $duration Transition duration in milliseconds.
	 * @return void|bool Nothing or false.
	 */
	isPainted: function(el) {
		if (!el.nodeType || el.getAttribute('hidden')) {
			return false;
		}

		var computed = window.getComputedStyle(el, null);
		return computed.display !== 'none';
	},

	/**
	 * Easing Helpers
	 *
	 * @see {https://gist.github.com/gre/1650294}
	 */
	easing: {
		// No easing, no acceleration.
		linear: function (t) { return t; },
		// Alias of easeInOutCubic.
		ease: function (t) { return t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; },
		// Accelerating from zero velocity.
		easeInQuad: function (t) { return t*t; },
		// Decelerating to zero velocity.
		easeOutQuad: function (t) { return t*(2-t); },
		// Acceleration until halfway, then deceleration.
		easeInOutQuad: function (t) { return t<0.5 ? 2*t*t : -1+(4-2*t)*t; },
		// Accelerating from zero velocity.
		easeInCubic: function (t) { return t*t*t; },
		// Decelerating to zero velocity.
		easeOutCubic: function (t) { return (--t)*t*t+1; },
		// Acceleration until halfway, then deceleration.
		easeInOutCubic: function (t) { return t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; },
		// Accelerating from zero velocity.
		easeInQuart: function (t) { return t*t*t*t; },
		// Decelerating to zero velocity.
		easeOutQuart: function (t) { return 1-(--t)*t*t*t; },
		// Acceleration until halfway, then deceleration.
		easeInOutQuart: function (t) { return t<0.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t; },
		// Accelerating from zero velocity.
		easeInQuint: function (t) { return t*t*t*t*t; },
		// Decelerating to zero velocity.
		easeOutQuint: function (t) { return 1+(--t)*t*t*t*t; },
		// Acceleration until halfway, then deceleration.
		easeInOutQuint: function (t) { return t<0.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t; }
	},
};