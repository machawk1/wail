export default {
  starting: Symbol('process_starting'),
  started: Symbol('process_started'),
  start_error: Symbol('process_start_error'),
  start_error_unexpected: Symbol('start_error_unexpected'),
  start_error_port_used: Symbol('start_error_port_used'),
  start_error_main_not_found: Symbol('start_error_main_not_found'),
  not_started: Symbol('process_not_started'),
  user_initiated_stop: Symbol('process_user_initiated_stop'),
  could_not_kill: Symbol('could_not_kill'),
  process_error: Symbol('process_error'),
}