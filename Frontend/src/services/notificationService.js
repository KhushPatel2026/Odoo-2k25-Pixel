import { SERVER_BASE_URL } from "../lib/config";

const NotificationService = {
  async getNotifications() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Failed to retrieve notifications" };
      }
    } catch (error) {
      console.error("Get notifications error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  },

  async markNotificationsRead() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/notifications/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Failed to mark notifications as read" };
      }
    } catch (error) {
      console.error("Mark notifications read error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  },
};

export default NotificationService;