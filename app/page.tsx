"use client";

import api from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import socket from "@/lib/socket";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  let socketId
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try
     {

      
      let socketId = socket.id
   
            console.log("socketID", socketId)


      const res = await api.post("/users/login", { username, password,socketId });
      console.log("res", res);

      //  Save token in localStorage
      setToken(res.data.data.result.token);
      //localStorage.setItem("token", res.data.data.result.token);

      //  Also save the logged-in username for message alignment
      console.log("userName:", res.data.data.result.username)
      localStorage.setItem("chatapp_username", res.data.data.result.username);

      router.push("/chats");
    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow w-80">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <input
          type="text"
          placeholder="Username"
          className="w-full border p-2 mb-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Login
        </button>
        <p className="mt-2 text-sm">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
