import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "@/axios";
import { useMutation } from "@tanstack/react-query";

type LoginData = {
  identifier: string;
  password: string;
};

const loginUser = async (data: LoginData) => {
  const res = await axios.post("/auth/login", data);
  return res.data;
};


export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationKey: ["LoginUser"],
    mutationFn: loginUser,
    onSuccess: (data) => {
      toast("Login successful!");

      localStorage.setItem("token", data.token);

      setIdentifier("");
      setPassword("");

      // After login, navigate to the authenticated home page
      navigate("/home");
    },
    onError: (err: any) => {
      toast(err?.response?.data?.message || "Login failed");
    },
  });

  const login = (e: React.FormEvent) => {
    e.preventDefault();

    mutate({
      identifier,
      password,
    });
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <form
        onSubmit={login}
        className="flex flex-col gap-4 w-full max-w-md bg-white p-6 rounded shadow"
      >
        <div className="flex flex-col">
          <Label htmlFor="identifier">Email / Username</Label>
          <Input
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Email or username"
          />
        </div>

        <div className="flex flex-col">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <Button disabled={isPending} type="submit" className="mt-2 w-full">
          {isPending ? "Logging in…" : "Login"}
        </Button>
      </form>
    </div>
  );
}
