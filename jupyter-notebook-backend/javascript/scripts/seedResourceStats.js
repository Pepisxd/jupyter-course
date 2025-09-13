const mongoose = require("mongoose");
require("dotenv").config();
const ResourceStats = require("../models/ResourceStats");

const initialData = [
  { resourceId: "1", views: 0, rating: 4.8, ratingCount: 0 },
  { resourceId: "2", views: 0, rating: 4.6, ratingCount: 0 },
  { resourceId: "3", views: 0, rating: 4.9, ratingCount: 0 },
  { resourceId: "4", views: 0, rating: 4.7, ratingCount: 0 },
  { resourceId: "5", views: 0, rating: 4.5, ratingCount: 0 },
  { resourceId: "6", views: 0, rating: 4.4, ratingCount: 0 },
  { resourceId: "7", views: 0, rating: 4.9, ratingCount: 0 },
  { resourceId: "8", views: 0, rating: 4.7, ratingCount: 0 },
  { resourceId: "9", views: 0, rating: 4.7, ratingCount: 0 },
  { resourceId: "10", views: 0, rating: 4.7, ratingCount: 0 },
  { resourceId: "11", views: 0, rating: 4.7, ratingCount: 0 },
  { resourceId: "12", views: 0, rating: 4.7, ratingCount: 0 },
  { resourceId: "13", views: 0, rating: 4.7, ratingCount: 0 },
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    for (const data of initialData) {
      await ResourceStats.findOneAndUpdate(
        { resourceId: data.resourceId },
        data,
        { upsert: true }
      );
    }

    console.log("✅ Data seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
