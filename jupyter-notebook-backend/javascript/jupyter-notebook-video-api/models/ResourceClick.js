const mongoose = require("mongoose");

const resourceClickSchema = new mongoose.Schema(
  {
    resourceId: {
      type: String,
      required: true,
      index: true,
    },
    userIP: {
      type: String,
      required: true,
    },
    userAgent: String,
    referrer: String,
    clickedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    type: { type: String, default: "view" },
  },
  {
    timestamps: true,
  }
);

resourceClickSchema.index({ resourceId: 1, userIP: 1, clickedAt: -1 });

module.exports =
  mongoose.models.ResourceClick ||
  mongoose.model("ResourceClick", resourceClickSchema);
