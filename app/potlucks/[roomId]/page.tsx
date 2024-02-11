"use client";
import { useAddData } from "@/firebase/firestore/addData";
import { useGetDocument } from "@/firebase/firestore/getData";
import { useSnapshot } from "@/firebase/firestore/onSnapshot";
import { modifyItemById } from "@/utils/modifyItemById";
import { nanoid } from "nanoid";
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
  id: string;
  claimedBy?: string | null; // userId or not
  title: string;
  type?: "appetizer" | "entree" | "dessert";
  attributes?: (
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

const TEST_FOODS: Food[] = [
  { id: "", title: "Salad", type: "appetizer" },
  { id: "", title: "Chicken wings", type: "entree" },
  { id: "", title: "Chocolate cake", type: "dessert" },
];
const getRandFood = () => ({
  ...TEST_FOODS[Math.floor(Math.random() * TEST_FOODS.length)],
  id: nanoid(5),
});

  const TEST_USERS: User[] = [
    {
      id: nanoid(5),
      name: "Aaron",
      color: "lightgray",
      lastActive: new Date(),
      isActive: false,
      dateJoined: new Date(),
    },
    {
      id: nanoid(5),
      name: "Matt",
      color: "lightgray",
      lastActive: new Date(),
      isActive: false,
      dateJoined: new Date(),
    },
    {
      id: nanoid(5),
      name: "James",
      color: "lightgray",
      lastActive: new Date(),
      isActive: false,
      dateJoined: new Date(),
    },
  ];
const getRandUser = () => ({
  ...TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)],
  id: nanoid(5), // do this dynamically
});

export default function Room() {
  // const router = useRouter();
  const { roomId } = useParams();
  // const { getDocument, data, loading: loadingRoom } = useGetDocument<IRoomObj>();
  const { addData, loading: loadingNewFood } = useAddData();
  // useEffect(() => {
  //   getDocument("rooms", roomId as string);
  // }, []);
  const { data, loading: loadingRoom } = useSnapshot<IRoomObj>(
    "rooms",
    roomId as string
  );

  const [currUser, setCurrUser] = useState<IRoomObj["users"][0]>();
  const claimUser = (id: string) => {
    if (currUser?.id === id) {
      setCurrUser(undefined);
    } else {
      const foundUser = data?.users?.find(u => u.id === id);
      setCurrUser(foundUser);
    }
  };

  const addFood = () => {
    addData("rooms", roomId as string, {
      ...data,
      foods: [...(data?.foods || []), getRandFood()],
    });
  }
  const addUser = () => {
    addData("rooms", roomId as string, {
      ...data,
      users: [...(data?.users || []), getRandUser()],
    });
  }

  const claimFood = (id: string) => {
    if (!currUser) {
      console.error("Must claim a user to claim a food");
      return;
    }

    const newFoods = modifyItemById(data?.foods || [], id, (food) => {
      return {
        ...food,
        claimedBy: food.claimedBy === currUser.id ? null : currUser.id,
      };
    });

    addData("rooms", roomId as string, {
      ...data,
      foods: newFoods,
    });
  }

  return (
    <main>
      hi! you made it to {roomId}
      {loadingRoom ? (
        "loading..."
      ) : (
        <div>
          users:
          <ul>
            {Boolean(data?.users?.length) &&
              data?.users.map((user) => (
                <li
                  key={user.id}
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
      {loadingRoom ? (
        "loading..."
      ) : (
        <div>
          foods:
          <ul>
            {Boolean(data?.foods?.length) &&
              data?.foods.map((food) => (
                <li key={food.id} onClick={() => claimFood(food.id)}>
                  {Boolean(food.claimedBy) ? "✅" : "❌"} {food.title}{" "}
                  {food.claimedBy &&
                    ` - ${
                      data?.users?.find((u) => u.id === food.claimedBy)?.name // TODO this is hacky and ugly
                    }`}
                </li>
              ))}
          </ul>
        </div>
      )}
      <button onClick={addFood}>add food</button>
      <button onClick={addUser}>add user</button>
    </main>
  );
}
