import { SERVER_BASE_URL } from "../lib/config";

const AdminService = {
  async moderateContent(type, id, action) {
    try {
      console.log("AdminService.moderateContent called with:", {
        type,
        id,
        action,
      });
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return { success: false, message: "No token found" };
      }

      const requestBody = { type, id, action };
      console.log("Sending request to moderate API:", requestBody);

      const response = await fetch(`${SERVER_BASE_URL}/api/admin/moderate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        return { success: true, data };
      } else {
        return {
          success: false,
          message: data.message || "Failed to moderate content",
        };
      }
    } catch (error) {
      console.error("Moderate content error:", error);
      return {
        success: false,
        message: "An error occurred. Please try again.",
      };
    }
  },

  async getAllUsers() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/admin/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return {
          success: false,
          message: data.message || "Failed to retrieve users",
        };
      }
    } catch (error) {
      console.error("Get all users error:", error);
      return {
        success: false,
        message: "An error occurred. Please try again.",
      };
    }
  },
};

export default AdminService;
