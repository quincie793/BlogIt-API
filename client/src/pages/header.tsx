import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));

    const onStorage = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", onStorage);

    const onAuthChanged = () => setToken(localStorage.getItem("token"));
    window.addEventListener("authChanged", onAuthChanged as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("authChanged", onAuthChanged as EventListener);
    };
  }, []);

  return (
    // ✅ Fixed header with light purple background
    <header className="w-full fixed top-0 left-0 z-50 bg-purple-100 shadow py-6 px-6">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-3xl font-extrabold text-blue-700">
          BlogIt
        </Link>

        <div className="flex gap-6 items-center">
          <Link to="/blogs" className="text-xl font-bold text-blue-700 hover:underline">
            Blogs
          </Link>

          <Link to="/home" className="text-xl font-bold text-blue-700 hover:underline">
            Home
          </Link>

          {!token && (
            <>
              <Link to="/register" className="text-xl font-bold text-blue-700 hover:underline">
                Register
              </Link>
              <Link to="/login" className="text-xl font-bold text-blue-700 hover:underline">
                Login
              </Link>
            </>
          )}

          {token && (
            <>
              <Link to="/profile" className="text-xl font-bold text-blue-700 hover:underline">
                Profile
              </Link>
              <Link to="/logout" className="text-xl font-bold text-blue-700 hover:underline">
                Logout
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
