module.exports = function(grunt) {

  grunt.initConfig({
    ngmin: {
      directives: {
        src: ['src/*.js'],
        dest: 'build/directives.js'
      }
    },
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist: {
        src: ['build/*.js'],
        dest: 'dist/angular-cog.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> */'
      },
      dist: {
        src: 'dist/angular-cog.js',
        dest: 'dist/angular-cog.min.js'
      }
    },
    clean: ["build"],
    watch: {
      scripts: {
        files: ['src/**/*.js', 'tests/**/*.js'],
        tasks: ['ngmin', 'uglify', 'clean', 'karma:unit:run'],
        options: {
          debounceDelay: 250,
        },
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        // run karma in the background
        background: true,
        // which browsers to run the tests on
        browsers: ['Chrome']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('default', ['ngmin', 'concat', 'uglify', 'clean', 'karma:unit:run']);

};