/*global module:false*/
module.exports = function(grunt) {

	//Project configuration.
	grunt.initConfig({
		//Metadata.
		pkg: grunt.file.readJSON('package.json'),

		// JS Hint.
		jshint: {
			all: ['src/blob-slide.js']
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
					title: "JS Files Built",
					message: "Uglify and JSHint task complete"
				}
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-notify');

	// Tasks.
	grunt.registerTask('javascript', ['jshint', 'uglify']);

	grunt.event.on('watch', function(action, filepath, target) {
		grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
	});
};