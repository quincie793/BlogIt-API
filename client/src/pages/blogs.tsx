import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/axios";   // adjust path if needed
import { Link } from "react-router-dom";

export default function BlogsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["publicBlogs"],
    queryFn: async () => {
      const res = await axios.get("/blogs", { withCredentials: true });
      return res.data;
    },
    retry: false,
  });

  // Debug log to inspect API response
  console.log("API response:", data);

  // ✅ Normalize response: handle both array and object formats
  const blogs = Array.isArray(data) ? data : data?.blogs || [];

  if (isLoading) {
    return <h3 className="text-center mt-10">Loading...</h3>;
  }

  if (isError) {
    return (
      <h3 className="text-center text-red-500 mt-10">
        Failed loading blogs
      </h3>
    );
  }

  return (
    <div className="p-6 pt-24"> {/* pt-24 prevents overlap with fixed header */}
      <h1 className="text-2xl font-semibold mb-6">Public Blogs</h1>

      {blogs.length === 0 ? (
        <div className="text-center text-gray-600">No blogs available.</div>
      ) : (
        // ✅ Two-column grid with rectangular cards
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {blogs.map((blog: any) => (
            <div
              key={blog.id}
              className="border bg-white shadow rounded-lg p-4 flex flex-col"
            >
              {/* Image at top */}
              {blog.featuredImageUrl && (
                <img
                  src={blog.featuredImageUrl}
                  alt={blog.title}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}

              {/* Content stacked vertically */}
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
