import Promise from 'bluebird'
import {AddSeedFromFsEvents} from '../../constants/wail-constants'
import {extractSeeds, WarcUtilError} from '../../../wail-core/util/warcUtils'
import {SubmissionError, reset as resetForm} from 'redux-form'
const {
  ADD_SEED, ADDING_SEED, ADDING_SEED_DONE,
  ADDING_SEED_DONE_ERROR, RESET_ADD_SEED_MESSAGE
} = AddSeedFromFsEvents

export const checkDone = (result) => ({
  type: ADDING_SEED_DONE,
  ...result
})

export const checkDoneError = (result) => ({
  type: ADDING_SEED_DONE_ERROR,
  result
})

export const checkingFSSeed = (message) => ({
  type: ADDING_SEED,
  message
})

export const checkSeed = (seedPath, mode) => ({
  type: ADD_SEED,
  seedPath,
  mode
})

export const resetAddFSSeedMessage = () => resetForm('fsSeedDiscovery')

export const doSeedExtraction = (seedPath, mode = 'f') =>
  new Promise((resolve, reject) =>
    extractSeeds(seedPath, mode)
      .then(extractedSeeds => {
        resolve(extractedSeeds)
      })
      .catch(error => {
        reject(error)
      })
  )

