'use strict'
var GulpConfig = (function () {
  function gulpConfig () {
    this.dist = './dist/'
    this.source = './src/'

    this.tsOutputPath = this.dist + '/js'
    this.allJavaScript = [this.dist + '/js/**/*.js']
    this.allTypeScript = this.source + '/**/*.ts'

    this.typings = './typings/'
    this.libraryTypeScriptDefinitions = './typings/main/**/*.ts'
  }
  return gulpConfig
})()
module.exports = GulpConfig
