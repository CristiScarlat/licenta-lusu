import open from 'open';
import http from 'http';
import fs, { access } from 'fs';
import url from 'url';
// import { toggleRelay, getRelaysState } from "./gpio.js";
// import { saveSchedule } from "./scheduleHandler.js";
import { getDataByCardID, login, logout, addAccessDataToHistoryDB, getAccessDataFromHistoryDB } from "./services/fb.js";
import { getReqBody } from "./utils.js";
import { openDoorWithTimer, getRelaysState } from './services/rpi.js';

function runWebserver() {
    const host = 'localhost';
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
        else if (req.method === "GET" && req.url.includes("/cardID")) {
            try {
                const cardId = req.url.split("/").pop()
                const data = await getDataByCardID(cardId);
                res.setHeader("Content-Type", "application/json");
                res.writeHead(200);
                res.end(JSON.stringify({ data }));
            }
            catch (error) {
                console.log(error)
                res.setHeader("Content-Type", "application/json");
                res.writeHead(500);
                res.end(JSON.stringify({ error: JSON.stringify(error) }));
            }
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
                if(accessData?.accessDoor)openDoorWithTimer(accessData.accessDoor);
                await addAccessDataToHistoryDB(accessData);
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
                res.setHeader("Content-Type", "application/json");
                res.writeHead(200);
                res.end(JSON.stringify({ doors:  relaysState}));
            }
            catch (error) {
                res.setHeader("Content-Type", "application/json");
                res.writeHead(500);
                res.end(JSON.stringify(error));
            }
        }
        else if (req.method === "GET" && req.url === "/history") {
            try {
                const logs = await getAccessDataFromHistoryDB();
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
    };

    const server = http.createServer(requestListener);
    server.listen(port, host, () => {
        console.log(`Server is running on http://${host}:${port}`);
        //open(`http://${host}:${port}`, { app: ['google chrome', '--kiosk'] });
    });
}

runWebserver()