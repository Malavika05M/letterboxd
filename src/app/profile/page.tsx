"use client";

import React, {useEffect,useState} from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

const Profile = () => {
  type Review = {
    title: string;
    text: string;
    date: string;
  };
  
  type Movie = {
    title: string;
    poster_url: string;
  };

  const [userData, setUserData] = useState<{
    username: string;
    email: string;
    recent_reviews: Review[];
    favourite_movies: Movie[];
  }>({
    username: "",
    email: "",
    recent_reviews: [],
    favourite_movies: [],
  });

  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/profile", {
          method: "GET",
          credentials: "include", 
        });
    
        const data = await res.json();
        if (data.status === "success") {
          setUserData(data);
        } else {
          console.error("Error:", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    

    fetchProfile();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-800">
    <nav className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          </div>
          <button onClick={() => router.push("/home")} className="text-white text-xl text-lg font-semibold ml-2">Letterboxd</button>
        </div>
        <div className="flex items-center gap-20">
          <div className="flex items-center gap-12 mr-4">
            <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
              <svg 
                className="absolute w-12 h-12 text-gray-400 -left-1" 
                fill="currentColor" 
                viewBox="0 0 20 20" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <button className="text-white hover:text-orange-600">Inbox</button>
            <button className="text-white hover:text-orange-600">Films</button>
            <button className="text-orange-600 hover:text-orange-600">Profile</button>
            <button onClick={() => router.push("/lists")} className="text-white hover:text-orange-600">Lists</button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
            <input 
                className="w-full bg-gray-700 text-white placeholder:text-gray-400 text-sm border border-gray-600 rounded-md pl-3 pr-24 py-2 transition duration-300 ease-in-out focus:outline-none focus:border-gray-500 hover:border-gray-500" 
                placeholder="Search Films"
              />
              <button onClick={() => router.push("/search")} className="absolute top-1 right-1 flex items-center rounded bg-gray-600 py-1 px-2.5 text-sm text-white transition-all hover:bg-gray-500 focus:bg-gray-500 focus:outline-none" type="button">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-4 h-4 mr-2"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" 
                    clipRule="evenodd" 
                  />
                </svg>
                Search
              </button>
              </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 bg-[#2c3440] rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{userData.username.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{userData.username}</h1>
            <p className="text-[#99AABB]">{userData.email}</p>
            <div className="flex mt-2">
              <button onClick={() => router.push("/")} className="bg-green-600 hover:bg-green-500 text-white p-3 rounded-md">
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {["FILMS", "THIS YEAR", "LISTS", "FOLLOWERS"].map((label, index) => (
            <Card key={index} className="bg-[#2c3440] border-none">
              <CardContent className="p-4">
                <div className="text-sm text-[#99AABB] mb-1">{label}</div>
                <div className="text-2xl text-orange-600 font-bold">
                  {index === 0 ? "119" : index === 1 ? "25" : index === 2 ? "3" : "56"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-cyan-500 mb-4">Recent Reviews</h2>
          <div className="grid gap-4">
            {userData.recent_reviews.length > 0 ? (
              userData.recent_reviews.map((review, index) => (
                <Card key={index} className="bg-gray-900 border-none">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-white mb-2">{review.title}</h3>
                        <p className="italic text-green-400 text-sm">"{review.text}"</p>
                      </div>
                      <span className="text-[#99AABB]">{review.date}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-400">No reviews yet.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-cyan-500 mb-4">Favorite Films</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userData.favourite_movies.length > 0 ? (
              userData.favourite_movies.map((movie, index) => (
                <Card key={index} className="bg-gray-900 border-none">
                  <CardContent className="p-4">
                    <div className="aspect-[2/3] bg-[#1c232a] mb-2 flex items-center justify-center text-gray-500">
                      <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover rounded-md" />
                    </div>
                    <p className="text-sm text-white text-center">{movie.title}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-400">No favorite movies added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;