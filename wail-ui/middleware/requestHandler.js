
// curried the living daylights out of this
export default store => next => action => {
    if (action.type === 'create-job') {
      let forCol = store.get(action.jobId).get('forCol')
      let seeds = store.get(action.jobId).get('seeds')
      next(notify({
        title: 'Info',
        level: 'info',
        message: `Built Crawl Conf for ${forCol} job: ${seeds}`,
        uid: `Built Crawl Conf for ${forCol} job: ${seeds}`
      }))
      return next(action)
    }
}