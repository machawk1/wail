const { app } = require('electron')
const workerId = process.env.ELECTRON_WORKER_ID

console.log('Hello from worker', workerId)

app.commandLine.appendSwitch('js-flags', '--harmony')

app.on('ready', () => {
  // first you will need to listen the `message` event in the process object
  process.on('message', data => {
    if (!data) {
      return
    }

    // `electron-workers` will try to verify is your worker is alive sending you a `ping` event
    if (data.workerEvent === 'ping') {
      // responding the ping call.. this will notify `electron-workers` that your process is alive
      process.send({ workerEvent: 'pong' })
    } else if (data.workerEvent === 'task') { // when a new task is executed, you will recive a `task` event

      console.log(data) //data -> { workerEvent: 'task', taskId: '....', payload: <whatever you have passed to `.execute`> }

      console.log(data.payload.someData) // -> someData

      // you can do whatever you want here..

      // when the task has been processed,
      // respond with a `taskResponse` event, the `taskId` that you have received, and a custom `response`.
      // You can specify an `error` field if you want to indicate that something went wrong
      process.send({
        workerEvent: 'taskResponse',
        taskId: data.taskId,
        response: {
          value: data.payload.someData
        }
      })
    }
  })
})
