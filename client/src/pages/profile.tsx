import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/axios";

export default function ProfilePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await axios.get("/profile", { withCredentials: true });
      return res.data;
    },
  });

  if (isLoading) return <h3 className="text-center mt-10">Loading profile...</h3>;
  if (isError) return <h3 className="text-center text-red-500 mt-10">Failed loading profile</h3>;

  console.log("Profile API response:", data);

  // ✅ Normalize response
  const user = data?.profile || data || {};

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>

      <div className="space-y-2">
        <div>
          <div className="text-sm text-gray-500">First name</div>
          <div className="font-medium">{user.firstName || "-"}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Last name</div>
          <div className="font-medium">{user.lastName || "-"}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Username</div>
          <div className="font-medium">{user.userName || "-"}</div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Email</div>
          <div className="font-medium">{user.emailAddress || "-"}</div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Link to="/profile/edit">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Edit Profile</button>
        </Link>

        <Link to="/profile/password">
          <button className="px-4 py-2 bg-gray-200 rounded">Change Password</button>
        </Link>
      </div>
    </div>
  );
}
