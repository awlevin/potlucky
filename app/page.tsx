'use client'
import styles from "./page.module.css";
import { useAddData } from "@/firebase/firestore/addData";
import { nanoid } from 'nanoid'
import { useRouter } from "next/navigation";

const FUN_SLUGS = [
  "pumpkin",
  "pleasant",
  "cheesy",
  "baked",
  "milky",
  "oily",
  "smooth",
  "plump",
];

const getFunSlug = () => FUN_SLUGS[Math.floor(Math.random() * FUN_SLUGS.length)];

export default function Home() {

  const { addData, loading } = useAddData();
  const router = useRouter();

  const onNewRoomClick = async () => {
    const data = {
      users: [],
      foods: [],
    }
    const roomId = `${getFunSlug()}-${getFunSlug()}-${nanoid(5)}`;
    const { result, error } = await addData('rooms', roomId, data)
    console.log({ result, error })

    if (error) {
      return console.error(error)
    } else {
      router.push(`/potlucks/${roomId}`);
    }
  }

  return (
    <main className={styles.main}>
      <button onClick={onNewRoomClick} disabled={loading}>
        {loading ? "loading" : "new room"}
      </button>
      <button>join room</button>
    </main>
  );
}
