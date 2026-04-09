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
  claimedBy?: string | string[] | null; // single userId, array of userIds, or unclaimed
  title: string;
  notes?: string;
  type?: "appetizer" | "main" | "side" | "dessert" | "drink";
  attributes?: (
    | "vegetarian"
    | "vegan"
    | "gluten-free"
    | "nut-free"
    | "dairy-free"
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