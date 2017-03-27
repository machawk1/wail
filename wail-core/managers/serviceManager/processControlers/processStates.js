import keyMirror from 'keymirror'

const processStates = keyMirror({
  starting: null,
  started: null,
  start_error: null,
  do_restart: null,
  restarting: null,
  restarting_killed: null,
  start_error_unexpected: null,
  start_error_port_used: null,
  start_error_main_not_found: null,
  not_started: null,
  user_initiated_stop: null,
  could_not_kill: null,
  process_error: null
})

export default processStates
