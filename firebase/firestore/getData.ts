import { getFirestore, doc, getDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export async function getDocument<T>(collection: string, id: string): Promise<{ data: T | null, error: Error | null }> {
    const docRef = doc(db, collection, id);

    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            // Assuming the document's data can be directly cast to T
            return { data: docSnap.data() as T, error: null };
        } else {
            // doc.data() will be undefined in this case
            return { data: null, error: null };
        }
    } catch (error) {
        return { data: null, error: error as Error };
    }
}
import { useState } from "react";

export const useGetDocument = <T,>() => {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const doGetDocument = async (collection: string, id: string) => {
        setLoading(true);
        const { data: fetchedData, error: fetchedError } = await getDocument<T>(collection, id);
        
        setData(fetchedData);
        setError(fetchedError);
        setLoading(false);

        // Optionally, you might return fetchedData here if you want to use it right after fetching
    };

    return { getDocument: doGetDocument, data, error, loading };
};
