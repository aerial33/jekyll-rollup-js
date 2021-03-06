import glob from "glob"
import path from "path"
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from "@rollup/plugin-commonjs"

import { terser } from "rollup-plugin-terser"

const absolutePath = dirPath => path.resolve(__dirname, dirPath)
const scriptFiles = glob.sync(absolutePath("source/_scripts/**/!(_)*.js"))
const scriptsTarget = "source/assets/js/"

const inputs = scriptFiles.reduce((files, input) => {
  const parts = input.split("/")
  const fileKey = parts[parts.length -1]
  return { [fileKey]: absolutePath(input), ...files }
}, {})

const outputs = Object.keys(inputs).reduce((files, file) => {
  const inputPath = inputs[file]
  const parts = inputPath.split("/")
  const pathIndex = parts.indexOf("_scripts") +1
  const outputPath = parts.slice(pathIndex).join("/")
  return { [file]: absolutePath(scriptsTarget + outputPath), ...files }
}, {})

const bundles = Object.keys(inputs).map(key => {
  const prodEnv = process.env.BABEL_ENV === 'production'

  const plugins = [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: ['node_modules/**'],
      comments: false,
    }),
  ]

  let sourcemap = true

  if (prodEnv) {
    plugins.push(terser())
    sourcemap = false
  }

  return {
    input: inputs[key],
    output: {
      file: outputs[key],
      format: "iife",
      sourcemap,
    },
    plugins,
  }
})

export default bundles