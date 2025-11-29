import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "@/axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.patch("/auth/password", payload, { withCredentials: true });
      return res.data;
    },
    onSuccess: (data: any) => {
      toast(data?.message || "Password updated");
      setCurrentPassword("");
      setNewPassword("");
      navigate("/profile");
    },
    onError: (err: any) => {
      toast(err?.response?.data?.message || "Failed to update password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ currentPassword, newPassword });
  };

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4">Change Password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <Label>Current Password</Label>
          <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <Label>New Password</Label>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
