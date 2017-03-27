import React, { Component, PropTypes } from 'react'
import Joyride from 'react-joyride'
import rn, { dynamicRouteResolvers as drr } from '../routes/routeNames'
// document.getElementById('colto0').click() A popup will appear where you can enter in the Enter in the name, title and description for the collection.
const steps = [
  {
    title: 'Welcome to WAIL',
    text: 'WAIL displays information about where in the application you are, if a Heritrix Crawl is running, means to go to other sections of the application by clicking the hamburger menu and section specific functionality here.',
    selector: '#wailAppBar',
    style: {
      arrow: {
        display: 'none'
      }
    }
  }, /* 0 */
  {
    title: 'Navigating WAIL',
    text: 'This sidebar displays the major sections of WAIL',
    selector: '#sidebarWail',
    position: 'top-right'
  }, /* 1 */
  {
    title: 'Navigating WAIL: Collections',
    text: 'This is the current section you are at',
    selector: '#sidebarCols',
    position: 'top-right'
  }, /* 2 */
  {
    title: 'Collections',
    text: 'This is the default section of the application. From here WAIL lists your created collections. You can search for a specific collection and create a new one from here.',
    selector: '#staticloc'
  }, /* 3 */
  {
    title: 'Creating A New Collections',
    text: 'To create a new collection click the "New Collection" button. A popup will appear where you can enter in the name, title and description for the collection.',
    selector: '#newColButton'
  }, /* 4 */
  {
    title: 'Searching Your Collections',
    text: 'You can search for a specific collection(s) here by collection name. WAIL will automatically filter the displayed collections as you type.',
    selector: '#filtercols'
  }, /* 5 */
  {
    title: 'Listed Collections',
    text: 'Each Collection listed displays the name of the collection, the number of seeds contained in the collection, the last time a seed contained in the collection was archived, how large is your collection and its description.',
    selector: '#selectColList'
  }, /* 6 */
  {
    title: 'Viewing A Collection',
    text: 'To view a collection click on its name.',
    selector: '#colto0'
  }, /* 7 */
  {
    title: 'The Collection View',
    text: 'Lists the seeds contained in the collection, provides more information about the collections and an interface to add to the collection',
    selector: '#collViewDiv'
  }, /* 8 */
  {
    title: 'Collection View Location',
    text: 'You can return to the Collections section of WAIL by clicking on Collections. Any yellow colored text here will return you to its respective section',
    selector: '#colViewLoc'
  }, /* 9 */
  {
    title: 'Collection View Information',
    text: 'Here WAIL lists the time the collection was last archived, its creation date, how many seeds are it contains and its size. You can search for a specific seed by URL here as well.',
    selector: '#colViewHeader'
  }, /* 10 */
  {
    title: 'Collections Seeds',
    text: 'Each seed contained in the collection is displayed under the collections detailed information',
    selector: '#colSeedsList'
  }, /* 11 */
  {
    title: 'A Seed',
    text: 'The URL of the seed, the last time it was archived, when it was added, how many Mementos of the seed is contained in the collection and how the seed was archived through WAIL. You can view the seed in Wayback by clicking the view in Wayback button.',
    selector: '#mementoCard0'
  }, /* 12 */
  {
    title: 'Adding A Seed To A Collection',
    text: 'To add a seed to a collection click the add seed button. You can add a seed to a collection from the live Web or from a Warc/Arc file contained on your filesystem.',
    selector: '#addSeedButton'
  }, /* 13 */
  {
    title: 'Adding A Seed From The Live Web',
    text: 'Here you can add a seed from the Live Web',
    selector: '#addSeedFromLiveWebForm'
  }, /* 14 */
  {
    title: 'Add From Live Web: URL',
    text: 'Enter the URL of the seed here',
    selector: '#urlInput'
  }, /* 15 */
  {
    title: 'Chose Archive Configuration',
    text: (
      <p>
        Preserve the page and all resources necessary to view the page as it existed on the live web<br /><br />
        Page Only: Preserve the page and all resources necessary to view the page as it existed on the live
        web<br /><br />
        Page + Same domain links: Preserve page with all of its resources including links that to other pages on the
        same domain<br /><br />
        Page + All internal and external links: Preserve page and all links contained in it<br /><br />
      </p>
    ),
    position: 'right',
    selector: '#archiveConfig'
  }, /* 16 */
  {
    title: 'Check Seed',
    text: 'You can perform a pre-crawl check of the seed to determine which configuration should be used.',
    selector: '#CheckSeedButton'
  }, /* 17 */
  {
    title: 'Ready To Archive',
    text: 'Once you are ready to archive the seed. Press the "Add And Archive Now" Button',
    selector: '#archiveFormButtons'
  }, /* 18 */
  {
    title: 'Add Seed From File System',
    text: (
      <p>
        To add a (W)arc file simply drag and drop it into the screen.<br /><br />
        Once WAIL has processed the (W)arc file the selection process for the seed's url will be displayed.<br /><br />
        Once the seed's url has been selected clicking on the "Add (W)arc Seed(s)" button will add the file to the
        collection and it will be available for replay from the
      </p>
    ),
    selector: '#seedListFPContainer'
  }, /* 19 */
  {
    title: 'Navigating WAIL: Crawls',
    text: 'Monitor your currently running Heritrix crawls and manage existing crawls',
    selector: '#sidebarHeritrix',
    position: 'top-right'
  }, /* 20 */
  {
    title: 'Crawls',
    text: 'Each Heritrix crawl created using WAIL is displayed here',
    selector: '#hViewContainer'
  }, /* 21 */
  {
    title: 'A Crawl',
    text: (
      <p>
        Each crawls: seed url, current status of the crawl, timestamp of update, how many urls in the seed(s) web
        page have been processed or awaiting processing and actions that can be performed
      </p>
    ),
    selector: '#hji0'
  }, /* 22 */
  {
    title: 'Navigating WAIL: Services',
    text: 'The service management section of WAIL',
    selector: '#sidebarServices',
    position: 'top-right'
  }/* 23 */,
  {
    title: 'Service Statuses',
    text: 'Check to see if Heritrix and Wayback are running or manually start/stop them.',
    selector: '#serviceStatusTable'
  }, /* 24 */
  {
    title: 'Navigating WAIL: Event Log',
    text: 'View the last 100 events that occur while using WAIL',
    selector: '#sidebarMisc',
    position: 'top-right'
  }, /* 25 */
  {
    title: 'Event Log',
    text: 'The last 100 events that occur while using WAIL are displayed here along with the ability to check for updates to WAIL and open up the collections directory.',
    selector: '#elog'
  }, /* 26 */
  {
    title: 'Navigating WAIL: Archive Twitter',
    text: 'Setup archival of a Twitter Users feed through WAIL. You must sign into Twitter first but WAIL will help you in this process.',
    selector: '#sidebarTwitter',
    position: 'top-right'
  } /* 27 */,
  {
    title: 'Create captures of a Twitter users timeline',
    text: (
      <p>
        Enter in the length of time you want WAIL to create captures of a Users timeline<br/>
        WAIL uses 5 minute intervals between calls to the Twitter API<br/>
        The Twitter screen name of the users<br/>
        And which collection you wish to add the capture to.
      </p>
    ),
    position: 'right',
    selector: '#timelineArchive'
  }/* 28 */,
  {
    title: 'Create captures of individual Tweets',
    text: (
      <p>
        Enter in the length of time you want WAIL to create captures of a Users tweets<br/>
        WAIL uses 5 minute intervals between calls to the Twitter API<br/>
        The Twitter screen name of the user,s<br/>
        Which collection you wish to add the capture to
      </p>
    ),
    position: 'left',
    selector: '#tweetText'
  }/* 29 */,
  {
    title: 'Create captures of individual Tweets',
    text: (
      <p>
        And the terms in the Tweets you wish to create captures of.
      </p>
    ),
    position: 'left',
    selector: '#tweetTerms'
  }/* 30 */
]

const temp = [
  {
    title: 'Create captures of a Twitter users timeline',
    text: (
      <p>
        Enter in the length of time you want WAIL to create captures of a Users timeline<br/>
        WAIL uses 5 minute intervals between calls to the Twitter API<br/>
        The Twitter screen name of the users<br/>
        And which collection you wish to add the capture to.
      </p>
    ),
    position: 'right',
    selector: '#timelineArchive'
  },
  {
    title: 'Create captures of individual Tweets',
    text: (
      <p>
        Enter in the length of time you want WAIL to create captures of a Users tweets<br/>
        WAIL uses 5 minute intervals between calls to the Twitter API<br/>
        The Twitter screen name of the user,s<br/>
        Which collection you wish to add the capture to
      </p>
    ),
    position: 'left',
    selector: '#tweetText'
  },
  {
    title: 'Create captures of individual Tweets',
    text: (
      <p>
        And the terms in the Tweets you wish to create captures of.
      </p>
    ),
    position: 'left',
    selector: '#tweetText'
  }
]

let next = 0

export default class JoyRider extends Component {
  constructor (...args) {
    super(...args)
    this.state = {
      joyrideOverlay: true,
      joyrideType: 'continuous',
      isReady: false,
      isRunning: false,
      stepIndex: 0,
      steps,
      selector: ''
    }
    this.doNext = this.doNext.bind(this)
    this._doNext = this._doNext.bind(this)
    this.doNextReset = this.doNextReset.bind(this)
  }

  startJoyRide () {
    setTimeout(() => {
      this.setState({
        isReady: true,
        isRunning: true
      }, () => {
        this.interval = setInterval(::this.doNext, 11000)
      })
    }, 5000)
  }

  goToNC () {
    document.getElementById('newColButton').click()
    this.joyride.next()
  }

  afterNC () {
    document.getElementById('newCol-cancel').click()
    this.joyride.next()
  }

  nextTwitter () {
    window.tutsN()
    let tm = setTimeout(() => {
      clearTimeout(tm)
      this.joyride.next()
    }, 500)
  }

  doNextReset () {
    this.setState({
      steps
    }, () => {
      next = 0
      this.joyride.reset(true)
    })
  }

  _doNext () {
    this.joyride.next()
  }

  resetTemp () {
    this.setState({
      steps: temp
    }, () => {
      this.joyride.reset(true)
    })
  }

  setStateGoBack () {
    this.setState({
      steps
    }, () => {
      this.joyride.back()
    })
  }

  _pushAndNext (to) {
    window.__history.push(to)
    let tm = setTimeout(() => {
      clearTimeout(tm)
      this.joyride.next()
    }, 500)
  }

  _clickAndNext (what) {
    let tm = setTimeout(() => {
      clearTimeout(tm)
      this.joyride.next()
    }, 500)
  }

  doNext () {
    switch (next) {
      case 0:
        document.getElementsByClassName('joyride-beacon__outer')[0].click()
        break
      case 1:
      case 3:
      case 23:
      case 20:
      case 25:
      case 27:
        window.__openSideBar(::this._doNext)
        break
      case 8:
        this._pushAndNext(drr.viewCollection('default'))
        break
      case 14:
        this._pushAndNext(drr.addSeed('default'))
        break
      case 19:
        this._pushAndNext(drr.addSeedFs('default'))
        break
      case 21:
        window.__openSideBar(() => {
          this._pushAndNext(rn.heritrix)
        })
        break
      case 24:
        window.__openSideBar(() => {
          this._pushAndNext(rn.services)
        })
        break
      case 26:
        window.__openSideBar(() => {
          this._pushAndNext(rn.misc)
        })
        break
      case 28:
        window.__openSideBar(() => {
          this._pushAndNext(rn.twitter)
        })
        break
      case 30:
        this.nextTwitter()
        break
      default:
        this.joyride.next()
        break
    }
    next = next + 1
    if (next === 32) {
      clearInterval(this.interval)
    }
  }

  callback (data) {
    console.log('%ccallback', 'color: #47AAAC; font-weight: bold; font-size: 13px;')// eslint-disable-line no-console
    console.log(data) // eslint-disable-line no-console
  }

  onClickSwitch (e) {
    e.preventDefault()
    const el = e.currentTarget
    const state = {}

    if (el.dataset.key === 'joyrideType') {
      this.joyride.reset()

      setTimeout(() => {
        this.setState({
          isRunning: true
        })
      }, 300)

      state.joyrideType = e.currentTarget.dataset.type
    }

    if (el.dataset.key === 'joyrideOverlay') {
      state.joyrideOverlay = el.dataset.type === 'active'
    }

    this.setState(state)
  }

  updateState () {
    // newColButton
    this.setState({
      steps
    })
  }

  addJoyRide (c) {
    this.joyride = c
    window.joyRide = c
    window.joyRider = this
  }

  componentWillUnmount () {
    window.joyRide = null
    window.joyRider = null
  }

  render () {
    const {
      isReady,
      isRunning,
      joyrideOverlay,
      joyrideType,
      selector,
      stepIndex,
      steps
    } = this.state
    return (
      <Joyride
        ref={::this.addJoyRide}
        debug={false}
        disableOverlay
        locale={{
          back: (<span>Back</span>),
          close: (<span>Close</span>),
          last: (<span>Done</span>),
          next: (<span>Next</span>),
          skip: (<span>Skip</span>)
        }}
        run={isRunning}
        showOverlay={joyrideOverlay}
        showSkipButton
        showStepsProgress
        stepIndex={stepIndex}
        steps={steps}
        type={joyrideType}
      />
    )
  }
}
