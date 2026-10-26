/**
 * Migrates Grave.photos from plain URL strings to `{ url, key }` objects:
 *
 *   "https://…"  →  { url: "https://…", key: "" }
 *
 * An empty key marks a legacy photo hosted elsewhere, which is never deleted from S3.
 *
 * Usage (from the repository root):
 *   node server/migrate-photos.js           dry run: reports what would change
 *   node server/migrate-photos.js --apply   backs up the graves collection, then writes
 *
 * Connects to MONGO_URI from server/.env. A MONGO_URI set on the command line
 * takes precedence, since dotenv never overrides existing variables.
 *
 * Idempotent: only graves that still hold a string photo are matched,
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

// A raw collection is used because the Mongoose model can no longer cast the old strings.
const graves = () => mongoose.connection.db.collection("graves");

// Matches graves where any element of `photos` is still a string.
const FILTER = { photos: { $type: "string" } };

// Converts string elements and leaves already-migrated objects untouched.
const UPDATE = [
  {
    $set: {
      photos: {
        $map: {
          input: "$photos",
          as: "p",
          in: {
            $cond: [{ $eq: [{ $type: "$$p" }, "string"] }, { url: "$$p", key: "" }, "$$p"],
          },
        },
      },
    },
  },
];

const backup = async () => {
  const snapshot = { graves: await graves().find().toArray() };
  const dir = path.join(here, "backups");
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(dir, `photos-${stamp}.json`);
  // Canonical Extended JSON keeps ObjectIds and Dates restorable as their original types.
  const { EJSON } = mongoose.mongo.BSON;
  fs.writeFileSync(file, EJSON.stringify(snapshot, null, 2, { relaxed: false }));
  return file;
};

await mongoose.connect(process.env.MONGO_URI);
console.log(
  `Connected to database "${mongoose.connection.db.databaseName}" ${APPLY ? "(--apply: will write)" : "(dry run: read only)"}\n`,
);

const pending = await graves()
  .find(FILTER, { projection: { graveID: 1, photos: 1 } })
  .toArray();

if (pending.length === 0) {
  console.log("Nothing to migrate: every grave's photos are already in the current shape.");
} else {
  for (const g of pending) console.log(`  ${g.graveID}  ${JSON.stringify(g.photos)}`);
  console.log(`\n${pending.length} grave(s) to migrate.`);
  if (APPLY) {
    console.log(`Backup written to ${path.relative(process.cwd(), await backup())}`);
    const { modifiedCount } = await graves().updateMany(FILTER, UPDATE);
    console.log(`${modifiedCount} grave(s) updated.`);
  } else {
    console.log("\nDry run only, nothing was written. Re-run with --apply to migrate:");
    console.log("  node server/migrate-photos.js --apply");
  }
}

await mongoose.disconnect();
