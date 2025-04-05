import { testCardIDInput, scannedCardInfoSection, loginForm, header } from "./components.js";

const mainContainer = document.getElementById("app");
const userStr = localStorage.getItem("user");
const user = userStr ? JSON.parse(userStr) : null;

if (user?.uid) {
    renderMainScreen();
}
else {
    renderLoginPage();
}

function renderLoginPage() {
    mainContainer.innerHTML = "";
    mainContainer.append(loginForm());
    handleLogin();
}


function renderMainScreen() {
    mainContainer.innerHTML = "";
    mainContainer.append(header(), testCardIDInput(), scannedCardInfoSection());


    const scanedIdInput = document.querySelector("#test-card-id>input");
    const scanedIdButtn = document.querySelector("#test-card-id>button");
    const userInfo = document.querySelector("#user-info");
    const logoutBtn = document.getElementById("logout-button");




    const fetchCardData = async () => {
        try {
            const cardIdValue = scanedIdInput.value;
            const res = await fetch(`/cardID/${cardIdValue}`);
            const { data } = await res.json();
            console.log(data)
            if (data === undefined || Object.keys(data).length === 0) {
                userInfo.style.backgroundColor = "darkred";
                userInfo.innerText = "Card neînregistrat, accesul nu este permis!";
                return
            }
            userInfo.style.backgroundColor = "darkgreen";
            userInfo.innerText = `Aces permis pentru | ${data.name} | prin poarta | ${data.accessDoor} |.`;
        }
        catch (error) {
            console.log(error)
        }

    }

    scanedIdButtn.addEventListener("click", fetchCardData)
    logoutBtn.addEventListener("click", () => {
        fetch("/signout")
        .then(() => {
            localStorage.removeItem("user");
            renderLoginPage();
        })
        .catch(error => {
            console.log(error)
            alert("Cannot logout")
        })
    })
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
        const res = await fetch("/signin", {method: "POST", body: JSON.stringify(loginData)});
        const data = await res.json();
        if(data.user.uid){
            localStorage.setItem("user", JSON.stringify({uid: data.user.uid, email: data.user.email}));
            renderMainScreen();
        }
    })
}



