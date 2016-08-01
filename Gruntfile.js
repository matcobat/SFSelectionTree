module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({


        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            selectiontree: {
                files: [{
                    expand: true,
                    src: [
                        'src/selectionTree.js'
                    ],
                    ext: '.annotated.js'
                }]
            }
        },


        uglify: {
            selectiontree: {
                files: [{
                    'dist/selectionTree.min.js': [
                        'src/selectionTree.annotated.js'
                    ]
                }]
            }
        },

        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'dist/selectionTree.min.css': ['dist/selectionTree.css']
                }
            }
        },

        jshint: {
            ignore_warning: {
                options: {
                    '-W055': false,
                    '-W041': false,
                    '-W083': false,
                    '-W069': false,
                    '-W004': false,
                    '-W064': false,
                    '-W061': false,
                    '-W018': false,
                    '-W043': false
                },
                src: [
                    'src/**/*.js'
                ]
            },

        },






        copy: {
            js: {
                files: [{
                    expand: false,
                    src: ['src/selectionTree.annotated.js'],
                    dest: 'dist/selectionTree.js'
                }]
            },
            css: {
                files: [{
                    expand: false,
                    src: ['src/selectionTree.css'],
                    dest: 'dist/selectionTree.css'
                }]
            }
        }


    });

    grunt.registerTask('default', [
        'jshint', 'ngAnnotate:selectiontree', 'uglify:selectiontree', 'copy:js', 'copy:css', 'cssmin'
    ]);


};
