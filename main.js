import open from 'open';
import http from 'http';
import fs, { access } from 'fs';
import url from 'url';
// import { toggleRelay, getRelaysState } from "./gpio.js";
// import { saveSchedule } from "./scheduleHandler.js";
import { getDataByCardID, login, logout, addAccessDataToHistoryDB, getAccessDataFromHistoryDB, addPersonToDBwithCardId, auth } from "./services/fb.js";
import { getReqBody, formatRFID } from "./utils.js";
import { openDoorWithTimer, getRelaysState, getCurrentPers, initRFID, readRFIDwithTimeout } from './services/rpi.js';

function runWebserver() {
    const host = '0.0.0.0';
    const port = 8000;

    const requestListener = async function (req, res) {
        if (req.method === "GET" && req.url === "/") {
            fs.readFile("./public/index.html", (error, data) => {
                if (error) {
                    res.writeHead(500);
                    res.end(err);
                    return;
                }
                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                res.end(data);
            })
        }
        else if (req.method === "GET" && req.url.includes(".css")) {
            fs.readFile("./public/index.css", (error, data) => {
                if (error) {
                    res.writeHead(500);
                    res.end(err);
                    return;
                }
                res.setHeader("Content-Type", "text/css");
                res.writeHead(200);
                res.end(data);
            })
        }
        else if (req.method === "GET" && req.url.includes("favicon.ico")) {
            fs.readFile("./public/favicon.ico", (error, data) => {
                if (error) {
                    res.writeHead(500);
                    res.end(err);
                    return;
                }
                res.setHeader("Content-Type", "image/vnd.microsoft.icon");
                res.writeHead(200);
                res.end(data);
            })
        }
        else if (req.method === "GET" && req.url.includes("index.js")) {
            fs.readFile("./public/index.js", (error, data) => {
                if (error) {
                    res.writeHead(500);
                    res.end(err);
                    return;
                }
                res.setHeader("Content-Type", "application/javascript");
                res.writeHead(200);
                res.end(data);
            })
        }
        else if (req.method === "GET" && req.url.includes("components.js")) {
            fs.readFile("./public/components.js", (error, data) => {
                if (error) {
                    res.writeHead(500);
                    res.end(err);
                    return;
                }
                res.setHeader("Content-Type", "application/javascript");
                res.writeHead(200);
                res.end(data);
            })
        }
        else if (req.method === "GET" && req.url.includes("router.js")) {
            fs.readFile("./public/router.js", (error, data) => {
                if (error) {
                    res.writeHead(500);
                    res.end(err);
                    return;
                }
                res.setHeader("Content-Type", "application/javascript");
                res.writeHead(200);
                res.end(data);
            })
        }
        else if (req.method === "POST" && req.url === "/signin") {
            try {
                const {email, password} = await getReqBody(req);
                const loginData = await login(email, password);
                res.setHeader("Content-Type", "application/json");
                res.writeHead(200);
                res.end(JSON.stringify({ login: "success", user: {uid: loginData.user.uid, email: loginData.user.email} }));
            }
            catch (error) {
                console.log(error)
                res.setHeader("Content-Type", "application/json");
                res.writeHead(500);
                res.end(JSON.stringify(error));
            }
        }
        else if (req.method === "GET" && req.url.includes("/signout")) {
            try {
                await logout()
                res.setHeader("Content-Type", "application/json");
                res.writeHead(200);
                res.end(JSON.stringify({ logout: "success" }));
            }
            catch (error) {
                res.setHeader("Content-Type", "application/json");
                res.writeHead(500);
                res.end(JSON.stringify(error));
            }
        }
        else if (req.method === "POST" && req.url.includes("/access-gate")) {
            try {
                const accessData = await getReqBody(req);
                if(accessData?.accessDoor)openDoorWithTimer({accessDoor: accessData.accessDoor});
                res.setHeader("Content-Type", "application/json");
                res.writeHead(200);
                res.end(JSON.stringify({ accessData }));
            }
            catch (error) {
                console.log(error)
                res.setHeader("Content-Type", "application/json");
                res.writeHead(500);
                res.end(JSON.stringify(error));
            }
        }
        else if (req.method === "GET" && req.url.includes("/access-gate")) {
            try {
                const relaysState = getRelaysState();
                const persInfo = getCurrentPers();
                res.setHeader("Content-Type", "application/json");
                res.writeHead(200);
                res.end(JSON.stringify({ doors:  relaysState, persons: persInfo}));
            }
            catch (error) {
                res.setHeader("Content-Type", "application/json");
                res.writeHead(500);
                res.end(JSON.stringify(error));
            }
        }
        else if (req.method === "GET" && req.url.includes("/history")) {
            try {
                const direction = req.url.split("?")[1]?.split("=")[1];
                const pageQty = 15;
                const logs = await getAccessDataFromHistoryDB(pageQty, direction);
                res.setHeader("Content-Type", "application/json");
                res.writeHead(200);
                res.end(JSON.stringify(logs));
            }
            catch (error) {
                res.setHeader("Content-Type", "application/json");
                res.writeHead(500);
                res.end(JSON.stringify({error: error.toString()}));
            }
        }
        else if (req.method === "POST" && req.url === "/register-member") {
            try {
                const data = await getReqBody(req);
                console.log(data)
                await addPersonToDBwithCardId(data);
                res.setHeader("Content-Type", "application/json");
                res.writeHead(200);
                res.end(JSON.stringify({ data, status: "success" }));
            }
            catch (error) {
                console.log(error)
                res.setHeader("Content-Type", "application/json");
                res.writeHead(500);
                res.end(JSON.stringify(error));
            }
        }
        else if (req.method === "GET" && req.url === "/scan-card") {
            try {
                const data = await readRFIDwithTimeout();
                const cardId = formatRFID(data);
                res.setHeader("Content-Type", "application/json");
                res.writeHead(200);
                res.end(JSON.stringify({ cardId }));
            }
            catch (error) {
                console.log(error)
                res.setHeader("Content-Type", "application/json");
                res.writeHead(500);
                res.end(JSON.stringify(error));
            }
        }
    };

    const server = http.createServer(requestListener);
    server.listen(port, host, () => {
        console.log(`Server is running on http://${host}:${port}`);
        //open(`http://${host}:${port}`, { app: ['chromium-browser', '--kiosk'] });
    });
}

let throttleId = null;
async function handleAccessByScannedRFID(error, rfid) {
    console.log("rfid", rfid);
    if(throttleId)return;
    throttleId = setTimeout(async () => {
            try{
                if(error === null){
                    const cardId = formatRFID(rfid)
                    console.log("--->>", cardId, rfid)
                    if(cardId){
                        const data = await getDataByCardID(cardId);
                        console.log("getDataByCardId", data)
                        if(data){
                            openDoorWithTimer(data);
                            const historyData = {
                                    error: null,
                                    name: data.name,
                                    email: data.email,
                                    accessDoor: data.accessDoor,
                                    cardIdValue: data.cardId,
                                    operatorEmail: auth.currentUser?.email || null,
                                    operatorUID: auth.currentUser?.uid || null,
                                    time: Date.now()
                            }
                            await addAccessDataToHistoryDB(historyData);
                        }
                        else {
                            openDoorWithTimer({error: "Card neînregistrat, accesul nu este permis!"});
                        }
                    }
                } else throw error;
            } 
            catch(error){
                console.log(error)
                if(error.message !== "Could not read data from db"){
                    await addAccessDataToHistoryDB({time: Date.now(), error: "Card neînregistrat, accesul nu este permis!"});
                }
            }
            clearTimeout(throttleId)
            throttleId = null;
    }, 2000)

}

initRFID(handleAccessByScannedRFID)

runWebserver()
