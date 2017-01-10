import { setPropTypes, compose } from 'recompose'

export const setPropsRecompose = (props, ...funcs) => {
  if (process.NODE_ENV !== 'production') {
    return compose(...funcs, setPropTypes(props))
  }
  return compose(...funcs)
}

export const setProps = (props, Component) => {
  if (process.NODE_ENV !== 'production') {
    Component.propTypes = props
  }
  return Component
}
