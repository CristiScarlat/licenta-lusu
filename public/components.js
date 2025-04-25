export function TestCardIDInput() {
    const container = document.createElement("div");
    container.className = "section";
    container.id = "test-card-id"
    container.innerHTML = `
        <input type="text" placeholder="type your code here"/>
        <button>Permite acces</button>
    `
    return container;
}

export function ScannedCardInfoSection(data) {
    const container = document.createElement("div");
    container.className = "section";
    container.id = "users-access-display"
    container.innerHTML = `
        
    `
    return container;
}

export function LogsContainer(data) {
    const container = document.createElement("div");
    container.className = "section";
    container.id = "history-section"
    container.innerHTML = `
        
    `
    return container;
}

export function AddUserFormSection(data) {
    const container = document.createElement("div");
    container.className = "section";
    container.id = "register-user"
    container.innerHTML = `
    <label>Adaugă un nou utilizator</label>
    <form>
        <div>
            <label>Nume și prenume</label>
            <input />
        </div>
        <div>
            <label>Email</label>
            <input type="email"/>
        </div>
        <div>
            <label>Serie și număr CI</label>
            <input />
        </div>
        <div>
            <label>Poartă acces</label>
            <select>
                <option value="0">Poarta 1</option>
                <option value="1">Poarta 2</option>
                <option value="2">Poarta 3</option>
                <option value="3">Poarta 4</option>
            </select>
        </div>
        <button type="submit">Salvează</button>
    </form>
    `
    return container;
}

export function LoginForm() {
    const container = document.createElement("div");
    container.className = "section";
    container.id = "login-form"
    container.innerHTML = `
    <form>
        <div>
            <label>Email</label>
            <input type="email" name="email"/>
        </div>
        <div>
            <label>Password</label>
            <input type="password" name="password"/>
        </div>
        <div>
            <button type="submit">Login</button>
        </div>
    </form>
    `
    return container;

}

export function ClosedDoorIcon() {
    const container = document.createElement("div");
    container.className = "";
    container.id = "closed-door";
    container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M96 64c0-35.3 28.7-64 64-64L416 0c35.3 0 64 28.7 64 64l0 384 64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-112 0-288 0L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0L96 64zM384 288a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg>`;
    return container;
}

export function OpenDoorIcon() {
    const container = document.createElement("div");
    container.className = "";
    container.id = "closed-door";
    container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M320 32c0-9.9-4.5-19.2-12.3-25.2S289.8-1.4 280.2 1l-179.9 45C79 51.3 64 70.5 64 92.5L64 448l-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0 192 0 32 0 0-32 0-448zM256 256c0 17.7-10.7 32-24 32s-24-14.3-24-32s10.7-32 24-32s24 14.3 24 32zm96-128l96 0 0 352c0 17.7 14.3 32 32 32l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-32 0 0-320c0-35.3-28.7-64-64-64l-96 0 0 64z"/></svg>`;
    return container;
}

export function DoorsSection(doorsArray) {
    const container = document.createElement("div");
    container.className = "section";
    container.id = "doors-section";
    doorsArray.forEach(door => {
        door ? container.append(OpenDoorIcon()) : container.append(ClosedDoorIcon());
    });
    return container;
}

export function ManualDoorsSection(doorsArray) {
    const container = document.createElement("div");
    container.className = "section";
    container.id = "manual-doors-section";
    doorsArray.forEach((door, index) => {
        const btn = document.createElement("button");
        btn.innerText = index;
        container.append(btn)
    });
    return container;
}

export function Table(tableData) {
    const table = document.createElement("table");

    const tableHead = document.createElement("thead");
    const tableBody = document.createElement("tbody");

    console.log(tableData.body)
    tableHead.innerHTML = `
        <tr>
        ${Object.keys(tableData.head).map(col => `<th>${col}</th>`).join("")}
        </tr>
    `

    tableBody.innerHTML = tableData.body.map(obj => {
        return(
        `<tr class=${obj["error"] === null ? "green" : "red"}>
        ${Object.keys(tableData.head).map(col => `<td>${obj[tableData.head[col]] ? col === "Data" ? formatDate(obj[tableData.head[col]]) : obj[tableData.head[col]] : "-"}</td>`).join("")}
        </tr>`
    )
    }).join("")

    table.append(tableHead, tableBody);
    return table
}

function formatDate(unixtime) {
    const months = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"]
    const date = new Date(unixtime);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    return `${day}/${months[month]}/${year} ${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}`
}