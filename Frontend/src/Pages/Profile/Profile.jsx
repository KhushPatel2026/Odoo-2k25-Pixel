import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../Components/ui/dialog";
import { Globe, LogOut, User, Mail, Calendar, Settings, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import AuthService from "../../services/authService"
import ProfileService from "../../services/profileService";

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Handle URL token
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const urlToken = query.get("token");
    if (urlToken) {
      localStorage.setItem("token", urlToken);
      navigate("/profile", { replace: true });
    }
  }, [location, navigate]);

  // Verify token and fetch profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found");
      navigate("/login");
      return;
    }

    const verifyToken = async (retryCount = 0) => {
      try {
        const verifyResult = await AuthService.verifyToken();
        if (!verifyResult.success) {
          if (retryCount < 3) {
            setTimeout(() => verifyToken(retryCount + 1), 5000);
            return;
          }
          throw new Error(verifyResult.message || "Invalid token");
        }

        const profileResult = await ProfileService.getProfile();
        if (profileResult.success) {
          setProfile(profileResult.data);
        } else {
          throw new Error(profileResult.message || "Profile fetch failed");
        }

        setLoading(false);
      } catch (error) {
        if (retryCount < 3) {
          setTimeout(() => verifyToken(retryCount + 1), 5000);
        } else {
          toast.error(error.message);
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    verifyToken();
  }, [navigate]);

  // Edit profile handler
  const handleEditProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const form = e.target;
    const formData = new FormData(form);
    const name = formData.get("name").trim();
    const email = formData.get("email").trim();

    try {
      const result = await ProfileService.editProfile(name, email);
      if (result.success) {
        toast.success("Profile updated successfully");
        setProfile(result.data);
      } else {
        throw new Error(result.message || "Profile update failed");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while updating your profile");
      console.error("Profile update error:", error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Password validation
  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Password change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsChangingPassword(true);

    if (!validatePassword()) {
      setIsChangingPassword(false);
      return;
    }

    try {
      const result = await ProfileService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      if (result.success) {
        toast.success("Password changed successfully");
        setIsPasswordModalOpen(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setErrors({});
      } else {
        throw new Error(result.message || "Failed to change password");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while changing password");
      console.error("Password change error:", error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setErrors({});
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowPasswords({ current: false, new: false, confirm: false });
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #0a0613 0%, #150d27 100%)",
        }}
      >
        <div className="flex items-center space-x-3 text-white">
          <Loader2 className="w-8 h-8 animate-spin text-[#9b87f5]" />
          <span className="text-xl">Loading your profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #0a0613 0%, #150d27 100%)",
      }}
    >
      {/* Background Effects */}
      <div
        className="absolute right-0 top-0 h-1/2 w-1/2"
        style={{
          background: "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
        }}
      />
      <div
        className="absolute left-0 bottom-0 h-1/2 w-1/2"
        style={{
          background: "radial-gradient(circle at 30% 70%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
        }}
      />

      {/* Header */}
      <div className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-white">
            <ArrowLeft className="w-5 h-5" />
            <div className="w-8 h-8 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">StackIt</span>
          </Link>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {/* Profile Header */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(155,135,245,0.1)] mb-8">
              <CardHeader className="text-center pb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-3xl font-light text-white">Welcome back, {profile?.name}!</CardTitle>
                <p className="text-white/60">Manage your StackIt profile and settings</p>
              </CardHeader>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Profile Information */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(155,135,245,0.1)]">
                <CardHeader>
                  <CardTitle className="text-2xl font-light text-white flex items-center">
                    <User className="w-6 h-6 mr-2 text-[#9b87f5]" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {profile && (
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center space-x-3 text-white/80">
                        <User className="w-5 h-5 text-[#9b87f5]" />
                        <span className="font-medium">Name:</span>
                        <span>{profile.name}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-white/80">
                        <Mail className="w-5 h-5 text-[#9b87f5]" />
                        <span className="font-medium">Email:</span>
                        <span>{profile.email}</span>
                      </div>
                      {profile.joinDate && (
                        <div className="flex items-center space-x-3 text-white/80">
                          <Calendar className="w-5 h-5 text-[#9b87f5]" />
                          <span className="font-medium">Joined:</span>
                          <span>{profile.joinDate}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleEditProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white/80">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        defaultValue={profile?.name}
                        required
                        className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-[#9b87f5]/50 focus:ring-[#9b87f5]/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/80">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        defaultValue={profile?.email}
                        required
                        className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-[#9b87f5]/50 focus:ring-[#9b87f5]/20"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="w-full bg-gradient-to-r from-[#9b87f5] to-purple-600 hover:from-[#8b77e5] hover:to-purple-700 text-white font-medium py-3 transition-all duration-300"
                    >
                      {isUpdatingProfile ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Changes...</span>
                        </div>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(155,135,245,0.1)]">
                <CardHeader>
                  <CardTitle className="text-2xl font-light text-white flex items-center">
                    <Settings className="w-6 h-6 mr-2 text-[#9b87f5]" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(profile?.reputation || profile?.questionsAsked || profile?.answersGiven) && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-[#9b87f5]">{profile?.reputation || 0}</div>
                        <div className="text-white/60 text-sm">Reputation</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-[#9b87f5]">{profile?.questionsAsked || 0}</div>
                        <div className="text-white/60 text-sm">Questions</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-[#9b87f5]">{profile?.answersGiven || 0}</div>
                        <div className="text-white/60 text-sm">Answers</div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => setIsPasswordModalOpen(true)}
                    variant="outline"
                    className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                  >
                    Change Password
                  </Button>

                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-white font-medium mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5"
                      >
                        View My Questions
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5"
                      >
                        View My Answers
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5"
                      >
                        Account Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={closePasswordModal}>
        <DialogContent className="bg-white/5 backdrop-blur-xl border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light text-white">Change Password</DialogTitle>
          </DialogHeader>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-white/80">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  required
                  className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-[#9b87f5]/50 focus:ring-[#9b87f5]/20 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-red-400 text-sm">{errors.currentPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-white/80">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  required
                  className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-[#9b87f5]/50 focus:ring-[#9b87f5]/20 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-red-400 text-sm">{errors.newPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/80">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  required
                  className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-[#9b87f5]/50 focus:ring-[#9b87f5]/20 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isChangingPassword}
                className="flex-1 bg-gradient-to-r from-[#9b87f5] to-purple-600 hover:from-[#8b77e5] hover:to-purple-700 text-white"
              >
                {isChangingPassword ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Password"
                )}
              </Button>
              <Button
                type="button"
                onClick={closePasswordModal}
                variant="outline"
                className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white",
          },
        }}
      />
    </div>
  );
};

export default ProfilePage;