import User from "../models/User.js";

/**
 * What a new account starts with. Flower names are stable keys (e.g. "orchid")
 * rather than display names; the client translates them.
 */
export const INITIAL_INVENTORY = [{ kind: "flower", name: "orchid", count: 5 }];

/** A fresh copy of the initial inventory, safe to hand to a new document. */
export const initialInventory = () =>
  INITIAL_INVENTORY.map((entry) => ({ ...entry }));

/**
 * Removes `quantity` of one inventory entry. The availability check and the
 * decrement happen in a single update, so concurrent requests cannot spend
 * the same stack twice. Emptied entries are dropped.
 *
 * Returns the updated inventory, or null when the entry is missing or short.
 */
export async function takeFromInventory(userId, { kind, name, quantity }) {
  const user = await User.findOneAndUpdate(
    {
      _id: userId,
      inventory: {
        $elemMatch: { kind, name, count: { $gte: quantity } },
      },
    },
    { $inc: { "inventory.$.count": -quantity } },
    { new: true, projection: { inventory: 1 } },
  );
  if (!user) return null;

  if (user.inventory.some((entry) => entry.count <= 0)) {
    const cleaned = await User.findByIdAndUpdate(
      userId,
      { $pull: { inventory: { count: { $lte: 0 } } } },
      { new: true, projection: { inventory: 1 } },
    );
    return cleaned.inventory;
  }
  return user.inventory;
}

/**
 * Adds `quantity` back to an inventory entry, recreating it if it was dropped.
 * Used to undo `takeFromInventory` when the follow-up write fails.
 */
export async function returnToInventory(userId, { kind, name, quantity }) {
  const result = await User.updateOne(
    { _id: userId, inventory: { $elemMatch: { kind, name } } },
    { $inc: { "inventory.$.count": quantity } },
  );
  if (result.matchedCount === 0) {
    await User.updateOne(
      { _id: userId },
      { $push: { inventory: { kind, name, count: quantity } } },
    );
  }
}
