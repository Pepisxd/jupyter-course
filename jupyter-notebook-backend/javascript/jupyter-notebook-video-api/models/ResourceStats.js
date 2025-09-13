const mongoose = require("mongoose");

const resourceStatsSchema = new mongoose.Schema(
  {
    resourceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      index: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    stars: { type: Number, default: 0 },
    ratingCount: {
      type: Number,
      default: 0,
    },

    lastViewed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.ResourceStats ||
  mongoose.model("ResourceStats", resourceStatsSchema);
