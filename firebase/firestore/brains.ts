// this is an experiment to combine addData and useSnapshot into a single listener to abstract optimistic updates
import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  getFirestore,
  setDoc,
  onSnapshot,
  // query,
  // collection,
  // addDoc,
  DocumentData,
  FirestoreError,
} from "firebase/firestore";
import firebaseApp from '../config'; // Adjust this path as necessary

type WithId<T> = T & { id: string };
export const useRealtimeData = <T extends DocumentData>(coltn: string, docId: string) => {
  const db = getFirestore(firebaseApp);
  const [data, setData] = useState<WithId<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  // console.log("data:", data);

  const updateData = useCallback(async (newData: Partial<T>) => {
    // Perform optimistic update
    const optimisticUpdate = { ...data, ...newData };
    setData(optimisticUpdate as WithId<T>);

    try {
      const docRef = doc(db, coltn, docId);
      await setDoc(docRef, newData, { merge: true });
      // No need to manually revert the optimistic update; onSnapshot will eventually ensure data consistency
    } catch (err) {
      setError(err as FirestoreError);
      // Optionally, revert optimistic update here if necessary
      // setData(previousData); // Assuming you have a way to access the previousData
    }
  }, [coltn, docId, db, data]);

  useEffect(() => {
    setLoading(true);
    const docRef = doc(db, coltn, docId);
    const unsubscribe = onSnapshot(docRef, (documentSnapshot) => {
      if (documentSnapshot.exists()) {
        setData({
          id: documentSnapshot.id,
          ...documentSnapshot.data() as T,
        });
        setError(null); // Clear any previous errors
      } else {
        setData(null);
        setError(new Error('Document does not exist.') as FirestoreError); // Updated to keep consistent error handling
      }
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [coltn, docId, db]);

  return { data, loading, error, updateData };
};

// export const useRealtimeData = <T extends DocumentData>(coltn: string, docId: string) => {
//   const db = getFirestore(firebaseApp);
//   const [data, setData] = useState<WithId<T> | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<Error | null>(null);

//   const updateData = useCallback(async (newData: Partial<T>) => {
//     setLoading(true);
//     try {
//       const docRef = doc(db, coltn, docId);
//       await setDoc(docRef, newData, { merge: true });
//       // No need to manually update local state; onSnapshot will handle this
//     } catch (err) {
//       setError(err as FirestoreError);
//     } finally {
//       setLoading(false);
//     }
//   }, [coltn, docId, db]);

//   useEffect(() => {
//     const docRef = doc(db, coltn, docId);
//     const unsubscribe = onSnapshot(docRef, (documentSnapshot) => {
//       if (documentSnapshot.exists()) {
//         setData({
//           id: documentSnapshot.id,
//           ...documentSnapshot.data() as T,
//         });
//         setError(null); // Clear any previous errors
//       } else {
//         setError(new Error("Document does not exist"));
//         setData(null);
//       }
//       setLoading(false);
//     }, (err) => {
//       setError(err);
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, [coltn, docId, db]);

//   return { data, loading, error, updateData };
// };


// export const useRealtimeData = <T>({ coltn }: { coltn: string}) => {
//   const db = getFirestore(firebaseApp);
//   const [data, setData] = useState<T | null>(null);
//   const [loading, setLoading] = useState(true);

//   const addData = useCallback(async (newData: T) => {
//     try {
//       // Optimistically update the UI before the data is actually added to Firestore
//       const newDocRef = doc(collection(db, coltn)); // Get a new document reference
//       const optimisticData = { ...newData, id: newDocRef.id } as T; // Mimic the Firestore document structure

//       setData((currentData) => ({ ...currentData, ...optimisticData })); // Update local state optimistically

//       // TODO: this might be an issue later... lol
//       // @ts-ignore
//       await setDoc(newDocRef, newData); // Persist the new document to Firestore
//       // No need to manually revert the optimistic update; onSnapshot will ensure consistency
//     } catch (error) {
//       console.error("Error adding document: ", error);
//       // Optionally handle reverting the optimistic update here if necessary
//     }
//   }, [coltn, db]);

//   useEffect(() => {
//     // Reference to a specific document in a collection
//     const docRef = doc(db, coltn, docId);
//     const unsubscribe = onSnapshot(docRef, (documentSnapshot) => {
//       if (documentSnapshot.exists()) {
//         setData({
//           id: documentSnapshot.id,
//           ...documentSnapshot.data(),
//         } as T); // Cast to T if you're sure about the structure, otherwise, consider extending T to include id.
//       } else {
//         // Handle the case where the document does not exist
//         setData(undefined);
//       }
//       setLoading(false);
//     });

//     // Cleanup function to unsubscribe from the snapshot listener
//     return () => unsubscribe();
//   }, [coltn, docId, db]); // Include docId in the dependencies array
//   useEffect(() => {
//     const q = query(collection(db, coltn));
//     const unsubscribe = onSnapshot(q, (querySnapshot) => {
//       const items = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setData(items); // This will correct any discrepancies introduced by optimistic updates
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, [coltn, db]);

//   return { data, loading, addData };
// };


// const db = getFirestore(firebaseApp)
// export default async function addData(
//   colllection: string,
//   id: string,
//   data: Object
// ) {
//   let result = null;
//   let error = null;

//   try {
//     result = await setDoc(doc(db, colllection, id), data, {
//       merge: true,
//     });
//   } catch (e) {
//     error = e;
//   }

//   return { result, error };
// }

// export const useAddData = () => {
//     const [loading, setLoading] = useState(false);
//     const doAddData = async (collection: string, id: string, data: Object) => {
//         setLoading(true);
//         const outputs = await addData(collection, id, data)
//         setLoading(false);
//         return outputs;
//     }
//     return { addData: doAddData, loading }
// }

// export const useSnapshot = <T,>(coltn: string, docId: string) => {
//   const [data, setData] = useState<T | undefined>(undefined);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Reference to a specific document in a collection
//     const docRef = doc(db, coltn, docId);
//     const unsubscribe = onSnapshot(docRef, (documentSnapshot) => {
//       if (documentSnapshot.exists()) {
//         setData({
//           id: documentSnapshot.id,
//           ...documentSnapshot.data(),
//         } as T); // Cast to T if you're sure about the structure, otherwise, consider extending T to include id.
//       } else {
//         // Handle the case where the document does not exist
//         setData(undefined);
//       }
//       setLoading(false);
//     });

//     // Cleanup function to unsubscribe from the snapshot listener
//     return () => unsubscribe();
//   }, [coltn, docId, db]); // Include docId in the dependencies array

//   return { data, loading };
// };

