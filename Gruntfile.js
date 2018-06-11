/*global module:false*/
module.exports = function(grunt) {

	//Project configuration.
	grunt.initConfig({
		//Metadata.
		pkg: grunt.file.readJSON('package.json'),

		// JS Hint.
		eslint: {
			check: {
				src: ['src/blob-slide.js'],
			},
			fix: {
				options: {
					fix: true,
				},
				src: ['src/blob-slide.js'],
			}
		},

		// Minification.
		uglify: {
			options: {
				mangle: true
			},
			my_target: {
				files: {
					'blob-slide.min.js': ['src/blob-slide.js']
				}
			}
		},

		// Watcher.
		watch: {
			scripts: {
				files: ['src/*.js'],
				tasks: ['javascript', 'notify:js'],
				options: {
					spawn: false
				},
			}
		},

		// Notifications.
		notify: {
			js: {
				options: {
					title: "Javascript Done",
					message: "JS has been linted, compiled, and minified."
				}
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-uglify-es');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-notify');

	// Tasks.
	grunt.registerTask('javascript', ['eslint', 'uglify']);

	grunt.event.on('watch', function(action, filepath, target) {
		grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
	});
};
