import acronyms from './acronyms'

export const general = {
  newCol: 'New Collection',
  collections: 'Collections',
  heritrix: 'Heritrix',
  crawls: 'Crawls',
  serviceStatuses: 'Service Statuses',
  services: 'Services',
  eventLog: 'Event Log',
  archiveTwitter: 'Archive Twitter',
  twitterSignin: 'Twitter Sign In',
  start: 'Start',
  restart: 'Restart',
  delete: 'Delete',
  status: 'Status',
  wayback: 'Wayback',
}

export const ipcMessages = {
  addedWarcOrArcFromFs: `Added ${acronyms.warcOrArc} File From The File System`,
  pageOnlyCrawlFinished: 'Page Only Crawl Finished',
  addedToCollectionX (col) {
    return `Added To The Collection ${col}`
  },
  archivedTweetToCollectionX (col) {
    return `Saved One Tweet For Collection ${col}`
  },
  addedWarcToCollectionX (col) {
    return `${acronyms.warc} Was Added To The Collection ${col}`
  },
  addedMetadataToCollectionX (col) {
    return `Added Metadata For Collection ${col}`
  },
  unableToAddMetadataToCollectionX (col, reason = null) {
    if (reason !== null) {
      return `Unable To Add Metadata For Collection ${col} Because ${reason}`
    }
    return `Unable To Add Metadata For Collection ${col}`
  },
  unableToCreateCollection (col, reason = null) {
    if (reason !== null) {
      return `Unable To Create Collection ${col} Because ${reason}`
    }
    return `Unable To Create Collection ${col}`
  }
}

export const notificationMessages = {
  creatingNewColX (col) {
    return `Creating New Collection ${col}`
  },
  wailWarcreateError (eMessage) {
    return `There was an error while using ${acronyms.wailWarcreate} ${eMessage}. Resorting to using ${general.heritrix}`
  },
  startingServiceEncounteredError (service,err) {
    return `Starting service ${service} encountered an error ${err}`
  },
  startedService (service) {
    return `Started service ${service}`
  },
  stoppingServiceEncounteredError (service,err) {
    return `Stopping service ${service} encountered an error ${err}`
  },
  stoppedService (service) {
    return `Stopped service ${service}`
  },
  buildingHeritrixCrawl (forCol,urls) {
    return `Building ${general.heritrix} crawl for ${forCol} with seeds: ${urls}`
  },
  wailWarcreateErrorTitle: `${acronyms.wailWarcreate} Error`,
  startingWayback: `Starting ${general.wayback}`,
  stoppingWayback: `Stopping ${general.wayback}`,
  startingHeritrix: `Starting ${general.heritrix}`,
  stoppingHeritrix: `Stopping ${general.heritrix}`,
  errorRestartingWaybacl: `There was error restarting ${general.wayback}`
  
}

export const addToCollection = {
  selectCorrectSeed: `Select Correct Seed For The ${acronyms.warcOrArc}`,
  warcOrArcProcessingError: `${acronyms.warcOrArc} File Processing Error`,
  addWarcOrArcSeedsButton: `Add ${acronyms.warcOrArcs} Seed(s)`,
  fromLiveWeb: 'From Live Web',
  fromFs: 'From File System',
  addSeed: 'Add Seed',
  addSeedFromLiveWeb: 'Add Seed From Live Web',
  addSeedFromFs: 'Add Seed From File System'
}

export const newCollectionForm = {
  cancel: 'Cancel',
  createCollection: 'Create Collection',
  collDescript: 'Collection Description',
  collDescriptHint: 'Really Awesome Collection',
  collTitle: 'Collection Tittle',
  collTitleHint: 'Awesome Collection',
  collName: 'Collection Name',
  collNameHint: 'MyAwesomeCollection',
  collNameError: 'Collection Names Can Not Contain Spaces',
  collDescriptError: 'Collection Description Is Required'
}

export const heritrix = {
  viewConf: 'View Config',
  viewInHeritrix: 'View In Heritrix',
  terminateCrawl: 'Terminate Crawl',
  rescanJobDir: 'Rescan Job Directory',
  launchWebUi: `Launch Web ${acronyms.ui}`,
  crawlUrls: `Crawl ${acronyms.oneOrMoreUrls}`,
  forCollection: 'For Collection',
  tstamp: 'Timestamp',
  discovered: 'Discovered',
  queued: 'Queued',
  dled: 'Downloaded',
  actions: 'Actions'
}

export const selectCollection = {
  filterSelectSearchHint: 'Collection Name',
  filterSelectToolTip: 'Search By Collection Name',
  filterColTFHint: 'Search',
}

export const collectionCard = {
  noCollNamed (search) {
    return `No Collection Named: ${search}`
  },
  seedCount (seeds) {
    return `Seeds: ${seeds}`
  },
  collSize (size) {
    return `Size: ${size}`
  },
  lastArchived (lastUpdated) {
    return `Last Archived: ${lastUpdated}`
  }
}

export const addSeedFromFs = {
  determiningSeedNotif (num, whatType) {
    return `Determining Seeds For ${num} ${whatType} Files`
  },
  determiningSeedMessage: `Determining Seed From Added ${acronyms.warcOrArc}`,
  noDirectory: `Please add the ${acronyms.warcOrArc} one by one. This is to ensure they are added correctly`,
  badFileTypes (type) {
    return `Unable to add files with extensions of ${type}`
  },
  defaultMessage: `${acronyms.fileName} With Potential Seeds Will Be Displayed Below When Added`
}

export const firstTimeLoading = {
  title: `${acronyms.wail} Is Performing A First Time Setup`,
  autoConfigSteps: 'Auto Configuration Steps',
  loadedCollectionsAndCrawls: `Loaded ${general.collections} and ${general.crawls}`,
  loadingCollectionsAndCrawls: `Loading ${general.collections} and ${general.crawls}`,
  startServices: `Start ${general.services}`,
  forWailSetup: `For ${acronyms.wail} Setup`,
  osCheckDone (os, arch) {
    return `Running ${os} ${arch}`
  },
  osCheckStepLabel (checkDone) {
    return checkDone ? 'Checked Operating System' : 'Checking Operating System'
  },
  javaCheckLabeler (checkDone, download) {
    if (checkDone && download) {
      return 'Checked Java Version Action Required'
    } else if (checkDone) {
      return 'Checked Java Version'
    } else {
      return 'Checking Java Version'
    }
  },
  askNoDlJavaDialogue: `Downloading and installing of ${acronyms.jdk} 1.7 on ${acronyms.macOs} is required.\nYou will not be able to use ${acronyms.wail} without it. Are you sure you do not want to download?`,
  downloadJDKExplaination () {
    let p1 = `Usage of ${general.heritrix} through ${acronyms.wail} requires the Java 1.7 ${acronyms.jdk} (Java Developer Kit)<br />`
    let p2 = `to be installed. This is required and ${acronyms.wail} will guide you through the installation<br />`
    return `${p1}${p2}process. Do you wish to download and install this ${acronyms.jdk}?`
  },
  jdkDlInitiatingError: `There was an error while initiating the ${acronyms.jdk} install process`,
  jdkDlFinishedAskStartInstall () {
    let p1 = `The Java 1.7 ${acronyms.jdk} download is completed.<br />`
    let p2 = `${acronyms.wail} will initiate the Java 1.7 ${acronyms.jdk} install process and <br />`
    return `${p1}${p2}exit when it starts. Start this process?`
  }
}

export const notFirstTimeLoading = {
  heritrixNotStart: `${general.heritrix} Could Not Be Started`,
  waybackNotStart: `${general.wayback} Could Not Be Started`,
  startServices: 'Start Services',
  crawlsLoaded (completed) {
    return completed ? firstTimeLoading.loadedCollectionsAndCrawls : firstTimeLoading.loadingCollectionsAndCrawls
  },
  isLoading: `${acronyms.wail} Is Loading`,
  loadingSteps: 'Loading Steps'
}

export const loadingRecords = {
  needDLJavaNoUseOpenJdk: `Need To Download 1.7: No ${acronyms.wail} Can Use The Packaged OpenJDK`,
  needDLJavaNo: 'Need To Download 1.7: No',
  needDLJavaDarwin (dl) {
    return `Need To Download 1.7: ${dl ? 'Yes' : 'No'}`
  },
  youHaveJavaReport (doHave, javaV) {
    let have = 'No'
    if (doHave) {
      have = `Yes ${javaV}`
    }
    return `Have Java: ${have}`
  },
  youHaveCorrectJavaReport (haveCorrect) {
    return `Using 1.7: ${haveCorrect ? 'Yes' : 'No'}`
  },
  waybackWaitingToStart: `${general.wayback} is waiting to be started`,
  waybackWasStarted: `${general.wayback} was started`,
  waybackWasNotStarted: `${general.wayback} was not started`,
  heritrixWaitingToStart: `${general.heritrix} is waiting to be started`,
  heritrixWasStarted: `${general.heritrix} was started`,
  heritrixWasNotStarted: `${general.heritrix} was not started`,
  archivesLoaded: `${general.collections} Have Been Loaded`,
  archivesNotLoaded: `${general.collections} Have Not Been Loaded`,
  crawlsLoaded: `${general.crawls} HaveBeen Loaded`,
  crawlsNotLoaded: `${general.crawls} Have Not Been Loaded`,
}
