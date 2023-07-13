import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where,
  orderBy,
  setDoc,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";

let db = null;

export const initializeConnection = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyBP130pEgfHcqg0b3cjKOTWA_QSGdZ1cIY",
    authDomain: "dailytask-dacdb.firebaseapp.com",
    projectId: "dailytask-dacdb",
    storageBucket: "dailytask-dacdb.appspot.com",
    messagingSenderId: "51652272017",
    appId: "1:51652272017:web:5b2462c4d1148477274430",
    measurementId: "G-0GTF0TDBF4",
  };
  const firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp);
};

export const getDataFromCollection = async (collectionName) => {
  const collRef = collection(db, collectionName);
  const dataList = await getDocs(collRef);
  console.log("dataList ::: ", dataList);
  const dataArray = [];

  dataList.forEach((doc) => {
    const dataItem = { ...doc.data() };
    dataItem.key = doc?._key?.path?.segments[6];
    dataArray.push(dataItem);
  });

  return dataArray;
};
//add task C
export const addTaskToCollection = async (collectionName, task) => {
  const db = getFirestore();
  const collRef = collection(db, collectionName);
  const docRef = await addDoc(collRef, task);
  task.key = docRef.id; // Assign the document ID to the task object
  return docRef;
};
//update the task U

export const updateTaskInCollection = async (
  collectionName,
  key,
  updatedTask
) => {
  const db = getFirestore();
  const docRef = doc(db, collectionName, key);

  const { position, ...taskData } = updatedTask;
  await updateDoc(docRef, taskData);
  // If the `position` field is included in the update, update it separately
  if (position !== undefined) {
    const positionRef = doc(db, collectionName, key, "position");
    await setDoc(positionRef, { position });
  }
};

//delete task D
export const deleteTask = async (collectionName, key) => {
  console.log("key ::: ", key);
  const docRef = doc(db, collectionName, key);
  await deleteDoc(docRef);
  return deleteTask;
};
