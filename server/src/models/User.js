import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Grave",
      },
    ],
    settings: {
      theme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Theme",
      },
      fontsize: { type: Number, default: 14 },
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    // Flowers and items share one inventory; entries with the same kind and
    // name are stacked into a single entry.
    inventory: [
      {
        _id: false,
        kind: { type: String, enum: ["flower", "item"], required: true },
        // Flowers use their variety name; items start unnamed ("").
        name: { type: String, default: "" },
        count: { type: Number, default: 0, min: 0 },
      },
    ],
    // The user's local date ("YYYY-MM-DD") of the last daily reward.
    lastRewardDate: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model("User", userSchema);
