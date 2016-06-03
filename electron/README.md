# Electron Wail 

**First thing run npm install and then copy-resources**

```sh
$ npm install
$ npm run-script copy-resources
$ npm run-script start-dev
```


## Scripts
    1.  copy-resources: Copies resources required to function and the script to do that is
        tools/copy.js. In this file are two variables dirsRequired and resourcesToCopy.
        The dirsRequired is an array of paths to folders needed to be present
        before the copy. Likewise with resourcesToCopy but has objects
        with from and two as keys.  Add to thes if you need to have more
        items copied.
    
    2. start-dev: Runs both the dev and start-electron-dev commands
    
    3. dev: Runs the webpack dev server with hot module replacement enabled
    
    4. start-electron-dev: Start electron
    
## Package

```bash
$ npm run package
```

To package apps for all platforms:

```bash
$ npm run package-all
```

#### Options

- --name, -n: Application name (default: ElectronReact)
- --version, -v: Electron version (default: latest version)
- --asar, -a: [asar](https://github.com/atom/asar) support (default: false)
- --icon, -i: Application icon
- --all: pack for all platforms

Use `electron-packager` to pack your app with `--all` options for darwin (osx), linux and win32 (windows) platform. After build, you will find them in `release` folder. Otherwise, you will only find one for your os.

`test`, `tools`, `release` folder and devDependencies in `package.json` will be ignored by default.

Powered by Electron and React.
[Modeled after this boiler plate](https://github.com/chentsulin/electron-react-boilerplate)