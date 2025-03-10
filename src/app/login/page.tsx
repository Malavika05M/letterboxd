"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const AuthPages = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const endpoint = isLogin ? "login" : "register";
    const payload = isLogin ? { username, password } : { username, email, password };

    try {
      const response = await fetch(`http://127.0.0.1:5000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("username", username);
        router.push("/home");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again");
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 bg-[url('https://assets.onecompiler.app/4362xbeju/3x2zp2yd7/Untitled%20design.jpg')] bg-cover bg-center">
      <nav className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          </div>
          <span className="text-white text-xl text-lg font-bold ml-2">Letterboxd</span>
        </div>
      </nav>

      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-6 bg-gray-900 text-white">
          <div className="flex justify-center mb-8"></div>

          <h1 className="text-2xl font-bold text-center mb-2">
            {isLogin ? "Welcome Back!" : "Join Letterboxd"}
          </h1>
          <p className="text-center text-gray-400 mb-6">
            {isLogin ? "Sign in to your account." : "Create an account to get started."}
          </p>

          <form className="space-y-4 text-black" onSubmit={handleAuth}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded mb-2"
              required
            />
            {!isLogin && (
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                required
              />
            )}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded mb-2"
              required
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </form>

          <p className="mt-4 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              className="text-blue-500 hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AuthPages;

