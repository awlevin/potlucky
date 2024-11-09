import { useState, useEffect } from 'react';
import { doc, getFirestore, onSnapshot } from 'firebase/firestore';
import firebaseApp from '../config'; // Adjust this path as necessary

export const useSnapshot = <T,>(coltn: string, docId: string) => {
  const db = getFirestore(firebaseApp);
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reference to a specific document in a collection
    const docRef = doc(db, coltn, docId);
    const unsubscribe = onSnapshot(docRef, (documentSnapshot) => {
      if (documentSnapshot.exists()) {
        setData({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        } as T); // Cast to T if you're sure about the structure, otherwise, consider extending T to include id.
      } else {
        // Handle the case where the document does not exist
        setData(undefined);
      }
      setLoading(false);
    });

    // Cleanup function to unsubscribe from the snapshot listener
    return () => unsubscribe();
  }, [coltn, docId, db]); // Include docId in the dependencies array

  return { data, loading };
};
