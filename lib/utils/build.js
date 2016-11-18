/* @flow weak */
import _ from 'lodash'

import buildCSS from './build-css'
import buildHTML from './build-html'
import buildProductionBundle from './build-javascript'
import postBuild from './post-build'
import globPages from './glob-pages'
import getConfig from './get-config'

function customPost (program, callback) {
  const directory = program.directory
  let customPostBuild
  try {
    // $FlowIssue - https://github.com/facebook/flow/issues/1975
    const gatsbyNodeConfig = require(`${directory}/gatsby-node`)
    customPostBuild = gatsbyNodeConfig.postBuild
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND' && !_.includes(e.Error, 'gatsby-node')) {
      console.log('Failed to load gatsby-node.js, skipping custom post build script', e)
    }
  }

  if (customPostBuild) {
    console.log('Performing custom post-build steps')

    return globPages(directory, (globError, pages) =>
      customPostBuild(pages, (error) => {
        if (error) {
          console.log('customPostBuild function failed')
          callback(error)
        }
        return callback()
      })
    )
  }

  return callback()
}

function post (program, config, callback) {
  console.log('Copying assets')

  postBuild(program, config, (error) => {
    if (error) {
      console.log('failed to copy assets')
      return callback(error)
    }

    return customPost(program, callback)
  })
}

function bundle (program, config, callback) {
  console.log('Compiling production bundle.js')

  buildProductionBundle(program, (error) => {
    if (error) {
      console.log('failed to compile bundle.js')
      return callback(error)
    }

    return post(program, config, callback)
  })
}

function html (program, callback) {
  const directory = program.directory
  const config = getConfig(directory, callback)

  console.log('Generating CSS')
  buildCSS(program, config, (cssError) => {
    if (cssError) {
      console.log('Failed at generating styles.css')
      return callback(cssError)
    }

    console.log('Generating Static HTML')
    return buildHTML(program, config, (htmlError) => {
      if (htmlError) {
        console.log('Failed at generating HTML')
        return callback(htmlError)
      }

      // If we're not generating javascript, go directly to post build steps
      if (config.noProductionJavascript) {
        return post(program, config, callback)
      } else {
        return bundle(program, config, callback)
      }
    })
  })
}

module.exports = html
