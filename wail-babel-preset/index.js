module.exports = {
  presets: [
    require("babel-preset-react"),
  ],
  plugins: [
    // es2015
    require("babel-plugin-transform-es2015-classes"),
    require("babel-plugin-transform-es2015-object-super"),
    // es2015 not yet implemented:
    require("babel-plugin-transform-es2015-modules-commonjs"),
    // The following is still required because babel does not properly
    // recognize when spreads are being used inside of object
    // destructuring (ES7).
    require("babel-plugin-transform-es2015-destructuring"),

    // Stage 3
    require("babel-plugin-transform-async-to-generator"),
    require("babel-plugin-transform-exponentiation-operator"),

    // Stage 2
    require("babel-plugin-syntax-trailing-function-commas"),

    // Stage 1
    require("babel-plugin-transform-class-constructor-call"),
    require("babel-plugin-transform-class-properties"),
    require("babel-plugin-transform-decorators-legacy"),
    require("babel-plugin-transform-export-extensions"),

    // Stage 0
    require("babel-plugin-transform-do-expressions"),
    require("babel-plugin-transform-function-bind"),
  ]
}
