import { useState } from "react";
import firebaseApp from "../config";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const db = getFirestore(firebaseApp)
export default async function addData(colllection: string, id: string, data: Object) {
    let result = null;
    let error = null;

    try {
        result = await setDoc(doc(db, colllection, id), data, {
            merge: true,
        });
    } catch (e) {
        error = e;
    }

    return { result, error };
}

export const useAddData = () => {
    const [loading, setLoading] = useState(false);
    const doAddData = async (collection: string, id: string, data: Object) => {
        setLoading(true);
        const outputs = await addData(collection, id, data)
        setLoading(false);
        return outputs;
    }
    return { addData: doAddData, loading }
}