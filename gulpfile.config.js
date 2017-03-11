'use strict';
var GulpConfig = (function () {
    function gulpConfig() {
        //Got tired of scrolling through all the comments so removed them
        //Don't hurt me AC :-)
        this.dist = './dist/';
        this.source = './src/';
        this.sourceApp = this.source + 'app/';
        this.sass = this.source + 'sass/';

        this.tsOutputPath = this.source + '/js';
        this.allJavaScript = [this.source + '/js/**/*.js'];
        this.allTypeScript = this.sourceApp + '/**/*.ts';
        
        this.sassOutputPath = this.source + '/css';
        this.allCss = [this.source + '/css/**/*.css'];
        this.allSass = this.sass + '/**/*.scss';

        this.typings = './typings/';
this.libraryTypeScriptDefinitions = './typings/main/**/*.ts';
    }
    return gulpConfig;
})();
module.exports = GulpConfig;