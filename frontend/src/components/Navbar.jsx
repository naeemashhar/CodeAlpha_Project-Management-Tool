import { Link, useNavigate } from "react-router-dom";
import { RiLogoutBoxLine, RiUser3Line } from "@remixicon/react";
import { ListChecks } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Navbar = ({ onLogout, user = {} }) => {
  const navigate = useNavigate();

  const menuref = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const handelMenuToggle = () => setMenuOpen((prev) => !prev);

  const handelLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  useEffect(() => {
    const handelClickOutside = (event) => {
      if (menuref.current && !menuref.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handelClickOutside);
    return () => document.removeEventListener("mousedown", handelClickOutside);
  }, []);

  return (
    <div className="navbar sticky top-0 z-50 backdrop-blur-md bg-base-100/60 shadow-lg border-b border-base-content/10 px-4">
      {/* Brand */}
      <div onClick={() => navigate("/")} className="flex-1 cursor-pointer">
        <Link
          to="/"
          className="relative flex items-center gap-2 text-xl font-bold"
        >
          <ListChecks className="w-6 h-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Taskure
          </span>
        </Link>
      </div>

      {/* Profile Dropdown */}
      {/* Profile Dropdown */}
      <div className="dropdown dropdown-end">
        <label
          tabIndex={0}
          className="btn btn-circle btn-ghost hover:ring-2 hover:ring-secondary transition duration-200"
        >
          <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center text-lg font-semibold ring ring-secondary ring-offset-base-100 ring-offset-2">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        </label>

        <ul
          tabIndex={0}
          className="menu dropdown-content right-0 mt-3 z-[60] w-64 p-4 rounded-xl shadow-xl bg-base-200/90 backdrop-blur-md border border-base-content/10"
        >
          <li>
            <Link
              onClick={() => {
                setMenuOpen(false);
              }}
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-base-300/40 transition text-base-content"
            >
              <RiUser3Line className="w-5 h-5 text-primary" />
              <span className="font-medium">My Profile</span>
            </Link>
          </li>

          <li>
            <button
              onClick={handelLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-base-300/40 transition text-base-content"
            >
              <RiLogoutBoxLine className="w-5 h-5 text-error" />
              <span className="font-medium">Logout</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Optional pinging dot */}
      <div className="absolute top-10 left-5 w-3 h-3 bg-gray-600 rounded-full shadow-md animate-ping" />
    </div>
  );
};

export default Navbar;
