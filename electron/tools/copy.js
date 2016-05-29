import fs from 'fs-extra'

const dirsRequired = [
    'src/public/css',
    'src/public/icons',
    'src/public/fonts',
]

const resourcesToCopy = [
    {
        from: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
        to: 'src/public/css/bootstrap.min.css'
    },
    {
        from: 'node_modules/bootstrap/dist/fonts',
        to: 'src/public/fonts'
    },
    {
        from: '../build/icons',
        to: 'src/public/icons'
    },
]

console.log("Running")


dirsRequired.forEach(dir => fs.ensureDir(dir, err => {
    if (err)
        console.log(`problem when ensuring the directory ${dir} exists error ${err}`)
}))


resourcesToCopy.forEach(copy => fs.copy(copy.from, copy.to, err => {
    if (err) {
        console.log(`problem when copying from ${copy.from} to ${copy.to} with error ${err}`)
    }
}))