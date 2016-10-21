import wc from '../../constants/wail-constants'

const {
  EMPTY_URL,
  HAS_VAILD_URI
} = wc.EventTypes

export const updateArchiveUrl = url => {
  return {
    type: HAS_VAILD_URI,
    url
  }
}

export const emptyUrl = () => {
  return {
    type: EMPTY_URL,
    url: ''
  }
}
