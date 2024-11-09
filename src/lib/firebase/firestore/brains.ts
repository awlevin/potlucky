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

export type WithId<T> = T & { id: string };
export const useRealtimeData = <T extends DocumentData>(coltn: string, docId: string) => {
  const db = getFirestore(firebaseApp);
  const [data, setData] = useState<WithId<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

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
