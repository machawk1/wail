import {remote} from 'electron'
import {JobActionEvents, RequestActions, EventTypes} from '../../constants/wail-constants'
import _ from 'lodash'
import util from 'util'
const settings = remote.getGlobal('settings')
const { START_JOB, RESTART_JOB, REMOVE_JOB, DELETE_JOB, TERMINATE_JOB } = JobActionEvents
const logString = 'heritirx-actions %s'
const logStringError = 'heritirx-actions error where[ %s ] stack [ %s ]'

const {
  MAKE_REQUEST,
  HANDLED_REQUEST
} = RequestActions

const buildJob = (jobId) => {
  console.log(jobId)
  window.logger.debug(`build heritrix job ${jobId}`)
  let options = _.cloneDeep(settings.get('heritrix.buildOptions'))
  console.log('options url before setting', options.url)
  options.url = `${options.url}${jobId}`
  console.log(options)
  console.log('options url before setting', options.url)
  // options.agent = httpsAgent
  console.log(`building heritrix job ${jobId}`)
  console.log('Options after setting options.url', options.url)
  window.logger.info(util.format(logString, `building heritrix job ${jobId} with options ${options}`))
  return {
    type: MAKE_REQUEST,
    request: {
      opts: options,
      from: `buildHeritrixJob[${jobId}]`,
      jId: jobId,
      timeReceived: null
    }
  }
}

const launchJob = jobId => {
  let options = _.cloneDeep(settings.get('heritrix.launchJobOptions'))
  console.log('options url before setting', options.url)
  console.log('the jobid', jobId)
  options.url = `${options.url}${jobId}`
  console.log(`launching heritrix job ${jobId}`)
  console.log('Options after setting options.url', options.url)
  return {
    type: MAKE_REQUEST,
    request: {
      opts: options,
      from: `launchHeritrixJob[${jobId}]`,
      jId: jobId,
      timeReceived: null
    }
  }
}

const teardownJob = jobId => {
  let teardown = _.cloneDeep(settings.get('heritrix.sendActionOptions'))
  teardown.url = `${teardown.url}${jobId}`
  teardown.form.action = 'teardown'
  return {
    type: MAKE_REQUEST,
    request: {
      opts: teardown,
      from: `tearDownJob[${jobId}]`,
      jId: jobId,
      timeReceived: null
    }
  }
}

