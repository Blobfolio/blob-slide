/**
 * Blob-slide
 *
 * @version 1.3.0
 * @author Blobfolio, LLC <hello@blobfolio.com>
 * @package blob-slide
 * @license WTFPL <http://www.wtfpl.net>
 *
 * @see https://blobfolio.com
 * @see https://github.com/Blobfolio/blob-slide
 */

var blobSlide = {
	// Keep track of what's animating.
	progress: {},

	/**
	 * Horizontal Slide Toggle
	 *
	 * Slide an element to or from nothingness horizontally.
	 *
	 * @param {DOMElement} el Element.
	 * @param {string} options Transition options.
	 * @returns {void|bool} Nothing or false.
	 */
	hslide: function(el, options) {
		// Recurse?
		if (el instanceof NodeList) {
			const elLength = el.length;
			for (let i = 0; i < elLength; ++i) {
				this.hslide(el[i], options);
			}
			return;
		}

		const next = this.getToggleNext(el, options);
		if (false === next) {
			return false;
		}

		// Focus on left/right stuff.
		const to = {
			width: next.width,
			paddingRight: next.paddingRight,
			paddingLeft: next.paddingLeft,
			marginRight: next.marginRight,
			marginLeft: next.marginLeft,
		};

		return this.slide(el, to, options);
	},

	/**
	 * Vertical Slide Toggle
	 *
	 * Slide an element to or from nothingness vertically.
	 *
	 * @param {DOMElement|NodeList} el Element.
	 * @param {string} options Transition options.
	 * @returns {void|bool} Nothing or false.
	 */
	vslide: function(el, options) {
		// Recurse?
		if (el instanceof NodeList) {
			const elLength = el.length;
			for (let i = 0; i < elLength; ++i) {
				this.vslide(el[i], options);
			}
			return;
		}

		const next = this.getToggleNext(el, options);
		if (false === next) {
			return false;
		}

		// Focus on top/bottom stuff.
		const to = {
			height: next.height,
			paddingTop: next.paddingTop,
			paddingBottom: next.paddingBottom,
			marginTop: next.marginTop,
			marginBottom: next.marginBottom,
		};

		return this.slide(el, to, options);
	},

	/**
	 * Generic Slide
	 *
	 * @param {DOMElement} el Element.
	 * @param {object} to Destination values for width, height, etc.
	 * @param {string} options Transition options.
	 * @returns {void|bool} Nothing or false.
	 */
	slide: function(el, to, options) {
		if (
			! el.nodeType ||
			! this.isObjectFull(to)
		) {
			return false;
		}

		// Stop any in-progress animations.
		const oldKey = parseInt(el.getAttribute('data-progress-key'), 10) || false;
		if (oldKey && this.isDef(this.progress[oldKey])) {
			this.progress[oldKey].abort = true;
		}

		// Make sure we have a sane transition duration.
		if (! this.isObject(options)) {
			options = {};
		}
		options.duration = parseInt(options.duration, 10) || 0;
		if (0 >= options.duration) {
			options.duration = 100;
		}

		// And a somewhat sane display type.
		if (! options.display || ('string' !== typeof options.display)) {
			options.display = 'block';
		}
		else {
			options.display = options.display.toLowerCase();
			if ('none' === options.display) {
				options.display = 'block';
			}
		}

		// Sanitize transition.
		if (! options.transition || (this.isUndef(this.easing[options.transition]))) {
			options.transition = 'linear';
		}

		// Generate a new animation key.
		let progressKey = parseInt((Math.random() + '').replace('.', ''), 10);
		while (this.isDef(this.progress[progressKey])) {
			++progressKey;
		}
		el.setAttribute('data-progress-key', progressKey);
		this.progress[progressKey] = {
			abort: false,
			end: 'hide',
		};

		const from = this.getCurrent(el);
		let propKeys = Object.keys(this.getNothing());
		let props = {};
		let start = null;

		// Find out which properties we should be changing to.
		for (let i in propKeys) {
			if (
				('number' === typeof to[propKeys[i]]) &&
				(to[propKeys[i]] !== from[propKeys[i]])
			) {
				props[propKeys[i]] = [
					from[propKeys[i]],
					to[propKeys[i]],
					to[propKeys[i]] - from[propKeys[i]],
				];
			}
		}

		// Nothing to animate?
		propKeys = Object.keys(props);
		if (! propKeys.length) {
			delete (this.progress[progressKey]);
			el.removeAttribute('data-progress-key');
			return false;
		}

		// Where are we going?
		if (
			(this.isDef(props.width) && 0 < props.width[1]) ||
			(this.isDef(props.height) && 0 < props.height[1])
		) {
			this.progress[progressKey].end = 'show';
		}

		// Make sure the element is visible.
		if (! this.isPainted(el)) {
			el.hidden = null;
			el.style.display = options.display;
		}

		// Hide overflow so transitions look better.
		el.style.overflow = 'hidden';

		/**
		 * Animation Tick
		 *
		 * @param {float} timestamp Timestamp.
		 * @returns {void} Nothing.
		 */
		const tick = function(timestamp) {
			// Did we lose it?
			if (
				blobSlide.isUndef(blobSlide.progress[progressKey]) ||
				blobSlide.progress[progressKey].abort
			) {
				return;
			}

			if (null === start) {
				start = timestamp;
			}

			// Figure out time and scale.
			const elapsed = timestamp - start;
			const progress = Math.min(elapsed / options.duration, 1);
			const scale = blobSlide.easing[options.transition](progress);

			// Update the draw.
			for (let i in propKeys) {
				const oldV = props[propKeys[i]][0];
				const diff = props[propKeys[i]][2];

				el.style[propKeys[i]] = oldV + (diff * scale) + 'px';
			}

			// Call again?
			if (1 > scale) {
				return window.requestAnimationFrame(tick);
			}

			// We've transitioned to somethingness.
			if ('show' === blobSlide.progress[progressKey].end) {
				el.removeAttribute('style');
				el.style.display = options.display;
			}
			// We've transitioned to nothingness.
			else {
				el.hidden = true;
				el.removeAttribute('style');
			}

			delete (blobSlide.progress[progressKey]);
			el.removeAttribute('data-progress-key');
		};

		// Start animating!
		window.requestAnimationFrame(tick);

		// Also, we can delete the old key now.
		if (oldKey) {
			delete (this.progress[oldKey]);
		}
	},

	/**
	 * State of Nothing
	 *
	 * Return an object of properties to animate with everything in a
	 * zeroed-out state.
	 *
	 * @returns {array} Properties.
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
	 * @param {DOMElement} el Element.
	 * @returns {array} Properties.
	 */
	getSomething: function(el) {
		if (! el.nodeType) {
			return false;
		}

		// If our element is hidden, we need to quickly make a
		// visible clone so we can see what kind of space it would
		// take up.
		let parent = el.parentNode;
		let newEl = el.cloneNode(true);

		newEl.hidden = null;
		newEl.removeAttribute('style');
		newEl.style.display = 'block';
		newEl.style.visibility = 'visible';
		newEl.style.opacity = 0;

		parent.appendChild(newEl);
		const out = this.getCurrent(newEl);
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
	 * @param {DOMElement} el Element.
	 * @returns {void|bool} Nothing or false.
	 */
	getNext: function(el) {
		if (! el.nodeType) {
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
	 * Next Toggle
	 *
	 * Figure out the right kind of next for a toggle.
	 *
	 * @param {DOMElement} el Element.
	 * @param {object} options Options.
	 * @returns {object} Next state.
	 */
	getToggleNext: function(el, options) {
		// If there is an animation in-progress, we should force the
		// opposite.
		const progressKey = parseInt(el.getAttribute('data-progress-key'), 10) || false;
		if (progressKey) {
			if ('show' === this.progress[progressKey].end) {
				options.force = 'hide';
			}
			else {
				options.force = 'show';
			}
		}

		if ('show' === options.force) {
			return this.getSomething(el);
		}
		else if ('hide' === options.force) {
			return this.getNothing();
		}
		else {
			return this.getNext(el);
		}
	},

	/**
	 * Current Properties
	 *
	 * Return an element's current sizing.
	 *
	 * @param {DOMElement} el Element.
	 * @param {int} duration Transition duration in milliseconds.
	 * @returns {void|bool} Nothing or false.
	 */
	getCurrent: function(el) {
		if (! el.nodeType) {
			return false;
		}

		if (! this.isPainted(el)) {
			return this.getNothing();
		}

		// Computed can give us everything we need.
		const computed = window.getComputedStyle(el, null);

		// Copy the values over, but make sure everything's a float.
		return {
			width: parseFloat(computed.getPropertyValue('width')) || 0.0,
			height: parseFloat(computed.getPropertyValue('height')) || 0.0,
			paddingTop: parseFloat(computed.getPropertyValue('padding-top')) || 0.0,
			paddingRight: parseFloat(computed.getPropertyValue('padding-right')) || 0.0,
			paddingBottom: parseFloat(computed.getPropertyValue('padding-bottom')) || 0.0,
			paddingLeft: parseFloat(computed.getPropertyValue('padding-left')) || 0.0,
			marginTop: parseFloat(computed.getPropertyValue('margin-top')) || 0.0,
			marginRight: parseFloat(computed.getPropertyValue('margin-right')) || 0.0,
			marginBottom: parseFloat(computed.getPropertyValue('margin-bottom')) || 0.0,
			marginLeft: parseFloat(computed.getPropertyValue('margin-left')) || 0.0,
		};
	},

	/**
	 * Is An Element "Painted"?
	 *
	 * Determine whether or not an element is taking up space in the
	 * DOM. (We don't really care about visibility so much as
	 * existence.)
	 *
	 * @param {DOMElement} el Element.
	 * @returns {void|bool} Nothing or false.
	 */
	isPainted: function(el) {
		if (! el.nodeType || el.hidden) {
			return false;
		}

		const computed = window.getComputedStyle(el, null);
		return 'none' !== computed.display;
	},

	/**
	 * Easing Helpers
	 *
	 * @see {https://gist.github.com/gre/1650294}
	 *
	 */
	easing: {
		/**
		 * Simple Linear
		 *
		 * @param {int} t Timestamp.
		 * @returns {float} Value.
		 */
		linear: function(t) {
			return t;
		},
		/**
		 * Alias: easeInOutCubic
		 *
		 * @param {int} t Timestamp.
		 * @returns {float} Value.
		 */
		ease: function(t) {
			return 0.5 > t ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
		},
		/**
		 * Quad: Accelerate in.
		 *
		 * @param {int} t Timestamp.
		 * @returns {float} Value.
		 */
		easeInQuad: function(t) {
			return t * t;
		},
		/**
		 * Quad: Decelerate out.
		 *
		 * @param {int} t Timestamp.
		 * @returns {float} Value.
		 */
		easeOutQuad: function(t) {
			return t * (2 - t);
		},
		/**
		 * Quad: Accelerate in, decelerate out.
		 *
		 * @param {int} t Timestamp.
		 * @returns {float} Value.
		 */
		easeInOutQuad: function(t) {
			return 0.5 > t ? 2 * t * t : -1 + (4 - 2 * t) * t;
		},
		/**
		 * Cubic: Accelerate in.
		 *
		 * @param {int} t Timestamp.
		 * @returns {float} Value.
		 */
		easeInCubic: function(t) {
			return t * t * t;
		},
		/**
		 * Cubic: Decelerate out.
		 *
		 * @param {int} t Timestamp.
		 * @returns {float} Value.
		 */
		easeOutCubic: function(t) {
			return (--t) * t * t + 1;
		},
		/**
		 * Cubic: Accelerate in, decelerate out.
		 *
		 * @param {int} t Timestamp.
		 * @returns {float} Value.
		 */
		easeInOutCubic: function(t) {
			return 0.5 > t ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
		},
		/**
		 * Quarter: Accelerate in.
		 *
		 * @param {int} t Timestamp.
		 * @returns {float} Value.
		 */
		easeInQuart: function(t) {
			return t * t * t * t;
		},
		/**
		 * Quarter: Decelerate out.
		 *
		 * @param {int} t Timestamp.
		 * @returns {float} Value.
		 */
		easeOutQuart: function(t) {
			return 1 - (--t) * t * t * t;
		},
		/**
		 * Quarter: Accelerate in, decelerate out.
		 *
		 * @param {int} t Timestamp.
		 * @returns {float} Value.
		 */
		easeInOutQuart: function(t) {
			return 0.5 > t ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
		},
		/**
		 * Quint: Accelerate in.
		 *
		 * @param {int} t Timestamp.
		 * @returns {float} Value.
		 */
		easeInQuint: function(t) {
			return t * t * t * t * t;
		},
		/**
		 * Quint: Decelerate out.
		 *
		 * @param {int} t Timestamp.
		 * @returns {float} Value.
		 */
		easeOutQuint: function(t) {
			return 1 + (--t) * t * t * t * t;
		},
		/**
		 * Quint: Accelerate in, decelerate out.
		 *
		 * @param {int} t Timestamp.
		 * @returns {float} Value.
		 */
		easeInOutQuint: function(t) {
			return 0.5 > t ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
		},
	},

	/**
	 * Is Defined
	 *
	 * @param {mixed} v Value.
	 * @returns {bool} True/false.
	 */
	isDef: function(v) {
		return (undefined !== v) && (null !== v);
	},

	/**
	 * Is Object
	 *
	 * @param {mixed} v Value.
	 * @returns {bool} True/false.
	 */
	isObject: function(v) {
		return (null !== v) && ('object' === typeof v);
	},

	/**
	 * Is Object (Full)
	 *
	 * @param {mixed} v Value.
	 * @returns {bool} True/false.
	 */
	isObjectFull: function(v) {
		if (! this.isObject(v)) {
			return false;
		}

		for (let i in v) {
			return true;
		}

		return false;
	},

	/**
	 * Is Undefined
	 *
	 * @param {mixed} v Value.
	 * @returns {bool} True/false.
	 */
	isUndef: function(v) {
		return (undefined === v) || (null === v);
	},
};
