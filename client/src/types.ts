/**
 * Shapes of the JSON returned by the API.
 *
 * These describe API responses, not the Mongoose schemas: responses contain
 * populated references and fields computed at query time (e.g. `interaction`).
 */

/** A user reference after `populate("user", "username")`. */
export interface UserRef {
  _id: string;
  username: string;
}

/** An image with optional inline styles, stored as a JSON string such as `'{"backgroundSize":"cover"}'`. */
export interface BackgroundImage {
  url: string;
  styles?: string;
}

/** A graveyard block. */
export interface GyBlock {
  _id: string;
  /** Human-readable ID used in URLs, e.g. `"sea-1"`. */
  blockID: string;
  name: string;
  /** Entry icon shown on the home page. */
  blockIconImage?: string;
  /** Default grave sprite for graves in this block. */
  graveIcon?: string;
  backgroundImage: BackgroundImage;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface InteractionBase {
  _id: string;
  /** The grave's `_id`, not its `graveID`. */
  grave_id: string;
  /** Null when the author's account no longer exists. */
  user: UserRef | null;
  createdAt: string;
  updatedAt: string;
}

/** Something offered to a grave. Flowers and named items are both items. */
export interface ItemInteraction extends InteractionBase {
  type: 'item';
  itemName: string;
  quantity: number;
}

export interface MessageInteraction extends InteractionBase {
  type: 'message';
  content: string;
}

/** A single interaction left on a grave; narrow on `type` to access its fields. */
export type InteractionRecord = ItemInteraction | MessageInteraction;

export interface GraveStats {
  /** Total quantity of all items offered. */
  totalOfferings: number;
  totalMessages: number;
  /** Offered quantities grouped by item name. */
  byName: { name: string; count: number }[];
}

/** Fields stored on the grave document itself. */
export interface Grave {
  _id: string;
  /** Human-readable ID used in URLs, e.g. `"grave-1"`. */
  graveID: string;
  name: string;
  /** Date string such as `"2025-03-12"`, not a Date. */
  birth?: string;
  death?: string;
  epitaph?: string;
  memorial?: string;
  burial?: { display_name?: string; address?: string };
  photos?: string[];
  /** Custom grave sprite; empty when the block's default should be used. */
  icon: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * A grave with its block and creator populated, plus interaction data
 * that the server assembles per request (it is not stored in the database).
 */
export interface GraveDetail extends Grave {
  block: GyBlock;
  user: UserRef;
  interaction: {
    stats: GraveStats;
    /** Sorted by `createdAt`, oldest first. */
    history: InteractionRecord[];
  };
}

/** Response of `GET /grave?block=&page=&limit=`. */
export interface GraveListResponse {
  graves: GraveDetail[];
  totalPages: number;
  currentPage: number;
  total: number;
  /** The requested block, or null when no block was requested or it does not exist. */
  blockInfo: GyBlock | null;
}

/** A favorited grave as returned by `GET /user/me`. */
export type FavoriteRef = Pick<Grave, '_id' | 'graveID' | 'name'>;

/**
 * One stack in the user's inventory. Entries with the same kind and name are
 * merged; items start with an empty name until the user names them.
 */
export interface InventoryEntry {
  kind: 'flower' | 'item';
  name: string;
  count: number;
}

export type UserRole = 'user' | 'admin';

/** Response of `GET /user/me`. */
export interface MeResponse {
  user: Pick<CurrentUser, 'id' | 'username' | 'email' | 'role' | 'inventory' | 'favorites'>;
  gravesCreated: number;
  interactionsMade: number;
}

/** The signed-in user as kept by the auth context. */
export interface CurrentUser {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  inventory: InventoryEntry[];
  gravesCreated?: number;
  interactionsMade?: number;
  favorites?: FavoriteRef[];
}
