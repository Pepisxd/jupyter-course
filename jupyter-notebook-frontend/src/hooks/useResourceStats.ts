import { useState, useEffect } from "react";
import { useAuth } from "../auth/auth-context";

interface ResourceStats {
  views: number;
  stars: number;
  lastViewed: string;
}

interface GlobalStats {
  totalViews: number;
  totalStars: number;
  totalResources: number;
  totalTopics: number;
}

export const useResourceStats = () => {
  const [resourceStats, setResourceStats] = useState<
    Record<string, ResourceStats>
  >({});
  const [userStars, setUserStars] = useState<Record<string, boolean>>({});
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalViews: 0,
    totalStars: 0,
    totalResources: 0,
    totalTopics: 0,
  });
  const { isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);

  const API_BASE_URL = "http://localhost:3000/api";

  const fetchUserStars = async () => {
    if (!isAuthenticated || !user) {
      setUserStars({});
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/resource-stats/user-stars`);
      const data = await response.json();

      const userStarsObj = data.starredResources.reduce(
        (acc: Record<string, boolean>, resourceId: string) => {
          acc[resourceId] = true;
          return acc;
        },
        {}
      );

      setUserStars(userStarsObj);
    } catch (error) {
      console.error("Error fetching user stars:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/resource-stats`);
      const data = await response.json();
      setResourceStats(data.resourceStats);
      setGlobalStats(data.globalStats);
      await fetchUserStars();
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  const trackClick = async (resourceId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/resource-stats/click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resourceId }),
      });

      const result = await response.json();

      if (result.counted) {
        setResourceStats((prev) => ({
          ...prev,
          [resourceId]: {
            ...prev[resourceId],
            views: (prev[resourceId]?.views || 0) + 1,
          },
        }));

        setGlobalStats((prev) => ({
          ...prev,
          totalViews: prev.totalViews + 1,
        }));
      }
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  const toggleStar = async (resourceId: string) => {
    if (!isAuthenticated || !user) {
      return {
        requiresAuth: true,
        error: "Debes iniciar sesión para marcar recursos.",
      };
    }
    const alreadyStarred = userStars[resourceId] || false;

    try {
      const response = await fetch(`${API_BASE_URL}/resource-stats/star`, {
        method: alreadyStarred ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resourceId }),
      });

      const result = await response.json();

      if (result.success) {
        setResourceStats((prev) => ({
          ...prev,
          [resourceId]: {
            ...prev[resourceId],
            stars: (prev[resourceId]?.stars || 0) + (alreadyStarred ? -1 : 1),
          },
        }));

        setGlobalStats((prev) => ({
          ...prev,
          totalStars: prev.totalStars + (alreadyStarred ? -1 : 1),
        }));

        setUserStars((prev) => ({
          ...prev,
          [resourceId]: !alreadyStarred,
        }));
      }
    } catch (error) {
      console.error("Error toggling star:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [isAuthenticated, user]);

  return {
    resourceStats,
    globalStats,
    loading,
    isAuthenticated,
    trackClick,
    toggleStar,
    hasStarred: (resourceId: string) => userStars[resourceId] || false,
    getResourceViews: (resourceId: string) =>
      resourceStats?.[resourceId]?.views || 0,
    getResourceStars: (resourceId: string) =>
      resourceStats?.[resourceId]?.stars || 0,
  };
};
