import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/axios";   // adjust path if needed
import { Link } from "react-router-dom";

export default function Home() {
  // ✅ Detect token from localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ✅ Fetch personal blogs only if logged in
  const { data, isLoading, isError } = useQuery({
    queryKey: ["profileBlogs"],
    queryFn: async () => {
      const res = await axios.get("/profile/blogs", { withCredentials: true });
      return res.data;
    },
    enabled: !!token, // only run if token exists
    retry: false,
  });

  console.log("Home API response:", data);

  // ✅ Normalize response
  const blogs = Array.isArray(data) ? data : data?.blogs || [];

  if (!token) {
    return (
      <div className="p-6 pt-24 text-center text-gray-600">
        You are not logged in. Please{" "}
        <Link to="/login" className="text-blue-600 underline">
          login
        </Link>{" "}
        to create and view your blogs.
      </div>
    );
  }

  if (isLoading) {
    return <h3 className="text-center mt-10">Loading your blogs...</h3>;
  }

  if (isError) {
    return (
      <h3 className="text-center text-red-500 mt-10">
        Failed loading your blogs
      </h3>
    );
  }

  return (
    <div className="p-6 pt-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Blogs</h1>
        {/* ✅ Show create + trash buttons when logged in */}
        <div className="flex gap-3">
          <Link to="/create">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow">
              + New Blog
            </button>
          </Link>
          <Link to="/trash">
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg shadow">
              Trash
            </button>
          </Link>
        </div>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center text-gray-600">
          No blogs yet. Create your first blog.
        </div>
      ) : (
        // ✅ Two-column grid with rectangular cards
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {blogs.map((blog: any) => (
            <div
              key={blog.id}
              className="border bg-white shadow rounded-lg p-4 flex flex-col"
            >
              {blog.featuredImageUrl && (
                <img
                  src={blog.featuredImageUrl}
                  alt={blog.title}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}

              <div className="flex-1 flex flex-col justify-between">
                <Link to={`/blogs/${blog.id}`}>
                  <h2 className="text-lg font-bold hover:underline">
                    {blog.title}
                  </h2>
                </Link>
                {blog.synopsis && (
                  <p className="text-gray-700 mt-2 line-clamp-3">{blog.synopsis}</p>
                )}

                <div className="mt-4">
                  <div className="text-sm text-gray-500">
                    {new Date(blog.createdAt).toLocaleString()}
                  </div>
                  <Link to={`/blogs/${blog.id}`}>
                    <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">
                      View
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
