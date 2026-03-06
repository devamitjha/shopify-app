"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

export default function Login() {

  const { login, loading } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    login(username, password);
  };

  return (

    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/bg.jpg')" }}
    >

      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-10 w-[420px] text-white">

        <h1 className="text-3xl font-bold text-center mb-8">
          Admin Login
        </h1>

        <form onSubmit={submit} className="space-y-6">

          <div>

            <label className="text-sm">Username</label>

            <input
              type="text"
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none"
              placeholder="Enter username"
            />

          </div>

          <div className="relative">

            <label className="text-sm">Password</label>

            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none"
              placeholder="Enter password"
            />

            <span
              onClick={()=>setShow(!show)}
              className="absolute right-3 top-11 cursor-pointer"
            >
              {show ? "🙈" : "👁"}
            </span>

          </div>

          <button
            disabled={loading}
            className="w-full py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition hover:cursor-pointer"
          >

            {loading ? "Logging in..." : "Login"}

          </button>

        </form>

      </div>

    </div>

  );

}