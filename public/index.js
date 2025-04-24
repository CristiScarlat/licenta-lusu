import { TestCardIDInput, ScannedCardInfoSection, LoginForm, DoorsSection, Table } from "./components.js";
import Router from "./router.js";

const mainContainer = document.getElementById("app");
const header = document.querySelector("header");
const userStr = sessionStorage.getItem("user");
const user = userStr ? JSON.parse(userStr) : null;

const historyBtn = document.getElementById("history-screen");
historyBtn.addEventListener("click", () => {
    console.log("navigate-to-history")
    router.navigate("/history")
});

const monitorBtn = document.getElementById("monitor-screen");
monitorBtn.addEventListener("click", () => {
    console.log("navigate-to-home")
    router.navigate("/")
});

const router = new Router({
    home: { path: "/", renderer: renderMainScreen },
    history: { path: "/history", renderer: renderHistoryScreen },
    login: { path: "/login", renderer: renderLoginPage }
})

if (user?.uid) {
    router.navigate("/")
    header.style.display = "flex";
}
else {
    router.navigate("/login")
    header.style.display = "none";
}

const saveUserToStorage = (data) => {
    sessionStorage.setItem("user", JSON.stringify({ uid: data.user.uid, email: data.user.email }));
    header.style.display = "flex";
}

const removeUserFromStarge = () => {
    sessionStorage.removeItem("user");
    header.style.display = "none";
}

function handleLogin() {
    const form = document.querySelector('#login-form>form');
    form.addEventListener("submit", async (e) => {
        e.preventDefault(e);
        const loginData = {}
        const formData = new FormData(e.target);
        for (const pair of formData.entries()) {
            loginData[pair[0]] = pair[1]
        }
        const res = await fetch("/signin", { method: "POST", body: JSON.stringify(loginData) });
        const data = await res.json();
        if (data.user.uid) {
            saveUserToStorage(data);
            router.navigate("/")
        }
    })
}

function renderLoginPage() {
    mainContainer.innerHTML = "";
    mainContainer.append(LoginForm());
    handleLogin();
}


function renderMainScreen() {
    console.log("render-home")
    mainContainer.innerHTML = "";
    const contentContainer = document.createElement("div");

    const sectionLeft = document.createElement("div");
    sectionLeft.style.maxWidth = "20rem";
    const sectionRight = document.createElement("div");
    sectionLeft.append(TestCardIDInput(), DoorsSection([0, 0, 0, 0]), ScannedCardInfoSection())

    contentContainer.append(sectionLeft, sectionRight)
    mainContainer.append(contentContainer);


    const scanedIdInput = document.querySelector("#test-card-id>input");
    const scanedIdButtn = document.querySelector("#test-card-id>button");
    const userInfo = document.querySelector("#users-access-display");
    const logoutBtn = document.getElementById("logout-button");


    const fetchCardData = async () => {
        try {
            const cardIdValue = scanedIdInput.value;
            const res = await fetch(`/cardID/${cardIdValue}`);
            const { data } = await res.json();
            const loginData = JSON.parse(sessionStorage.getItem("user"));
            let accessData = null
            if (data === undefined || Object.keys(data).length === 0) {
                userInfo.style.backgroundColor = "darkred";
                userInfo.innerText = "Card neînregistrat, accesul nu este permis!";
                accessData = {
                    cardIdValue,
                    error: "Card neînregistrat, accesul nu este permis!",
                    operatorEmail: loginData.email,
                    operatorUID: loginData.uid,
                    time: Date.now()
                }
            }
            else {
                accessData = {
                    ...data,
                    cardIdValue,
                    error: null,
                    operatorEmail: loginData.email,
                    operatorUID: loginData.uid,
                    time: Date.now()
                }
                userInfo.style.backgroundColor = "darkgreen";
                userInfo.innerText = `Aces permis pentru | ${data.name} | prin poarta | ${data.accessDoor} |.`;
            }
            await fetch('/access-gate', { method: "POST", body: JSON.stringify(accessData) })
        }
        catch (error) {
            console.log(error)
        }

    }

    scanedIdButtn.addEventListener("click", fetchCardData)

    logoutBtn.addEventListener("click", () => {
        fetch("/signout")
            .then(() => {
                removeUserFromStarge()
                router.navigate("/login")
            })
            .catch(error => {
                console.log(error)
                alert("Cannot logout")
            })
    })
}


async function renderHistoryScreen() {
    try {
        console.log("render-history")
        const historyTableCols = {
            "Data": "time",
            "Eroare": "error",
            "Nume Utilizator": "name",
            "Adresa Email Utilizator": "email",
            "Ușă acces": "accessDoor",
            "Serie Card Acces": "cardIdValue",
            "Operator UID": "operatorUID",
            "Operator Email": "operatorEmail"
        }

        mainContainer.innerHTML = "";
        const contentContainer = document.createElement("div");
        const res = await fetch('/history');
        const logs = await res.json();
        console.log(logs)
        const table = Table({head: historyTableCols, body: logs});
        contentContainer.append(table);
        mainContainer.append(contentContainer)
    }
    catch (error) {
        alert(error.toString())
    }

}


function initPool() {
    setInterval(async () => {
        try {
            const res = await fetch('/access-gate')
            const data = await res.json();
            const presentDoorsSection = document.getElementById("doors-section");
            if (presentDoorsSection) {
                const doors = DoorsSection(data.doors);
                presentDoorsSection.replaceWith(doors);
            }

        }
        catch (error) {
            console.log(error)
        }
    }, 500)
}

initPool();



