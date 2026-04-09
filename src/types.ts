export type User = {
  id: string;
  name: string; // first and last
  dateJoined?: Date; // date joined this room
  lastActive?: Date; // last active in this room
  isActive?: boolean;
  color?: string;
};

export type Food = {
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

export interface IRoomObj {
  id: string;
  name: string;
  date?: string;
  location?: string;
  users: User[];
  foods: Food[];
} 