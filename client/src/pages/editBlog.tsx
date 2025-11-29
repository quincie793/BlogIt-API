import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EditBlogPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      const res = await axios.get(`/blogs/${id}`, { withCredentials: true });
      return res.data;
    },
    enabled: !!id,
  });

  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [initialFeaturedUrl, setInitialFeaturedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setTitle(data.title || "");
      setSynopsis(data.synopsis || "");
      setContent(data.content || "");
      setInitialFeaturedUrl(data.featuredImageUrl || null);
      setUploadedImageUrl(data.featuredImageUrl || null);
    }
  }, [data]);

  useEffect(() => {
    if (!file) {
      setLocalPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const uploadSelectedFile = async () => {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await axios.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = uploadRes.data?.url;
      if (url) setUploadedImageUrl(url);
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.patch(`/blogs/${id}`, payload, { withCredentials: true });
      return res.data;
    },
    onSuccess: (resp: any) => {
      toast(resp?.message || "Blog updated");
      queryClient.invalidateQueries({ queryKey: ["blog", id] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      navigate(`/blogs/${id}`);
    },
    onError: (err: any) => {
      toast(err?.response?.data?.message || "Failed to update blog");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { title, synopsis, content };
    // determine final featuredImageUrl: prefer newly uploaded, else keep initial (could be null)
    if (uploadedImageUrl) payload.featuredImageUrl = uploadedImageUrl;
    else if (initialFeaturedUrl) payload.featuredImageUrl = initialFeaturedUrl;

    updateMutation.mutate(payload);
  };

  if (isLoading) return <h3 className="text-center mt-10">Loading...</h3>;
  if (isError) return <h3 className="text-center text-red-500 mt-10">Failed loading blog</h3>;

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4">Edit Blog</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-medium">Title</label>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <label className="font-medium">Synopsis</label>
          <Input placeholder="Synopsis" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} />
        </div>

        <div>
          <label className="font-medium">Content</label>
          <Textarea rows={8} placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
        </div>

        <div>
          <label className="font-medium">Featured image (optional)</label>
          <div className="mt-2 flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              Choose file
            </button>

            <button
              type="button"
              onClick={uploadSelectedFile}
              disabled={!file || uploading}
              className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : uploadedImageUrl ? 'Uploaded' : 'Upload'}
            </button>

            {uploadedImageUrl ? (
              <a href={uploadedImageUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                Preview
              </a>
            ) : localPreview ? (
              <img src={localPreview} alt="preview" className="w-24 h-16 object-cover rounded" />
            ) : initialFeaturedUrl ? (
              <img src={initialFeaturedUrl} alt="current" className="w-24 h-16 object-cover rounded" />
            ) : null}
          </div>

          {uploadError && <div className="text-red-500 mt-2">{uploadError}</div>}
        </div>

        <Button type="submit" className="w-full">
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
