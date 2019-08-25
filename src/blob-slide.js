/**
 * Blob-slide
 *
 * @version 1.3.1
 * @author Blobfolio, LLC <hello@blobfolio.com>
 * @package blob-slide
 * @license WTFPL <http://www.wtfpl.net>
 *
 * @see https://github.com/Blobfolio/blob-slide
 * @see https://blobfolio.com
 */

(function() {
	// Keep track of what's going on.
	let slideProgress = {};

	/**
	 * Easing Helpers
	 *
	 * @see {https://gist.github.com/gre/1650294}
	 */
	const easing = {
		/**
		 * Simple Linear
		 *
		 * @param {number} t Timestamp.
		 * @returns {number} Value.
		 */
		linear: function(t) {
			return t;
		},
		/**
		 * Alias: easeInOutCubic
		 *
		 * @param {number} t Timestamp.
		 * @returns {number} Value.
		 */
		ease: function(t) {
			return 0.5 > t ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
		},
		/**
		 * Quad: Accelerate in.
		 *
		 * @param {number} t Timestamp.
		 * @returns {number} Value.
		 */
		easeInQuad: function(t) {
			return t * t;
		},
		/**
		 * Quad: Decelerate out.
		 *
		 * @param {number} t Timestamp.
		 * @returns {number} Value.
		 */
		easeOutQuad: function(t) {
			return t * (2 - t);
		},
		/**
		 * Quad: Accelerate in, decelerate out.
		 *
		 * @param {number} t Timestamp.
		 * @returns {number} Value.
		 */
		easeInOutQuad: function(t) {
			return 0.5 > t ? 2 * t * t : -1 + (4 - 2 * t) * t;
		},
		/**
		 * Cubic: Accelerate in.
		 *
		 * @param {number} t Timestamp.
		 * @returns {number} Value.
		 */
		easeInCubic: function(t) {
			return t * t * t;
		},
		/**
		 * Cubic: Decelerate out.
		 *
		 * @param {number} t Timestamp.
		 * @returns {number} Value.
		 */
		easeOutCubic: function(t) {
			return (--t) * t * t + 1;
		},
		/**
		 * Cubic: Accelerate in, decelerate out.
		 *
		 * @param {number} t Timestamp.
		 * @returns {number} Value.
		 */
		easeInOutCubic: function(t) {
			return 0.5 > t ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
		},
		/**
		 * Quarter: Accelerate in.
		 *
		 * @param {number} t Timestamp.
		 * @returns {number} Value.
		 */
		easeInQuart: function(t) {
			return t * t * t * t;
		},
		/**
		 * Quarter: Decelerate out.
		 *
		 * @param {number} t Timestamp.
		 * @returns {number} Value.
		 */
		easeOutQuart: function(t) {
			return 1 - (--t) * t * t * t;
		},
		/**
		 * Quarter: Accelerate in, decelerate out.
		 *
		 * @param {number} t Timestamp.
		 * @returns {number} Value.
		 */
		easeInOutQuart: function(t) {
			return 0.5 > t ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
		},
		/**
		 * Quint: Accelerate in.
		 *
		 * @param {number} t Timestamp.
		 * @returns {number} Value.
		 */
		easeInQuint: function(t) {
			return t * t * t * t * t;
		},
		/**
		 * Quint: Decelerate out.
		 *
		 * @param {number} t Timestamp.
		 * @returns {number} Value.
		 */
		easeOutQuint: function(t) {
			return 1 + (--t) * t * t * t * t;
		},
		/**
		 * Quint: Accelerate in, decelerate out.
		 *
		 * @param {number} t Timestamp.
		 * @returns {number} Value.
	 */
		easeInOutQuint: function(t) {
			return 0.5 > t ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
		},
	};

	/**
	 * Current Properties
	 *
	 * Return an element's current sizing.
	 *
	 * @param {Element} el Element.
	 * @returns {boolean|Object} Properties or false.
	 */
	function getCurrent(el) {
		if (! el.nodeType) {
			return false;
		}

		if (! isPainted(el)) {
			return getNothing();
		}

		// Computed can give us everything we need.
		const computed = window.getComputedStyle(el, null);

		// Copy the values over, but make sure everything's a float.
		return {
			width: parseFloat(computed.width) || 0.0,
			height: parseFloat(computed.height) || 0.0,
			paddingTop: parseFloat(computed.paddingTop) || 0.0,
			paddingRight: parseFloat(computed.paddingRight) || 0.0,
			paddingBottom: parseFloat(computed.paddingBottom) || 0.0,
			paddingLeft: parseFloat(computed.paddingLeft) || 0.0,
			marginTop: parseFloat(computed.marginTop) || 0.0,
			marginRight: parseFloat(computed.marginRight) || 0.0,
			marginBottom: parseFloat(computed.marginBottom) || 0.0,
			marginLeft: parseFloat(computed.marginLeft) || 0.0,
		};
	}

	/**
	 * Next Properties
	 *
	 * This is all about toggling, right?, so this will either
	 * return the size an element would have were it visible, or
	 * a bunch of zeroes (because the next state is nothingness).
	 *
	 * @param {Element} el Element.
	 * @returns {boolean|Object} Properties or false.
	 */
	function getNext(el) {
		if (! el.nodeType) {
			return false;
		}

		// The object is visible, so we want to zero it out.
		if (isPainted(el)) {
			return getNothing();
		}

		// And return the results.
		return getSomething(el);
	}

	/**
	 * State of Nothing
	 *
	 * Return an object of properties to animate with everything in a
	 * zeroed-out state.
	 *
	 * @returns {Object} Properties.
	 */
	function getNothing() {
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
	}

	/**
	 * State of Something
	 *
	 * Clone an object to find its natural dimensions.
	 *
	 * @param {Element} el Element.
	 * @returns {boolean|Object} Properties or false.
	 */
	function getSomething(el) {
		if (! el.nodeType) {
			return false;
		}

		// If our element is hidden, we need to quickly make a
		// visible clone so we can see what kind of space it would
		// take up.
		const parent = el.parentNode;
		const newEl = el.cloneNode(true);

		newEl.hidden = null;
		newEl.style.cssText = 'display:block;visibility:visible;opacity:0';

		parent.appendChild(newEl);
		const out = getCurrent(newEl);
		parent.removeChild(newEl);

		return out;
	}

	/**
	 * Next Toggle
	 *
	 * Figure out the right kind of next for a toggle.
	 *
	 * @param {Element} el Element.
	 * @param {Object} options Options.
	 * @returns {boolean|Object} Properties or false.
	 */
	function getToggleNext(el, options) {
		// If there is an animation in-progress, we should force the
		// opposite.
		const progressKey = parseInt(el.getAttribute('data-progress-key'), 10) || false;
		if (progressKey) {
			if ('show' === slideProgress[progressKey].end) {
				options.force = 'hide';
			}
			else {
				options.force = 'show';
			}
		}

		if ('show' === options.force) {
			return getSomething(el);
		}
		else if ('hide' === options.force) {
			return getNothing();
		}
		else {
			return getNext(el);
		}
	}

	/**
	 * Is Defined
	 *
	 * @param {*} v Value.
	 * @returns {boolean} True/false.
	 */
	function isDef(v) {
		return (undefined !== v) && (null !== v);
	}

	/**
	 * Is Object
	 *
	 * @param {*} v Value.
	 * @returns {boolean} True/false.
	 */
	function isObject(v) {
		return (null !== v) && ('object' === typeof v);
	}

	/**
	 * Is An Element "Painted"?
	 *
	 * Determine whether or not an element is taking up space in the
	 * DOM. (We don't really care about visibility so much as
	 * existence.)
	 *
	 * @param {Element} el Element.
	 * @returns {void|boolean} Nothing or false.
	 */
	function isPainted(el) {
		if (! el.nodeType || el.hidden) {
			return false;
		}

		const computed = window.getComputedStyle(el, null);
		return 'none' !== computed.display;
	}

	/**
	 * Is Object (Full)
	 *
	 * @param {*} v Value.
	 * @returns {boolean} True/false.
	 */
	function isObjectFull(v) {
		if (! isObject(v)) {
			return false;
		}

		for (let i in v) {
			return true;
		}

		return false;
	}

	/**
	 * Is Undefined
	 *
	 * @param {*} v Value.
	 * @returns {boolean} True/false.
	 */
	function isUndef(v) {
		return (undefined === v) || (null === v);
	}

	// Finally, our object!
	window.blobSlide = {
		/**
		 * Horizontal Slide Toggle
		 *
		 * Slide an element to or from nothingness horizontally.
		 *
		 * @param {Element} el Element.
		 * @param {Object} options Transition options.
		 * @returns {void} Nothing.
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

			const next = getToggleNext(el, options);
			if (false === next) {
				return;
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
		 * @param {Element|NodeList} el Element.
		 * @param {Object} options Transition options.
		 * @returns {void} Nothing.
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

			const next = getToggleNext(el, options);
			if (false === next) {
				return;
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
		 * @param {Element} el Element.
		 * @param {Object} to Destination values for width, height, etc.
		 * @param {Object} options Transition options.
		 * @returns {void} Nothing.
		 *
		 * @suppress {missingProperties}
		 */
		slide: function(el, to, options) {
			if (
				! el.nodeType ||
				! isObjectFull(to)
			) {
				return;
			}

			// Stop any in-progress animations.
			const oldKey = parseInt(el.getAttribute('data-progress-key'), 10) || false;
			if (oldKey && isDef(slideProgress[oldKey])) {
				slideProgress[oldKey].abort = true;
			}

			// Make sure we have a sane transition duration.
			if (! isObject(options)) {
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
			if (! options.transition || (isUndef(easing[options.transition]))) {
				options.transition = 'linear';
			}

			// Generate a new animation key.
			let progressKey = parseInt((Math.random() + '').replace('.', ''), 10);
			while (isDef(slideProgress[progressKey])) {
				++progressKey;
			}
			el.setAttribute('data-progress-key', progressKey);
			slideProgress[progressKey] = {
				abort: false,
				end: 'hide',
			};

			const from = getCurrent(el);
			/** @suppress {checkTypes} */
			let propKeys = Object.keys(getNothing());
			let props = {};
			let start = null;

			// Find out which properties we should be changing to. As we're starting from a blank slate, "10" is the number of properties included.
			for (let i = 0; 10 > i; ++i) {
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
			const propKeysLength = propKeys.length;
			if (! propKeysLength) {
				delete (slideProgress[progressKey]);
				el.removeAttribute('data-progress-key');
				return;
			}

			// Where are we going?
			if (
				(isDef(props.width) && 0 < props.width[1]) ||
				(isDef(props.height) && 0 < props.height[1])
			) {
				slideProgress[progressKey].end = 'show';
			}

			// Make sure the element is visible.
			if (! isPainted(el)) {
				el.hidden = null;
				el.style.display = options.display;
			}

			// Hide overflow so transitions look better.
			el.style.overflow = 'hidden';

			/**
			 * Animation Tick
			 *
			 * @param {number} timestamp Timestamp.
			 * @returns {void} Nothing.
			 */
			const tick = function(timestamp) {
				// Did we lose it?
				if (
					isUndef(slideProgress[progressKey]) ||
					slideProgress[progressKey].abort
				) {
					return;
				}

				if (null === start) {
					start = timestamp;
				}

				// Figure out time and scale.
				const elapsed = timestamp - start;
				const progress = Math.min(elapsed / options.duration, 1);
				const scale = easing[options.transition](progress);

				// Update the draw.
				for (let i = 0; i < propKeysLength; ++i) {
					const oldV = props[propKeys[i]][0];
					const diff = props[propKeys[i]][2];

					el.style[propKeys[i]] = oldV + (diff * scale) + 'px';
				}

				// Call again?
				if (1 > scale) {
					window.requestAnimationFrame(tick);
					return;
				}

				// We've transitioned to somethingness.
				if ('show' === slideProgress[progressKey].end) {
					el.style.display = options.display;
				}
				// We've transitioned to nothingness.
				else {
					el.hidden = true;
					el.style = null;
				}

				delete (slideProgress[progressKey]);
				el.removeAttribute('data-progress-key');
			};

			// Start animating!
			window.requestAnimationFrame(tick);

			// Also, we can delete the old key now.
			if (oldKey) {
				delete (slideProgress[oldKey]);
			}
		},
	};
})();
