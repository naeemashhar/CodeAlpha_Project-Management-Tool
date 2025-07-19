import { ToastContainer, toast } from "react-toastify";
import {
  BACK_BUTTON,
  INPUT_WRAPPER,
  personalFields,
  SECTION_WRAPPER,
  FULL_BUTTON,
  securityFields,
  DANGER_BTN,
} from "../dummy";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Lock,
  LogOut,
  Save,
  Shield,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://codealpha-project-management-tool-backend.onrender.com";

const Profile = ({ setCurrentUser, onLogout }) => {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(`${API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        if (data.success)
          setProfile({ name: data.user.name, email: data.user.email });
        else toast.error(data.message);
      })
      .catch(() => toast.error("Unable To Load Profile."));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${API_URL}/api/user/profile`,
        { name: profile.name, email: profile.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setCurrentUser((prev) => ({
          ...prev,
          name: profile.name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            profile.name
          )}&background=random`,
        }));
        toast.success("Profile Updated Successfully");
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile Update Failed");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      return toast.error("Password MissMatch");
    }
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${API_URL}/api/user/password`,
        { currentPassword: password.current, newPassword: password.new },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Password Changed Successfully");
        setPassword({ current: "", new: "", confirm: "" });
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Password Update Failed");
    }
  };
  return (
  <div className="min-h-screen bg-base-200">
    <ToastContainer position="top-center" autoClose={3000} />

    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <button className="btn btn-ghost text-sm mb-4 flex items-center gap-1" onClick={() => navigate(-1)}>
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
          {profile.name ? profile.name[0].toUpperCase() : "U"}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-base-content">Account Settings</h1>
          <p className="text-sm text-base-content/60">Manage your personal and security info</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <section className="bg-base-100 p-5 rounded-xl shadow-sm border border-base-300">
          <div className="flex items-center gap-2 mb-4">
            <UserCircle className="text-purple-500 w-5 h-5" />
            <h2 className="text-lg font-semibold">Personal Information</h2>
          </div>
          <form onSubmit={saveProfile} className="space-y-4">
            {personalFields.map(({ name, type, placeholder, icon: Icon }) => (
              <label key={name} className="flex items-center bg-base-200 p-3 rounded-lg gap-2">
                <Icon className="text-purple-500 w-5 h-5" />
                <input
                  type={type}
                  className="w-full bg-transparent focus:outline-none text-sm"
                  placeholder={placeholder}
                  value={profile[name]}
                  onChange={(e) => setProfile({ ...profile, [name]: e.target.value })}
                  required
                />
              </label>
            ))}
            <button type="submit" className="btn btn-primary w-full gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </form>
        </section>

        {/* Security */}
        <section className="bg-base-100 p-5 rounded-xl shadow-sm border border-base-300">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-purple-500 w-5 h-5" />
            <h2 className="text-lg font-semibold">Security</h2>
          </div>
          <form onSubmit={changePassword} className="space-y-4">
            {securityFields.map(({ name, placeholder }) => (
              <label key={name} className="flex items-center bg-base-200 p-3 rounded-lg gap-2">
                <Lock className="text-purple-500 w-5 h-5" />
                <input
                  type="password"
                  className="w-full bg-transparent focus:outline-none text-sm"
                  placeholder={placeholder}
                  value={password[name]}
                  onChange={(e) => setPassword({ ...password, [name]: e.target.value })}
                  required
                />
              </label>
            ))}
            <button type="submit" className="btn btn-accent w-full gap-2">
              <Shield className="w-4 h-4" />
              Change Password
            </button>

            <div className="pt-6 border-t border-base-300 mt-6">
              <h3 className="text-sm font-semibold text-red-500 flex items-center gap-2 mb-2">
                <LogOut className="w-4 h-4" />
                Logout
              </h3>
              <button type="button" className="btn btn-error w-full" onClick={onLogout}>
                Logout
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  </div>
);

};

export default Profile;
