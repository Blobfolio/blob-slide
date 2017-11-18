/**
 * blob-slide
 *
 * @version 1.0
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

	// These are the transition types that can be used.
	transitionProps: [
		'ease',
		'linear',
	],

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
			next = this.getNext(el),
			current = this.getCurrent(el);

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
			next = this.getNext(el);

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
		if (!el.nodeType || (typeof to !== 'object')) {
			return false;
		}

		// Find or set a timer key.
		var progressKey = this.progressKey(el);

		// Abort if we're already doing stuff.
		if (this.progress[progressKey]) {
			return false;
		}
		this.progress[progressKey] = true;

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
		if (this.transitionProps.indexOf(options.transition) === -1) {
			options.transition = 'linear';
		}

		// Note our starting conditions.
		var from = this.getCurrent(el),
			toKeys = Object.keys(to),
			animationProps = Object.keys(this.getNothing()),
			animation = {
				from: [],
				to: [],
			};

		// Convert our transition into CSS animations.
		animationProps.forEach(function(i){
			if ((toKeys.indexOf(i) !== -1) && !isNaN(to[i])) {
				var css = i.replace(/([A-Z])/g, function(match){
					return '-' + match.toLowerCase();
				});

				animation.to.push(css + ': ' + to[i] + 'px;');
				animation.from.push(css + ': ' + from[i] + 'px;');
			}
		});

		// Generate a stylesheet with this animation.
		var style = document.createElement('style');
		style.setAttribute('id', 'blobSlide-' + progressKey);
		style.setAttribute('type', 'text/css');
		style.innerHTML = '@keyframes blobSlide-' + progressKey + ' { from { ' + animation.from.join('') + ' } to { ' + animation.to.join('') + ' } }';
		document.body.appendChild(style);

		// Make sure the element is visible.
		if (!this.isPainted(el)) {
			el.removeAttribute('hidden');
			el.style.display = options.display;
		}

		// Clean things up when the animation is complete.
		el.addEventListener('animationend', function cb(e){
			if (e.animationName === 'blobSlide-' + progressKey) {
				// We just went to nothingness.
				if (from.width > 0 && from.height > 0) {
					el.setAttribute('hidden', true);
					el.removeAttribute('style');
				}
				// We just went to somethingness.
				else {
					el.removeAttribute('style');
					el.style.display = options.display;
				}

				// Remove the stylesheet.
				document.body.removeChild(document.getElementById('blobSlide-' + progressKey));

				// Clear progress trackers.
				delete(blobSlide.progress[progressKey]);
				el.removeAttribute('data-progress-key');

				// We only needed this once.
				e.currentTarget.removeEventListener(e.type, cb);
			}
		}, false);

		// Run the animation!
		el.style.overflow = 'hidden';
		el.style.animation = 'blobSlide-' + progressKey + ' ' + options.transition + ' ' + options.duration/1000 + 's';
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
	 * Get/Set Animation Key
	 *
	 * We want to track in-progress animations for each element.
	 * Javascript gets confused if we try to just key an object
	 * with a node, so instead we'll generate a random integer.
	 *
	 * @param DOMElement $el Element.
	 * @return int|bool Key or false.
	 */
	progressKey: function(el) {
		if (!el.nodeType) {
			return false;
		}

		// Figure out where we're starting.
		var keys = Object.keys(this.progress),
			progressKey = parseInt(el.getAttribute('data-progress-key'), 10) || false,
			oldKey = progressKey;

		// Clear old/invalid keys.
		if ((false !== progressKey) && (keys.indexOf(progressKey) === -1)) {
			progressKey = false;
		}

		// Set a new key if necessary.
		if (false === progressKey) {
			// Start from a semi-random place.
			progressKey = parseInt((Math.random() + '').replace('.', ''), 10);

			// If we happen to collide with an existing key, just
			// plus-plus until we're unique.
			while(keys.indexOf(progressKey) !== -1) {
				progressKey++;
			}
		}

		// Save and return.
		if (oldKey !== progressKey) {
			el.setAttribute('data-progress-key', progressKey);
		}

		return progressKey;
	},

	/**
	 * Next Properties
	 *
	 * This is all about toggling, right?, so this will either
	 * return the size an element would have were it visible, or
	 * a bunch of zeroes (because the next state is nothingness).
	 *
	 * @param DOMElement $el Element.
	 * @param int $duration Transition duration in milliseconds.
	 * @return void|bool Nothing or false.
	 */
	getNext: function(el) {
		if (!el.nodeType) {
			return false;
		}

		// Start with zeroes everywhere.
		var out = this.getNothing();

		// The object is visible, so we want to zero it out.
		if (this.isPainted(el)) {
			return out;
		}

		// If our element is hidden, we need to quickly make a
		// visible clone so we can see what kind of space it would
		// take up.
		var parent = el.parentNode,
			newEl = el.cloneNode(true);

		newEl.removeAttribute('hidden');
		newEl.style.display = 'block';
		newEl.style.visibility = 'visible';
		newEl.style.opacity = 0;

		parent.appendChild(newEl);
		out = this.getCurrent(newEl);
		parent.removeChild(newEl);

		// And return the results.
		return out;
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

		// Start with zeroes everywhere.
		var out = this.getNothing();

		if (!this.isPainted(el)) {
			return out;
		}

		// Computed can give us everything we need.
		var computed = window.getComputedStyle(el, null);

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
	}
};