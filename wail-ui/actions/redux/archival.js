import wc from '../../constants/wail-constants'
import {CheckUrlEvents} from '../../constants/wail-constants'
const {
  CHECK_URL,
  CHECKING_ARCHIVE,
  NOT_IN_ARCHIVE,
  IN_ARCHIVE,
  RESET_CHECK_MESSAGE,
} = CheckUrlEvents
const {
  EMPTY_URL,
  HAS_VAILD_URI
} = wc.EventTypes

export const inArchive = (captures) => ({
  type: IN_ARCHIVE,
  captures
})

export const notInArchive = (message) => ({
  type: NOT_IN_ARCHIVE,
  message
})

export const checkingArchive = (message) => ({
  type: CHECKING_ARCHIVE,
  message
})

export const checkUrl = (url, forCol) => ({
  type: CHECK_URL,
  url,
  forCol
})

export const resetCheckMessage = () => ({
  type: RESET_CHECK_MESSAGE
})

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
