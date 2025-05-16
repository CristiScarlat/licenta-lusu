import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, addDoc, getDoc, getDocs, updateDoc, deleteField, arrayUnion, arrayRemove, query, collection, limit, orderBy, startAfter, startAt } from "firebase/firestore";
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


let cursors = [null]; // first page starts with null
let currentPageIndex = 0;

export const getAccessDataFromHistoryDB = async (
  pageLimit = 10,
  direction
) => {
  try {
    if(direction === undefined){
        currentPageIndex = 0;
        cursors = [null];
    }  
    const logs = [];
        
    if (direction === "next") {
      currentPageIndex++;
      if (cursors.length <= currentPageIndex) cursors.push(null); // reserve space
    } else if (direction === "prev") {
      if (currentPageIndex > 0) {
        currentPageIndex--;
      }
    }

    const currentCursor = cursors[currentPageIndex];

    let q;

    if (currentCursor) {
      if (direction === "next") {
        q = query(
          collection(db, "control-access-app-logs"),
          orderBy("time", "desc"),
          startAfter(currentCursor),
          limit(pageLimit)
        );
      } else {
        q = query(
          collection(db, "control-access-app-logs"),
          orderBy("time", "desc"),
          startAt(currentCursor),
          limit(pageLimit)
        );
      }
    } else {
      q = query(
        collection(db, "control-access-app-logs"),
        orderBy("time", "desc"),
        limit(pageLimit)
      );
    }

    const docSnap = await getDocs(q);
    const docs = docSnap.docs;

    if (docs.length > 0) {
      // Save the first document of the page as the cursor
      cursors[currentPageIndex] = docs[0];

      // Pre-load the next page cursor (to be used for next request)
      if (direction === "next") {
        cursors[currentPageIndex + 1] = docs[docs.length - 1];
      }
    }

    docs.forEach((doc) => logs.push(doc.data()));

    return logs;
  } catch (error) {
    console.error(error);
    throw new Error("Could not read data from db");
  }
};
