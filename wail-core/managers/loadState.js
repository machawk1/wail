export default class LoadState {
  constructor () {
    this.archiveManWindow = null
    this.crawlManWindow = null
    this.haveBothStates = false
    this.wailHasArchives = false
    this.wailHasCrawls = false
    this.wailHasBothStates = false
  }

  _haveBoth () {
    return this.wailHasArchives && this.wailHasCrawls
  }

  _doHaveBoth () {
    this.wailHasBothStates = true
    this.haveBothStates = true
  }

  addLoadingState (who, state) {
    this[who] = state
    if (this._haveBoth()) {
      this._doHaveBoth()
    }
    return this.haveBothStates
  }

  wailHasLoadState (has) {
    this[has] = true
    if (this._haveBoth()) {
      this._doHaveBoth()
    }
    return this.wailHasBothStates
  }

  bothLoadingStatesGotten () {
    return this.haveBothStates
  }

  doesWailHaveBothLoadStates () {
    return this.wailHasBothStates
  }

  resetLoadinState () {
    this.archiveManWindow = null
    this.crawlManWindow = null
    this.haveBothStates = false
    this.wailHasArchives = false
    this.wailHasCrawls = false
    this.wailHasBothStates = false
  }

  uiLoadedFast () {
    this.wailHasArchives = true
    this.wailHasCrawls = true
    this.wailHasBothStates = true
  }
}