import {List} from 'immutable'

export default  (state = List(), action) => {
  console.log('in collection names reducer', action)
  switch (action.type) {
    case 'got-all-collections':
      return state.merge(action.cols.map(col => col.colName))
    case 'created-collection':
      return state.push(action.col.colName)
    default:
      return state
  }
}

