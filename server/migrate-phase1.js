/**
 * Migrates existing documents to the current schemas:
 *
 *   interactions  graveId → grave_id, variety → itemName, type "flower" → "item",
 *                 items without a quantity get 1
 *   users         add role "user", empty inventory, empty lastRewardDate
 *   graves        add empty icon
 *   gyblocks      drop the obsolete `number` field
 *
 * Usage (from the repository root):
 *   node server/migrate-phase1.js           dry run: reports what would change
 *   node server/migrate-phase1.js --apply   backs up the affected collections, then writes
 *
 * Connects to MONGO_URI from server/.env. A MONGO_URI set on the command line
 * takes precedence, since dotenv never overrides existing variables.
 *
 * Idempotent: every step only matches documents still in the old shape,
 * so re-running it is safe and a completed run reports nothing to change.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import dotenv from "dotenv";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(here, ".env") });

const APPLY = process.argv.includes("--apply");

// Raw collection operations are used throughout: the Mongoose models no longer
// declare the old fields, so they could neither read nor rename them.
const STEPS = [
  {
    collection: "interactions",
    label: "rename graveId → grave_id",
    filter: { graveId: { $exists: true } },
    update: { $rename: { graveId: "grave_id" } },
  },
  {
    collection: "interactions",
    label: "rename variety → itemName",
    filter: { variety: { $exists: true } },
    update: { $rename: { variety: "itemName" } },
  },
  {
    collection: "interactions",
    label: 'set quantity 1 on offerings without one',
    // Matches missing and null. Runs before the type change so that both old
    // flowers and new items are covered in the dry run as well.
    filter: { type: { $in: ["flower", "item"] }, quantity: null },
    update: { $set: { quantity: 1 } },
  },
  {
    collection: "interactions",
    label: 'type "flower" → "item"',
    filter: { type: "flower" },
    update: { $set: { type: "item" } },
  },
  {
    collection: "users",
    label: 'add role "user"',
    filter: { role: { $exists: false } },
    update: { $set: { role: "user" } },
  },
  {
    collection: "users",
    label: "add empty inventory",
    filter: { inventory: { $exists: false } },
    update: { $set: { inventory: [] } },
  },
  {
    collection: "users",
    label: "add empty lastRewardDate",
    filter: { lastRewardDate: { $exists: false } },
    update: { $set: { lastRewardDate: "" } },
  },
  {
    collection: "graves",
    label: "add empty icon",
    filter: { icon: { $exists: false } },
    update: { $set: { icon: "" } },
  },
  {
    collection: "gyblocks",
    label: "drop number",
    filter: { number: { $exists: true } },
    update: { $unset: { number: "" } },
  },
];

const db = () => mongoose.connection.db;

const backup = async () => {
  const collections = [...new Set(STEPS.map((s) => s.collection))];
  const snapshot = {};
  for (const name of collections) {
    snapshot[name] = await db().collection(name).find().toArray();
  }
  const dir = path.join(here, "backups");
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(dir, `phase1-${stamp}.json`);
  // Canonical Extended JSON keeps ObjectIds and Dates restorable as their original types.
  const { EJSON } = mongoose.mongo.BSON;
  fs.writeFileSync(file, EJSON.stringify(snapshot, null, 2, { relaxed: false }));
  return file;
};

// Interactions whose user or grave no longer exists. Populating them yields
// null, which clients must handle. Reported only; nothing is deleted.
const findOrphans = async () => {
  const toSet = (docs) => new Set(docs.map((d) => d._id.toString()));
  const users = toSet(await db().collection("users").find({}, { projection: { _id: 1 } }).toArray());
  const graves = toSet(await db().collection("graves").find({}, { projection: { _id: 1 } }).toArray());
  const orphans = [];
  for (const i of await db().collection("interactions").find().toArray()) {
    const graveRef = (i.grave_id ?? i.graveId)?.toString();
    const problems = [];
    if (!users.has(i.user?.toString())) problems.push("missing user");
    if (!graves.has(graveRef)) problems.push("missing grave");
    if (problems.length) orphans.push({ _id: i._id.toString(), problems });
  }
  return orphans;
};

await mongoose.connect(process.env.MONGO_URI);
console.log(
  `Connected to database "${db().databaseName}" ${APPLY ? "(--apply: will write)" : "(dry run: read only)"}\n`,
);

const orphans = await findOrphans();
if (orphans.length) {
  console.log(`⚠ ${orphans.length} orphaned interaction(s):`);
  for (const o of orphans) console.log(`  ${o._id}  ${o.problems.join(", ")}`);
  console.log();
}

const pending = [];
for (const step of STEPS) {
  const count = await db().collection(step.collection).countDocuments(step.filter);
  if (count > 0) pending.push({ ...step, count });
}

if (pending.length === 0) {
  console.log("Nothing to migrate: every document is already in the current shape.");
} else {
  if (APPLY) console.log(`Backup written to ${path.relative(process.cwd(), await backup())}\n`);
  for (const step of pending) {
    let line = `  ${step.collection.padEnd(13)} ${step.label}: ${step.count}`;
    if (APPLY) {
      const { modifiedCount } = await db()
        .collection(step.collection)
        .updateMany(step.filter, step.update);
      line += ` → ${modifiedCount} updated`;
    }
    console.log(line);
  }
  if (!APPLY) {
    console.log("\nDry run only, nothing was written. Re-run with --apply to migrate:");
    console.log("  node server/migrate-phase1.js --apply");
  }
}

await mongoose.disconnect();
