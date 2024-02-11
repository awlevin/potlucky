"use client";
import { useGetDocument } from "@/firebase/firestore/getData";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string; // first and last
  dateJoined: Date; // date joined this room
  lastActive: Date; // last active in this room
  isActive: boolean;
  color: string;
};

type Food = {
  claimedBy: string | null; // userId or not
  title: string;
  type: "appetizer" | "entree" | "dessert";
  attributes: (
    | "vegetarian"
    | "vegan"
    | "keto"
    | "pescatarian"
    | "dairy free"
  )[];
};

interface IRoomObj {
  users: User[];
  foods: Food[];
}

export default function Room() {
  // const router = useRouter();
  const { roomId } = useParams();
  const { getDocument, data, loading } = useGetDocument<IRoomObj>();
  useEffect(() => {
    getDocument("rooms", roomId as string);
  }, []);

  const [currUser, setCurrUser] = useState<IRoomObj["users"][0]>();
  const claimUser = (id: string) => {
    if (currUser?.id === id) {
      setCurrUser(undefined);
    } else {
      const foundUser = data?.users?.find(u => u.id === id);
      setCurrUser(foundUser);
    }
  };

  return (
    <main>
      hi! you made it to {roomId}
      {loading ? (
        "loading..."
      ) : (
        <div>
          users:
          <ul>
            {Boolean(data?.users?.length) &&
              data?.users.map((user) => (
                <li
                  key={user.name}
                  onClick={() => claimUser(user.id)}
                  style={{
                    backgroundColor:
                      currUser?.id === user.id ? "green" : "inherit",
                  }}
                >
                  {user.name}
                </li>
              ))}
          </ul>
        </div>
      )}
    </main>
  );
}
