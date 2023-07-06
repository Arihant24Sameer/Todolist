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
  deleteDoc,
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
    console.log("doc ::: ", doc);
    console.log("doc key ::: ", doc?._key.path.segments[6]);
    console.log("doc.data : ", doc._key.path.segments[6]);

    dataArray.push(doc.data());
  });

  return dataArray;
};

export const deleteTask = async (collectionName, docId) => {
  console.log("doc id : ", docId);
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);

  console.log("Document deleted successfully!");
};

// const setDataToCollection = async (collectionName, data) => {
//   const collRef = collection(db, collectionName);
//   const docRef = doc(collRef);
//   console.log("collectionName ", collectionName);
//   console.log("data ", data);
//   console.log("docRef : ", docRef);

//   const result = await setDoc(docRef, {
//     title: data?.title,
//     description: data?.description,
//   });
//   console.log("after saving : ", result);
//   return {
//     status: true,
//   };
// };

// setDataToCollection("todoData", {
//   title: "JavaScript",
//   description: "It is a awsome language!! ",
// });
