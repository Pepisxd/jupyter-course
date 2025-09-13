const express = require("express");
const router = express.Router();
const ResourceStats = require("../models/ResourceStats");
const ResourceClick = require("../models/ResourceClick");

// Obtener estadísticas
router.get("/", async (req, res) => {
  try {
    console.log("Fetching resource stats from MongoDB...");

    const stats = await ResourceStats.find({}).lean();
    console.log(`Found ${stats.length} stats in database`);

    const totalViews = stats.reduce((sum, stat) => sum + stat.views, 0);
    const avgRating =
      stats.length > 0
        ? stats.reduce((sum, stat) => sum + stat.rating, 0) / stats.length
        : 0;
    const totalResources = stats.length;
    const uniqueTopics = await ResourceStats.distinct("resourceId");

    // Convertir array a objeto para el frontend
    const resourceStats = stats.reduce((acc, stat) => {
      acc[stat.resourceId] = {
        views: stat.views,
        stars: stat.stars || 0,
        rating: stat.rating,
        ratingCount: stat.ratingCount,
        lastViewed: stat.lastViewed,
      };
      return acc;
    }, {});

    res.json({
      resourceStats,
      globalStats: {
        totalViews,
        avgRating: Math.round(avgRating * 10) / 10,
        totalResources,
        totalTopics: uniqueTopics.length,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Error fetching statistics" });
  }
});

// Trackear clicks
router.post("/click", async (req, res) => {
  const { resourceId } = req.body;

  if (!resourceId) {
    return res.status(400).json({ error: "resourceId is required" });
  }

  const userIP =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "";
  const referrer = req.headers.referer || "";

  try {
    console.log(
      `Tracking click for resource: ${resourceId} from IP: ${userIP}`
    );

    // Anti-spam: verificar clicks recientes (últimas 24 horas)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentClick = await ResourceClick.findOne({
      resourceId,
      userIP,
      clickedAt: { $gte: twentyFourHoursAgo },
    });

    if (!recentClick) {
      // Incrementar vistas
      const updatedStats = await ResourceStats.findOneAndUpdate(
        { resourceId },
        {
          $inc: { views: 1 },
          $set: { lastViewed: new Date() },
        },
        { upsert: true, new: true }
      );

      // Registrar click
      await ResourceClick.create({
        resourceId,
        userIP,
        userAgent,
        referrer,
      });

      console.log(`Click counted. New views: ${updatedStats.views}`);
      res.json({ success: true, counted: true });
    } else {
      console.log("Recent click detected, not counting");
      res.json({
        success: true,
        counted: false,
        message: "Recent click detected",
      });
    }
  } catch (error) {
    console.error("Error tracking click:", error);
    res.status(500).json({ error: "Error tracking click" });
  }
});

// Actualizar rating
router.post("/rating", async (req, res) => {
  const { resourceId, rating } = req.body;

  if (!resourceId || rating === undefined) {
    return res
      .status(400)
      .json({ error: "resourceId and rating are required" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  try {
    console.log(`Updating rating for resource: ${resourceId} to ${rating}`);

    const resourceStat = await ResourceStats.findOne({ resourceId });

    if (resourceStat) {
      const currentTotal = resourceStat.rating * resourceStat.ratingCount;
      const newRatingCount = resourceStat.ratingCount + 1;
      const newAverage = (currentTotal + rating) / newRatingCount;

      await ResourceStats.updateOne(
        { resourceId },
        {
          rating: Math.round(newAverage * 10) / 10,
          ratingCount: newRatingCount,
        }
      );

      console.log(
        `Rating updated. New average: ${Math.round(newAverage * 10) / 10}`
      );
    } else {
      await ResourceStats.create({
        resourceId,
        rating,
        ratingCount: 1,
        views: 0,
      });

      console.log(`New resource stats created with rating: ${rating}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving rating:", error);
    res.status(500).json({ error: "Error saving rating" });
  }
});

router.post("/star", async (req, res) => {
  const { resourceId } = req.body;

  if (!resourceId) {
    return res
      .status(400)
      .json({ success: false, error: "resourceId is required" });
  }

  const userIP =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  try {
    console.log(`Adding star for resource: ${resourceId} from IP: ${userIP}`);

    const existingStar = await ResourceClick.findOne({
      resourceId,
      userIP,
      type: "star",
    });

    if (existingStar) {
      return res.status(200).json({
        success: false,
        error: "Already starred",
      });
    }

    const updatedStats = await ResourceStats.findOneAndUpdate(
      { resourceId },
      {
        $inc: { stars: 1 },
        $set: { lastViewed: new Date() },
      },
      { upsert: true, new: true }
    );

    await ResourceClick.create({
      resourceId,
      userIP,
      type: "star",
      userAgent: req.headers["user-agent"] || "",
      referrer: req.headers.referer || "",
    });

    console.log(`Star added. New stars: ${updatedStats.stars}`);
    res.json({ success: true, action: "starred" });
  } catch (error) {
    console.error("Error adding star:", error);
    res.status(500).json({ success: false, error: "Error adding star" });
  }
});
router.delete("/star", async (req, res) => {
  const { resourceId } = req.body;

  if (!resourceId) {
    return res
      .status(400)
      .json({ success: false, error: "resourceId is required" });
  }

  const userIP =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  try {
    console.log(`Removing star for resource: ${resourceId} from IP: ${userIP}`);

    const existingStar = await ResourceClick.findOne({
      resourceId,
      userIP,
      type: "star",
    });

    if (!existingStar) {
      return res.status(200).json({
        success: false,
        error: "Not starred",
      });
    }

    const updatedStats = await ResourceStats.findOneAndUpdate(
      { resourceId },
      {
        $inc: { stars: -1 },
        $set: { lastViewed: new Date() },
      }
    );

    await ResourceClick.deleteOne({
      resourceId,
      userIP,
      type: "star",
    });

    console.log(
      `Star removed for resource: ${resourceId}. New stars: ${updatedStats ? updatedStats.stars : 0}`
    );
    res.json({ success: true, action: "unstarred" });
  } catch (error) {
    console.error("Error removing star:", error);
    res.status(500).json({ success: false, error: "Error removing star" });
  }
});

router.get("/user-stars", async (req, res) => {
  const userIP =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  try {
    // Buscar todas las estrellas de este usuario
    const userStars = await ResourceClick.find({
      userIP,
      type: "star",
    }).select("resourceId -_id");

    // Convertir a array de IDs
    const starredResourceIds = userStars.map((star) => star.resourceId);

    res.json({ starredResources: starredResourceIds });
  } catch (error) {
    console.error("Error fetching user stars:", error);
    res.status(500).json({ error: "Error fetching user stars" });
  }
});

module.exports = router;
