module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			dist: {
				files: {
					'public/stylesheets/public.css' : 'app/stylesheets/public.scss',
					'public/stylesheets/desktop.css' : 'app/stylesheets/desktop.scss',
					'public/stylesheets/mobile.css' : 'app/stylesheets/mobile.scss'
				}
			}
		},
    coffee: {
      compile: {
        options: {
          join: true
        },
        files: {
          'public/js/desktop.js': ['desktop/**/*.coffee'],
          'public/js/mobile.js': ['mobile/**/*.coffee']
        }
      }
    },
		watch: {
			css: {
				files: '**/*.scss',
				tasks: ['sass']
			},
      coffee: {
        files: '**/*.coffee',
        tasks: ['coffee']
      }
		}
	});
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.registerTask('default',['watch']);
}
