// courtesy of chatGPT

type ItemWithId = {
  id: string;
  [key: string]: any; // Allows any other properties in the item
};

/**
 * Modifies an item in an array by its ID.
 *
 * @param items - The array of items to modify.
 * @param itemId - The ID of the item to modify.
 * @param modifier - A callback function that takes the item and returns the modified item.
 * @returns A new array with the item modified, if found. Original array if the item is not found.
 */
export function modifyItemById<T extends ItemWithId>(
  items: T[],
  itemId: string,
  modifier: (item: T) => T
): T[] {
  return items.map((item) => {
    if (item.id === itemId) {
      // Found the item by ID, apply the modifier function to it
      return modifier(item);
    }
    // Return the item unchanged if not the one to modify
    return item;
  });
}
