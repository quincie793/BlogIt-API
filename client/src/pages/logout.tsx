import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LogoutPage() {
  const navigate = useNavigate();

  const doLogout = () => {
    localStorage.removeItem("token");
    toast("Logged out");
    // notify other parts of the app (same-tab) about auth change
    window.dispatchEvent(new CustomEvent("authChanged"));
    // give the toast a moment to appear before navigating
    setTimeout(() => navigate("/"), 700);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="bg-white p-6 rounded shadow max-w-sm w-full text-center">
        <h1 className="text-xl font-semibold mb-4">Logout</h1>
        <p className="text-sm text-gray-600 mb-4">Click the button below to logout.</p>
        <Button onClick={doLogout} className="w-full">
          Logout
        </Button>
      </div>
    </div>
  );
}
