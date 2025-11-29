import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await axios.get("/profile", { withCredentials: true });
      return res.data;
    },
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");

  useEffect(() => {
    if (data) {
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setUserName(data.userName || "");
      setEmailAddress(data.emailAddress || "");
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.patch("/profile", payload, { withCredentials: true });
      return res.data;
    },
    onSuccess: (resp: any) => {
      toast(resp?.message || "Profile updated");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      navigate("/profile");
    },
    onError: (err: any) => {
      toast(err?.response?.data?.message || "Failed to update profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ firstName, lastName, userName, emailAddress });
  };

  if (isLoading) return <h3 className="text-center mt-10">Loading profile...</h3>;
  if (isError) return <h3 className="text-center text-red-500 mt-10">Failed loading profile</h3>;

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <Label>First Name</Label>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <Label>Last Name</Label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <Label>Username</Label>
          <Input value={userName} onChange={(e) => setUserName(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <Label>Email</Label>
          <Input value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} />
        </div>

        <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </div>
  );
}
