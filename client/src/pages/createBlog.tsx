import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function CreateBlogPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [content, setContent] = useState(""); // markdown text
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preview selected file locally
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
        withCredentials: true,
      });
      const url = uploadRes.data?.url;
      if (url) setUploadedImageUrl(url);
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post("/blogs", payload, { withCredentials: true });
      return res.data;
    },
    onSuccess: (resp: any) => {
      toast(resp?.message || "Blog created");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["publicBlogs"] });
      queryClient.invalidateQueries({ queryKey: ["profileBlogs"] });
      navigate("/home");
    },
    onError: (err: any) => {
      toast(err?.response?.data?.message || "Failed to create blog");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { title, synopsis, content };
    if (uploadedImageUrl) {
      payload.featuredImageUrl = uploadedImageUrl;
    }
    createMutation.mutate(payload);
  };

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4">Create Blog</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-medium">Title</label>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <label className="font-medium">Synopsis</label>
          <Input placeholder="Synopsis" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} />
        </div>

        {/* ✅ Markdown input */}
        <div>
          <label className="font-medium">Content (Markdown supported)</label>
          <textarea
            rows={8}
            placeholder="Write your blog content in Markdown..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        {/* ✅ Live Markdown Preview */}
        <div className="border rounded p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Preview</h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose max-w-none">
            {content || "Start typing Markdown..."}
          </ReactMarkdown>
        </div>

        <div>
          <label className="font-medium">Featured image</label>
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
              {uploading ? "Uploading..." : uploadedImageUrl ? "Uploaded" : "Upload"}
            </button>

            {uploadedImageUrl ? (
              <a href={uploadedImageUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                Preview
              </a>
            ) : localPreview ? (
              <img src={localPreview} alt="preview" className="w-24 h-16 object-cover rounded" />
            ) : null}
          </div>

          {uploadError && <div className="text-red-500 mt-2">{uploadError}</div>}
        </div>

        <Button type="submit" className="w-full">
          {createMutation.isPending ? "Creating..." : "Create Blog"}
        </Button>
      </form>
    </div>
  );
}
