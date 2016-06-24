import Monitor from "./monitors"
import {ipcRenderer} from "electron"


ipcRenderer.on("start-crawljob-monitoring", (event) => {
    console.log('Monitor get start crawljob monitoring')
    Monitor.checkJobStatuses(statues => {
        ipcRenderer.send("crawljob-status-update", statues)
    })
})

ipcRenderer.on("start-service-monitoring", (event) => {
        console.log('Monitor got start-service-monitoring')
        Monitor.checkReachability((statues) => {
            ipcRenderer.send("service-status-update", statues)
        })
    }
)

ipcRenderer.on("start-test", (ping) => {
        Monitor.simpleTest((statues) => {
            ipcRenderer.send("test-status-update", statues)
        })
        ipcRenderer.send('pong', `${ping} pong`)
    }
)