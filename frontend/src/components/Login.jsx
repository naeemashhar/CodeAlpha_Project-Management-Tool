import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, EyeOff, Eye, LogIn } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { BUTTON_CLASSES, INPUTWRAPPER } from "../dummy";

const INITIAL_FORM = { email: "", password: "" };

const Login = ({ onSubmit, onSwitchMode }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const url = "http://localhost:4000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token) {
      (async () => {
        try {
          const { data } = await axios.get(`${url}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (data.success) {
            onSubmit?.({ token, userId, ...data.user });
            toast.success("Session Restored");
            navigate("/");
          } else {
            localStorage.clear();
          }
        } catch {
          localStorage.clear();
        }
      })();
    }
  }, [navigate, onSubmit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rememberMe) {
      toast.error("Enable Remember Me to Login");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${url}/api/user/login`, formData);
      if (!data.token) throw new Error(data.message || "Login Failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      onSubmit?.({ token: data.token, userId: data.user.id, ...data.user });

      toast.success("Login Successful");
      setFormData(INITIAL_FORM);
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "email",
      type: "email",
      placeholder: "Email",
      icon: Mail,
    },
    {
      name: "password",
      type: showPassword ? "text" : "password",
      placeholder: "Password",
      icon: Lock,
      isPassword: true,
    },
  ];

  return (
    <div className="min-h-screen bg-base-300 flex items-center justify-center px-4 py-12">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

      <div className="w-full max-w-xl bg-blur-md text-base-content border border-base-content/10 rounded-2xl shadow-lg p-10 sm:p-12 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary">Welcome Back</h2>
          <p className="text-base text-base-content/70">
            Login to continue managing your projects
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map(({ name, type, placeholder, icon: Icon, isPassword }) => (
            <div className={INPUTWRAPPER} key={name}>
              <Icon className="w-5 h-5 text-primary" />
              <input
                type={type}
                name={name}
                required
                value={formData[name]}
                onChange={(e) =>
                  setFormData({ ...formData, [name]: e.target.value })
                }
                className="ml-3 grow w-full outline-none text-sm bg-transparent placeholder:text-base-content/60 text-base-content"
                placeholder={placeholder}
              />
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-base-content/60 hover:text-primary transition-colors ml-2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              )}
            </div>
          ))}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="checkbox checkbox-sm checkbox-primary"
            />
            <label htmlFor="rememberMe" className="text-sm">
              Remember Me
            </label>
          </div>

          <button type="submit" className={BUTTON_CLASSES} disabled={loading}>
            {loading ? (
              "Logging in..."
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-1" />
                Login
              </>
            )}
          </button>
        </form>

        {/* Switch to Sign Up */}
        <p className="text-sm text-center text-base-content/70">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={() => {
              toast.dismiss();
              onSwitchMode?.();
            }}
            className="text-primary hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
