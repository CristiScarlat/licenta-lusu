import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, addDoc, getDoc, updateDoc, deleteField, arrayUnion, arrayRemove } from "firebase/firestore";
import {firebaseConfig} from "./fb-credentials.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const registerUser = async (email, password) => {
    try {
        return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.log(error);
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
        console.log(error);
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
        console.log(error)
        throw new Error("Could not read data from db")
    }
}

export const addAccessDataToHistoryDB = async (data) => {
    try {

        console.log(data)
        const docsRef = doc(db, 'control-access-app', 'history');
        return setDoc(docsRef, { [data.time]: data }, { merge: true });
        // return docSnap.get(cardId)
    }
    catch (error) {
        console.log(error)
        throw new Error("Could not read data from db")
    }
}