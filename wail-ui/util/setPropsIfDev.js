import { setPropTypes, compose } from 'recompose'
import curry from 'lodash/curry'

export function setPropsRecompose (props, ...funcs) {
  if (process.NODE_ENV !== 'production') {
    return compose(...funcs, setPropTypes(props))
  }
  return compose(...funcs)
}

export function setProps (props, Component) {
  if (process.NODE_ENV !== 'production') {
    console.log('setting props')
    Component.propTypes = props
  }
  return Component
}


export function setPropsCurried (props) {
  return curry(setProps)(props)
}