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
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model("User", userSchema);
