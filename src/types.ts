export type DietaryRestriction =
  | "vegetarian"
  | "vegan"
  | "gluten-free"
  | "nut-free"
  | "dairy-free";

export type User = {
  id: string;
  name: string; // first and last
  dateJoined?: Date; // date joined this room
  lastActive?: Date; // last active in this room
  isActive?: boolean;
  color?: string;
  dietaryRestrictions?: DietaryRestriction[];
  dietaryNote?: string; // free-text for restrictions not covered by presets
};

export type Food = {
  id: string;
  claimedBy?: string | string[] | null; // single userId, array of userIds, or unclaimed
  title: string;
  notes?: string;
  type?: "appetizer" | "main" | "side" | "dessert" | "drink";
  attributes?: DietaryRestriction[];
};

export interface IRoomObj {
  id: string;
  name: string;
  date?: string;
  location?: string;
  users: User[];
  foods: Food[];
}

/* ---------- Recipe & Shopping List Feature ---------- */

export type RecipeOption = {
  name: string;
  prepTime: string;
  cost: number; // USD estimate
  description: string;
};

export type RecipeResult = {
  dishTitle: string;
  recipeName: string;
  servings: number;
  prepTime: string;
  ingredients: { item: string; quantity: string }[];
  steps: string[];
  tips?: string;
};

export type ShoppingItem = {
  item: string;
  quantity: string;
  aisle: string;
};

export type RecipeCache = {
  options: Record<string, RecipeOption[]>; // dishId -> 3 options
  selections: Record<string, number>; // dishId -> selected option index
  servings: Record<string, number>; // dishId -> user-adjusted servings
  recipes: RecipeResult[];
  shoppingList: ShoppingItem[];
  dishIds: string[]; // to invalidate when dishes change
  generatedAt: string;
};