import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/axios";
import { toast } from "sonner";

export default function BlogPage() {
  const { id } = useParams();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      const res = await axios.get(`/blogs/${id}`, { withCredentials: true });
      return res.data;
    },
  });

  // fetch current user's profile (if logged in) to determine ownership
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        const res = await axios.get("/profile", { withCredentials: true });
        return res.data;
      } catch (err) {
        return null;
      }
    },
    // don't fail the whole page if not authenticated
    retry: false,
  });

  const moveToTrashMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.patch(`/blogs/trash/${id}`, {}, { withCredentials: true });
      return res.data;
    },
    onSuccess: (data: any) => {
      toast(data?.message || "Blog moved to trash");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", id] });
      navigate("/home");
    },
    onError: (err: any) => {
      toast(err?.response?.data?.message || "Failed to move blog to trash");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.patch(`/blogs/restore/${id}`, {}, { withCredentials: true });
      return res.data;
    },
    onSuccess: (data: any) => {
      toast(data?.message || "Blog restored");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", id] });
      navigate("/home");
    },
    onError: (err: any) => {
      toast(err?.response?.data?.message || "Failed to restore blog");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(`/blogs/${id}`, { withCredentials: true });
      return res.data;
    },
    onSuccess: (data: any) => {
      toast(data?.message || "Blog permanently deleted");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", id] });
      navigate("/home");
    },
    onError: (err: any) => {
      toast(err?.response?.data?.message || "Failed to delete blog");
    },
  });

  if (isLoading) return <h3 className="text-center mt-10">Loading...</h3>;
  if (isError) return <h3 className="text-center text-red-500 mt-10">Failed loading blog</h3>;

  const blog = data;
  const profile = profileData;
  const isOwner = !!(profile && blog && profile.id && blog.userId && profile.id === blog.userId);

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white p-6 rounded-lg shadow">
      {blog.featuredImageUrl && (
        <div className="mb-4">
          <img src={blog.featuredImageUrl} alt={blog.title} className="w-full max-h-80 object-cover rounded" />
        </div>
      )}
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold">{blog.title}</h1>

        <div className="flex items-center gap-2">
          {isOwner && !blog.isDeleted && (
            <>
              <Link to={`/blogs/${id}/edit`}>
                <button className="px-3 py-1 bg-yellow-400 rounded">Edit</button>
              </Link>

              <button
                onClick={() => {
                  toast("Move this blog to trash?", {
                    action: {
                      label: "Confirm",
                      onClick: () => moveToTrashMutation.mutate(),
                    },
                  });
                }}
                className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded shadow hover:from-red-600 hover:to-rose-700"
              >
                Move to Trash
              </button>
            </>
          )}

          {isOwner && blog.isDeleted && (
            <>
              <button
                onClick={() => {
                  toast("Restore this blog from trash?", {
                    action: {
                      label: "Confirm",
                      onClick: () => restoreMutation.mutate(),
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
                      onClick: () => deleteMutation.mutate(),
                    },
                  });
                }}
                className="px-3 py-1 bg-neutral-800 text-white rounded shadow hover:bg-neutral-900"
              >
                Delete Permanently
              </button>
            </>
          )}
        </div>
      </div>

      {blog.synopsis && <p className="text-gray-700 mt-4">{blog.synopsis}</p>}

      <div className="mt-6 prose max-w-full">
        <p>{blog.content}</p>
      </div>

      <div className="text-sm text-gray-500 mt-4">
        Posted on: {new Date(blog.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
