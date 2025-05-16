import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, addDoc, getDoc, getDocs, updateDoc, deleteField, arrayUnion, arrayRemove, query, collection, limit, orderBy } from "firebase/firestore";
import {firebaseConfig} from "./fb-credentials.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const db = getFirestore(app);
let lastVisible = null; 

export const registerUser = async (email, password) => {
    try {
        return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        throw new Error("Cannot create user");
    }
}

export const login = async (email, password) => {
    try {
        return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        throw error;
    }
}

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw new Error("Cannot logout");
    }
}

export const getDataByCardID = async (cardId) => {
    try {
        const docsRef = doc(db, 'control-access-app', 'persons');
        const docSnap = await getDoc(docsRef);
        return docSnap.get(cardId)
    }
    catch (error) {
        throw new Error("Could not read data from db")
    }
}

export const addPersonToDBwithCardId = async (data) => {
    try {
        const docsRef = doc(db, 'control-access-app', 'persons');
        return await setDoc(docsRef, {[data.cardId]: data}, {merge: true});
    
    }
    catch (error) {
        throw new Error("Could not read data from db")
    }
}

export const addAccessDataToHistoryDB = async (data) => {
    try {
        const docsRef = doc(db, 'control-access-app-logs', `${data.time}`);
        console.log(data)
        return setDoc(docsRef, data);
    }
    catch (error) {
        throw new Error("Could not write data from db")
    }
}


export const getAccessDataFromHistoryDB = async (pageLimit=10, offset=0) => {
    try {
        if(offset === 0)lastVisible = null;
        const logs = [];
        let q = null;
        if(lastVisible){
            q = query(collection(db, "control-access-app-logs"),
                orderBy("time", "desc"),
                startAfter(lastVisible),
                limit(pageLimit));
        }
        else {
            q = query(collection(db, "control-access-app-logs"), orderBy("time", "desc"), limit(pageLimit));

        }

        const docSnap = await getDocs(q);
        docSnap.forEach((doc) => logs.push(doc.data()));
        return logs;
    }
    catch (error) {
        console.log(error)
        throw new Error("Could not read data from db")
    }
}
