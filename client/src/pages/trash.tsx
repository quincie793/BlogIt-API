import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/axios";
import { toast } from "sonner";

export default function TrashPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["trashedBlogs"],
    queryFn: async () => {
      const res = await axios.get("/profile/blogs/trash", { withCredentials: true });
      return res.data;
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (blogId: string) => {
      const res = await axios.patch(`/blogs/restore/${blogId}`, {}, { withCredentials: true });
      return res.data;
    },
    onSuccess: (data: any) => {
      toast(data?.message || "Blog restored");
      queryClient.invalidateQueries({ queryKey: ["trashedBlogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      navigate("/home");
    },
    onError: (err: any) => {
      toast(err?.response?.data?.message || "Failed to restore blog");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (blogId: string) => {
      const res = await axios.delete(`/blogs/${blogId}`, { withCredentials: true });
      return res.data;
    },
    onSuccess: (data: any) => {
      toast(data?.message || "Blog permanently deleted");
      queryClient.invalidateQueries({ queryKey: ["trashedBlogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
    onError: (err: any) => {
      toast(err?.response?.data?.message || "Failed to delete blog");
    },
  });

  if (isLoading) return <h3 className="text-center mt-10">Loading trashed blogs...</h3>;
  if (isError) return <h3 className="text-center text-red-500 mt-10">Failed loading trashed blogs</h3>;

  const blogs = data?.blogs || [];

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Trash</h1>
        <Link to="/home">
          <button className="px-3 py-1 bg-blue-600 text-white rounded">Back</button>
        </Link>
      </div>

      {blogs.length === 0 ? (
        <p className="text-gray-600">No trashed blogs.</p>
      ) : (
        <div className="grid gap-4">
          {blogs.map((b: any) => (
            <div key={b.id} className="border p-4 bg-gray-50 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold">{b.title}</h2>
                  {b.synopsis && <p className="text-gray-700 mt-1">{b.synopsis}</p>}
                  <div className="text-sm text-gray-500 mt-2">{new Date(b.createdAt).toLocaleString()}</div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link to={`/blogs/${b.id}`}>
                    <button className="px-3 py-1 bg-yellow-400 rounded">View</button>
                  </Link>

                  <button
                    onClick={() => {
                      toast("Restore this blog?", {
                        action: {
                          label: "Confirm",
                          onClick: () => restoreMutation.mutate(b.id),
                        },
                      });
                    }}
                    className="px-3 py-1 bg-emerald-500 text-white rounded shadow hover:bg-emerald-600"
                  >
                    Restore
                  </button>

                  <button
                    onClick={() => {
                      toast("Permanently delete this blog? This cannot be undone.", {
                        action: {
                          label: "Delete",
                          onClick: () => deleteMutation.mutate(b.id),
                        },
                      });
                    }}
                    className="px-3 py-1 bg-neutral-800 text-white rounded shadow hover:bg-neutral-900"
                  >
                    Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
