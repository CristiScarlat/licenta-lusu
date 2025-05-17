import rfid from "node-rfid"
import Gpio from "onoff"

const timerIds = [];
const relays = [0,0,0,0];
const persInfo = [{}, {}, {}, {}]
let RELAY1 = null;
let RELAY2 = null;
let RELAY3 = null;
let RELAY4 = null;
let OUTPUTS = [];

export function openDoorWithTimer(data) { 
    if(data?.error){
        persInfo[0] = data
    }
    const doorNo = data?.accessDoor || 1;
    if(data.error === undefined){
        relays[doorNo-1] = 1;
        OUTPUTS[doorNo-1].writeSync(0);
    }
    persInfo[doorNo-1] = data;
    clearInterval(timerIds[doorNo-1])
    const timerId = setTimeout(() => {
        relays[doorNo-1] = 0;
        persInfo[doorNo-1] = {};
        OUTPUTS[doorNo-1].writeSync(1);
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

export function initGpioRelays() {
    RELAY1 = new Gpio.Gpio(18, 'out');
    RELAY2 = new Gpio.Gpio(27, 'out');
    RELAY3 = new Gpio.Gpio(22, 'out');
    RELAY4 = new Gpio.Gpio(23, 'out');
    OUTPUTS = [RELAY1, RELAY2, RELAY3, RELAY4];
    OUTPUTS.forEach(relay => relay.writeSync(1));
}

export function initRFID(cb){
    console.log("init rfid scanner...")
	return setInterval(() => {
        rfid.readintime(500, (error, result) => {
            if(error)return
            else if(!result.includes("["))return
            else cb(null, result)
        });
    }, 1000);	
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
