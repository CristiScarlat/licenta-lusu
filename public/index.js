import { TestCardIDInput, ScannedCardInfoSection, LoginForm, DoorsSection, Table, ManualDoorsSection, addUserForm } from "./components.js";
import Router from "./router.js";

let tickPool = null;

const mainContainer = document.getElementById("app");
const header = document.querySelector("header");
const userStr = sessionStorage.getItem("user");
const user = userStr ? JSON.parse(userStr) : null;

const historyBtn = document.getElementById("history-screen");
historyBtn.addEventListener("click", () => {
    router.navigate("/history")
});

const monitorBtn = document.getElementById("monitor-screen");
monitorBtn.addEventListener("click", () => {
    router.navigate("/")
});

const adminBtn = document.getElementById("admin-screen");
adminBtn.addEventListener("click", () => {
    router.navigate("/admin")
});

const onNavigate = (path) => {
    console.log("on-navigate", path)
    switch (path) {
        case "/":
            monitorBtn.classList.add("current");
            historyBtn.classList.remove("current");
            adminBtn.classList.remove("current");
            break;
        case "/history":
            historyBtn.classList.add("current");
            monitorBtn.classList.remove("current");
            adminBtn.classList.remove("current");
            break;
        case "/admin":
            adminBtn.classList.add("current");
            monitorBtn.classList.remove("current");
            historyBtn.classList.remove("current");
            break;
    }
}

const router = new Router({
    home: { path: "/", renderer: renderMainScreen },
    history: { path: "/history", renderer: renderHistoryScreen },
    admin: { path: "/admin", renderer: renderAdminPage },
    login: { path: "/login", renderer: renderLoginPage }
}, onNavigate)

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

const removeUserFromStorage = () => {
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

function renderAdminPage() {
    clearInterval(tickPool);
    mainContainer.innerHTML = "";
    mainContainer.append(addUserForm());
    const scanBtn = document.querySelector("#add-user-form .scan-btn");
    scanBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/scan-card");
            const data = await res.json();
            const cardIdInput = document.querySelector('#add-user-form input[name="cardID"]');
            cardIdInput.value = data.cardId;
        }
        catch (error) {
            console.log(error)
        }
    });

    const addPersonForm = document.querySelector("#add-user-form form");
    addPersonForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get("name");
        const email = formData.get("email");
        const accessDoor = formData.get("accessDoor");
        const cardId = formData.get("cardID");
        try {
            const res = await fetch("/register-member", { method: "POST", body: JSON.stringify({ name, email, accessDoor, cardId }) });
            const data = await res.json();
            alert("Membru salvat cu succes.");
        }
        catch (error) {
            console.log(error);
            alert("A aparut o eroare!");
        }
    })
}

function renderLoginPage() {
    mainContainer.innerHTML = "";
    mainContainer.append(LoginForm());
    handleLogin();
}



function renderMainScreen() {
    tickPool = initPool();
    mainContainer.innerHTML = "";
    const contentContainer = document.createElement("div");

    const sectionLeft = document.createElement("div");
    sectionLeft.style.maxWidth = "20rem";
    const sectionRight = document.createElement("div");
    sectionLeft.append(DoorsSection([0, 0, 0, 0]), ManualDoorsSection([0, 0, 0, 0]), ScannedCardInfoSection())

    contentContainer.append(sectionLeft, sectionRight)
    mainContainer.append(contentContainer);

    const userInfo = document.querySelector("#users-access-display");
    const logoutBtn = document.getElementById("logout-button");
    const manualBtns = document.querySelectorAll("#manual-doors-section button")

    manualBtns.forEach(button => {
        button.addEventListener("click", async () => {
            try {
                await fetch('/access-gate', { method: "POST", body: JSON.stringify({ accessDoor: button.innerText }) })
            }
            catch (error) {
                alert("Ușa nu poate fi acționată manual!")
            }
        })
    })

    logoutBtn.addEventListener("click", () => {
        fetch("/signout")
            .then(() => {
                removeUserFromStorage()
                router.navigate("/login")
            })
            .catch(error => {
                console.log(error)
                alert("Cannot logout")
            })
    })
}

let historyPage = 0;

async function renderHistoryScreen() {
    try {
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
        const table = Table({ head: historyTableCols, body: logs });
        const pagination = document.createElement("div");
        pagination.className = "pagination-footer";
        pagination.innerHTML = `
            <button id="prev-btn">Pagina anterioară</button>
            <button id="next-btn">Pagina următoare</button>
        `
        contentContainer.append(pagination, table);
        mainContainer.append(contentContainer);
        const prevPageBtn = document.getElementById("prev-btn");
        const nextPageBtn = document.getElementById("next-btn");
        prevPageBtn.addEventListener("click", async () => {
            const res = await fetch(`/history?direction=prev`);
            const logs = await res.json();
            const tableObj = document.querySelector("table");
            tableObj.remove();
            const table = Table({ head: historyTableCols, body: logs });
            contentContainer.appendChild(table)
        })
        nextPageBtn.addEventListener("click", async () => {
            const res = await fetch(`/history?direction=next`);
            const logs = await res.json();
            const tableObj = document.querySelector("table");
            tableObj.remove();
            const table = Table({ head: historyTableCols, body: logs });
            contentContainer.appendChild(table)
        })

    }
    catch (error) {
        alert(error.toString())
    }
}


function initPool() {
    return setInterval(async () => {
        try {
            const res = await fetch('/access-gate')
            const data = await res.json();
            console.log(data.persons)
            const presentDoorsSection = document.getElementById("doors-section");
            const currentPersonAccess = document.getElementById("users-access-display");
            if (presentDoorsSection) {
                const doors = DoorsSection(data.doors);
                presentDoorsSection.replaceWith(doors);
            }
            if(currentPersonAccess){
                currentPersonAccess.innerHTML = "<label>Informații card scanat</label>";
               data.persons.forEach(persInfo => {
                   if(persInfo.name){
                       const p = document.createElement("p");
                       p.style = "background-color: darkgreen;color: white;padding: 1rem;";
                       p.innerText = `${persInfo.name} are acces pe poarta ${persInfo.accessDoor}`;
                       currentPersonAccess.append(p)
                   }
                   
                })
            }

        }
        catch (error) {
            console.log(error)
        }
    }, 500)
}






