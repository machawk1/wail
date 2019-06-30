import MonitorTask from './monitorTask'

export default class UserTimeLineTask extends MonitorTask {
  constructor ({twitterClient, account, dur}) {
    super(dur)
    this.twitterClient = twitterClient
    this.account = account
  }

  poll () {
    this.emit('archiveTimeline', this.account)
    this.checkForStop()
  }
}
