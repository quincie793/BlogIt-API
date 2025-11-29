import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome to BlogIt</h1>

      <p className="text-center max-w-md mb-6 text-gray-700">
        Create and share blogs. Please register or login to continue.
      </p>

      <div className="flex gap-4">
        <Link to="/register">
          <Button className="bg-indigo-500 text-white">Register</Button>
        </Link>

        <Link to="/login">
          <Button variant="outline" className="border-indigo-500 text-indigo-600">
            Login
          </Button>
        </Link>
      </div>
    </div>
  );
}
