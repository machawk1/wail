const routeNames = {
  selectCol: '/',
  viewCollection: '/collections/:col',
  addSeed: '/addSeed/:col',
  addSeedFs: '/addFsSeed/:col',
  viewArchiveConfig: '/viewArchiveConfig/:col',
  heritrix: '/heritrix',
  misc: '/misc',
  services: '/services',
  twitter: '/twitter',
  twitterSignIn: '/twitter-signin',
  wailCrawls: '/wailCrawls'
}

export const dynamicRouteResolvers = {
  viewCollection (col) {
    return `/collections/${col}`
  },
  addSeed (col) {
    return `/addSeed/${col}`
  },
  addSeedFs (col) {
    return `/addFsSeed/${col}`
  },
  viewArchiveConfig (col) {
    return `/viewArchiveConfig/${col}`
  }
}

export default routeNames
