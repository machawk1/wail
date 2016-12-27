import {Header} from '../constants/wail-constants'

export const openClose = open => ({
  type: Header.HEADER_OPEN_CLOSE,
  open
})

export const locationChange = location => ({
  type: Header.HEADER_LOCATION,
  location
})

export const toggle = () => ({ type: Header.HEADER_TOGGLE })
