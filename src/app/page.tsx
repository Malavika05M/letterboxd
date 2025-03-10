"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

const WelcomePage = () => {
  const router = useRouter();

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
        <button onClick={() => router.push("/login")} className="text-cyan-400 text-xl hover:text-cyan-300">Sign In</button>
      </nav>

      <main className="flex flex-col items-center justify-center mt-32 px-4">
        <div className="text-center justify-center mt-32 max-w-2xl">
          <h1 className="text-white text-4xl font-bold mb-4">
            Track films that you've watched.
          </h1>
          <h2 className="text-white text-4xl font-bold mb-8">
            Save your Favourite ones.
          </h2>
          
          <button onClick={() => router.push("/login")} className="inline-flex items-center bg-black px-10 py-5 rounded hover:bg-gray-900 transition-colors">
            <span className="text-white">Get Started - </span>
            <span className="text-orange-500 ml-1">Sign Up!</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default WelcomePage;