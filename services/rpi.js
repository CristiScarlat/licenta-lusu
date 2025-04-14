const timerIds = [];
const relays = [0,0,0,0];

export function openDoorWithTimer(doorNo) {  
    relays[doorNo-1] = 1;
    clearInterval(timerIds[doorNo-1])
    const timerId = setTimeout(() => {
        relays[doorNo-1] = 0;
        clearInterval(timerIds[doorNo-1])
    }, 5000)
    timerIds[doorNo-1] = timerId;
}

export function getRelaysState(){
    return relays;
}