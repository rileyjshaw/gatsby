/* @flow weak */
import toml from 'toml'
import fs from 'fs'

function getConfig (directory, callback) {
  let config
  try {
    config = toml.parse(fs.readFileSync(`${directory}/config.toml`))
  } catch (error) {
    console.log("Couldn't load your site config")
    if (callback) {
      callback(error)
    }
  }

  return config
}

module.exports = getConfig
