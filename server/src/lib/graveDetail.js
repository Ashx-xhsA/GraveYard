import Interaction from "../models/Interaction.js";

/**
 * Summarises a grave's interactions. This is the only place stats are computed,
 * so every endpoint reports the same numbers.
 *
 * - totalOfferings: sum of `quantity` over all items
 * - totalMessages:  number of messages
 * - byName:         item quantities grouped by `itemName`, in first-seen order
 */
export const computeStats = (interactions) => {
  let totalOfferings = 0;
  let totalMessages = 0;
  const countsByName = new Map();

  for (const interaction of interactions) {
    if (interaction.type === "message") {
      totalMessages += 1;
    } else if (interaction.type === "item") {
      const quantity = interaction.quantity ?? 1;
      const name = interaction.itemName ?? "";
      totalOfferings += quantity;
      countsByName.set(name, (countsByName.get(name) ?? 0) + quantity);
    }
  }

  const byName = [...countsByName].map(([name, count]) => ({ name, count }));
  return { totalOfferings, totalMessages, byName };
};

/** Stats for one grave, for endpoints that do not need the full history. */
export const getGraveStats = async (graveObjectId) => {
  const interactions = await Interaction.find({ grave_id: graveObjectId })
    .select("type itemName quantity")
    .lean();
  return computeStats(interactions);
};

/**
 * Turns a Grave document into the shape clients receive: `block` and `user`
 * populated, plus an `interaction` field assembled from the Interaction
 * collection (it is not stored on the grave).
 */
export const buildGraveDetail = async (grave) => {
  if (!grave) return null;

  const missing = [
    { path: "user", select: "username" },
    { path: "block" },
  ].filter(({ path }) => !grave.populated(path));
  if (missing.length > 0) await grave.populate(missing);

  const history = await Interaction.find({ grave_id: grave._id })
    .populate("user", "username")
    .sort({ createdAt: 1 });

  return {
    ...grave.toObject(),
    interaction: {
      stats: computeStats(history),
      history,
    },
  };
};
