import rfid from "node-rfid"

const timerIds = [];
const relays = [0,0,0,0];
const persInfo = [{}, {}, {}, {}]

export function openDoorWithTimer(data) { 
    const doorNo = data.accessDoor 
    relays[doorNo-1] = 1;
    persInfo[doorNo-1] = data;
    clearInterval(timerIds[doorNo-1])
    const timerId = setTimeout(() => {
        relays[doorNo-1] = 0;
        persInfo[doorNo-1] = {};
        clearInterval(timerIds[doorNo-1])
    }, 5000)
    timerIds[doorNo-1] = timerId;
}

export function getRelaysState(){
    return relays;
}

export function getCurrentPers() {
    return persInfo;
}

export function initRFID(cb){
    console.log("init rfid scanner...")
	return setInterval(() => rfid.read(cb), 3000);	
}

export function readRFIDwithTimeout() {
    return new Promise((resolve, reject) => {
        rfid.readintime(5000, (error, result) => {
            console.log({error, result})
            if(error)reject(error)
            else if(!result.includes("["))reject(error)
            else resolve(result)
        });
    });
}
