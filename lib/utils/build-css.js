/* @flow weak */
import webpack from 'webpack'
import webpackConfig from './webpack.config'
import fs from 'fs'

module.exports = (program, config, callback) => {
  const { directory } = program
  const { outDir = 'public' } = config

  const compilerConfig = webpackConfig(program, directory, 'build-css')

  return webpack(compilerConfig.resolve()).run((err, stats) => {
    // We don't want any javascript produced by this step in the process.
    fs.unlinkSync(`${directory}/${outDir}/bundle-for-css.js`)

    return callback(err, stats)
  })
}
