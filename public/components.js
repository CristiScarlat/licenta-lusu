export function header(){
    const container = document.createElement("header");
    container.innerHTML = `
        <button id="logout-button">Logout</button>
    `
    return container;
}

export function testCardIDInput() {
    const container = document.createElement("div");
    container.className = "section";
    container.id = "test-card-id"
    container.innerHTML = `
        <input type="text" placeholder="type your code here"/>
        <button>Permite acces</button>
    `
    return container;
}

export function scannedCardInfoSection(data) {
    const container = document.createElement("div");
    container.className = "section";
    container.id = "user-info"
    container.innerHTML = `
        
    `
    return container;
}

export function addUserFormSection(data) {
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

export function loginForm() {
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