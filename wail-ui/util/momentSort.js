import moment from 'moment'
import _ from 'lodash/fp'

const momentSort = (m1, m2) => {
  if (m1.isBefore(m2)) {
    return -1
  } else if (m1.isSame(m2)) {
    return 0
  } else {
    return 1
  }
}

const momentSortRev = (m1, m2) => {
  if (m1.isBefore(m2)) {
    return 1
  } else if (m1.isSame(m2)) {
    return 0
  } else {
    return -1
  }
}

export {
  momentSort,
  momentSortRev
}

