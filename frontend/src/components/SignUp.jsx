import { UserPlus, Mail, Lock, User } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import {
  BUTTONCLASSES,
  Inputwrapper,
  MESSAGE_ERROR,
  MESSAGE_SUCCESS,
} from "../dummy";

const API_URL = "http://localhost:4000";
const INITIAL_FORM = { name: "", email: "", password: "" };

const SignUp = ({ onSwitchMode }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const { data } = await axios.post(`${API_URL}/api/user/register`, formData);
      setMessage({ text: "Registration Successful!", type: "success" });
      setFormData(INITIAL_FORM);
    } catch (error) {
      setMessage({
        text:
          error.response?.data?.message ||
          "An error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "name",
      type: "text",
      placeholder: "Full Name",
      icon: User,
    },
    {
      name: "email",
      type: "email",
      placeholder: "Email",
      icon: Mail,
    },
    {
      name: "password",
      type: "password",
      placeholder: "Password",
      icon: Lock,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-300 px-4 py-8">
      <div className="w-full max-w-md bg-blur-sm rounded-2xl shadow-2xl border border-base-content/10 p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-extrabold text-primary">Join Taskure</h2>
          <p className="text-sm text-base-content/70">
            Sign up and start managing your tasks like a pro 🧠
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`rounded-lg p-3 text-sm font-medium ${
              message.type === "success" ? MESSAGE_SUCCESS : MESSAGE_ERROR
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ name, type, placeholder, icon: Icon }) => (
            <label
              key={name}
              className="flex items-center bg-base-200 border border-base-content/10 rounded-lg px-3 py-2 text-base-content/80 focus-within:ring-2 focus-within:ring-primary transition"
            >
              <Icon className="w-5 h-5 mr-2 text-primary" />
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                required
                value={formData[name]}
                onChange={(e) =>
                  setFormData({ ...formData, [name]: e.target.value })
                }
                className="bg-transparent outline-none w-full text-sm"
              />
            </label>
          ))}

          {/* Submit Button */}
          <button
            type="submit"
            className={`${BUTTONCLASSES} w-full`}
            disabled={loading}
          >
            {loading ? (
              "Signing Up..."
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-base-content/70">
          Already have an account?{" "}
          <button
            onClick={onSwitchMode}
            className="text-primary hover:underline font-medium"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
