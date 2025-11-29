import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/axios";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

// ------- type ---------
type RegisterDataType = {
  firstName: string;
  lastName: string;
  emailAddress: string;
  userName: string;
  password: string;
};

// ------- api fn ----------
const registerData = async (data: RegisterDataType) => {
  const res = await axios.post("/auth/register", data);
  return res.data;
};

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const mutation = useMutation({
    mutationKey: ["register"],
    mutationFn: registerData,
    onSuccess: () => {
      toast("Registration successful!");
      setFirstName("");
      setLastName("");
      setEmail("");
      setUserName("");
      setPassword("");
      navigate("/login");
    },
    onError: (error: any) => {
      toast(error?.response?.data?.message || "Registration failed");
    },
  });

  const register = (e: React.FormEvent) => {
    e.preventDefault();

    mutation.mutate({
      firstName,
      lastName,
      emailAddress,
      userName,
      password,
    });
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <form
        onSubmit={register}
        className="flex flex-col gap-4 w-full max-w-md bg-white p-6 rounded shadow"
      >
        <div className="flex flex-col">
          <Label>First Name</Label>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <Label>Last Name</Label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <Label>Email</Label>
          <Input value={emailAddress} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <Label>Username</Label>
          <Input value={userName} onChange={(e) => setUserName(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button disabled={mutation.isPending} type="submit">
          {mutation.isPending ? "Registering..." : "Register"}
        </Button>
      </form>
    </div>
  );
}
