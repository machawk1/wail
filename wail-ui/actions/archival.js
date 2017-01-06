import wc from '../constants/wail-constants'
import {CheckUrlEvents} from '../constants/wail-constants'
const {
  CHECK_URL,
  CHECKING_URL,
  CHECKING_DONE,
  CHECKING_DONE_ERROR,
  RESET_CHECK_MESSAGE
} = CheckUrlEvents
const {
  EMPTY_URL,
  HAS_VAILD_URI
} = wc.EventTypes

export const checkDone = (result) => ({
  type: CHECKING_DONE,
  result
})

export const checkDoneError = (result) => ({
  type: CHECKING_DONE_ERROR,
  result
})

export const checkingUrl = (message) => ({
  type: CHECKING_URL,
  message
})

export const checkUrl = url => ({
  type: CHECK_URL,
  url
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
