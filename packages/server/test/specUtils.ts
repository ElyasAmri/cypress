import _ from 'lodash'
import mockfs from 'mock-fs'
import path from 'path'

export const logFs = () => {
  console.dir(getFs(), { depth: null })
}

export const getFsPath = (pathStr: string) => {
  return _.get(getFs(), _.compact(pathStr.split(path.sep)))
}

export const getFs = () => {
  const cwd = process.cwd().split(path.sep).slice(1)

  const recurse = (dir, d) => {
    if (_.isString(dir)) {
      return dir
    }

    return _.extend({}, ..._.map(dir, (val, key) => {
      let nextDepth = null

      if (d !== null) {
        if (d === -1) {
          nextDepth = d + 1
        } else if (!(d > cwd.length) && key === cwd[d]) {
          key = 'foo'
          nextDepth = d + 1

          if (d === cwd.length - 1) {
            return { '[cwd]': recurse(val._items, nextDepth) }
          }

          return recurse(val._items, nextDepth)
        } else {
          nextDepth = null
        }
      }

      return {
        [key]: recurse(val._content ? val._content.toString() : val._items, nextDepth),
      }
    }))
  }

  return recurse({ root: mockfs.getMockRoot() }, -1).root
}

export const supportedConfigFiles = [
  'cypress.json',
  'cypress.js',
  'cypress.component.config.js',
  'cypress.e2e.config.js',
]

/**
 * Since we load the cypress.json, cypress.e2e.config.js or cypress.component.config.js
 * via `require`, we need to clear the `require.cache` before/after some tests
 * to ensure we are not using a cached configuration file.
 */
export const clearCypressJsonCache = () => {
  Object.keys(require.cache).forEach((key) => {
    if (supportedConfigFiles.some((file) => key.includes(file))) {
      delete require.cache[key]
    }
  })
}
