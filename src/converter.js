import camelize from './utils/camelize'

function capitalize(val) {
  return val.charAt(0).toUpperCase() + val.slice(1)
}
// Add a comment
function styleToObject(style) {
  return style
    .split(';')
    .map(s => s.trim())
    .filter(s => s)
    .reduce((acc, pair) => {
      const i = pair.indexOf(':')
      const prop = camelize(pair.slice(0, i))
      const value = pair.slice(i + 1).trim()

      prop.startsWith('webkit')
        ? (acc[capitalize(prop)] = value)
        : (acc[prop] = value)

      return acc
    }, {})
}

function convert(createElement, element, extraProps = {}) {
  if (typeof element === 'string') {
    return element
  }

  const children = (element.children || []).map(child => {
    return convert(createElement, child)
  })

  const mixins = Object.keys(element.attributes || {}).reduce(
    (acc, key) => {
      const val = element.attributes[key]

      switch (key) {
        case 'class':
          acc.attrs['className'] = val
          delete element.attributes['class']
          break
        case 'style':
          acc.attrs['style'] = styleToObject(val)
          break
        default:
          if (key.indexOf('aria-') === 0 || key.indexOf('data-') === 0) {
            acc.attrs[key.toLowerCase()] = val
          } else {
            acc.attrs[camelize(key)] = val
          }
      }

      return acc
    },
    { attrs: {} }
  )

  const { style: existingStyle = {}, ...remaining } = extraProps

  mixins.attrs['style'] = { ...mixins.attrs['style'], ...existingStyle }

  return createElement(
    element.tag,
    { ...mixins.attrs, ...remaining },
    ...children
  )
}

export default convert
