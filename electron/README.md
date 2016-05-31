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
    
    
Powered by Electron and React