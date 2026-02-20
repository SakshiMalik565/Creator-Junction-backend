import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    type: {
      type: String,
      enum: ["image", "video"],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public"
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Asset", assetSchema);