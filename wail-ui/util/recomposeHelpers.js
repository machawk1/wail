import {
  branch,
  compose,
  onlyUpdateForKeys,
  pure,
  renderComponent,
  setDisplayName,
  setPropTypes,
  shouldUpdate,
} from 'recompose'

const setProps = (props, ...funcs) => {
  if (process.NODE_ENV !== 'production') {
    return compose(...funcs, setPropTypes(props))
  }
  return compose(...funcs)
}

const namedPure = name => compose(setDisplayName(name), pure)

const applyNamedPure = (name, Component) => namedPure(name)(Component)

const namedUpdateKeys = (name, keys) => compose(setDisplayName(name), onlyUpdateForKeys(keys))

const displayWhich = (component, test) =>
  shouldDisplay => branch(
    props => shouldDisplay(props),
    renderComponent(component)
  )(test)

const updateWhen = when => shouldUpdate(when)

const namedUpdateWhenBranch = (name, when, component, test) =>
  compose(
    setDisplayName(name),
    shouldUpdate(when),
    displayWhich(component, test)
  )

export {
  namedPure,
  applyNamedPure,
  namedUpdateKeys,
  displayWhich,
  updateWhen,
  namedUpdateWhenBranch,
  setProps
}
