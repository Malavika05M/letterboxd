"use client";

import React, {useState, useEffect} from 'react';
import { useRouter } from 'next/navigation';

type Movie = {
  id: string;
  title: string;
  poster_url?: string;

}

const List = () => {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>([]);

  useEffect (() => {
    fetch("http://127.0.0.1:5000/lists")
    .then((res) => res.text())
    .then((text) => {
      console.log("Raw Response:", text);
      try {
        const data = JSON.parse(text);
        if (data.success) {
          setWatchlist(data.Watchlist);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    })
    .catch((err) => console.error("Error fetching watchlist:", err));
  }, []);

  const addToWatchlist = async (movie: Movie) => {
    const response = await fetch("http://127.0.0.1:5000/lists/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movie_id: movie.id,
        title: movie.title,
        poster_url: movie.poster_url,
      }),
    });
  
    const data = await response.json();
    if (data.success) {
      setWatchlist([...watchlist, movie]);
      router.push("/watchlist"); 
    }
  };
  
  const addToFavorites = async (movie: Movie) => {
    const response = await fetch("http://127.0.0.1:5000/favorites/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movie_id: movie.id,
        title: movie.title,
        poster_url: movie.poster_url,
      }),
    });
  
    const data = await response.json();
    if (data.success) {
      setFavorites([...favorites, movie]);
      router.push("/watchlist"); 
    }
  };
  

  const removeFromWatchlist = async (movieId: string) => {
    const response = await fetch("/lists/remove", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({movie_id: movieId}),
    });

    const data = await response.json();
    if(data.success) {
      setWatchlist(watchlist.filter((movie) => movie.id !== movieId));
    }
  };

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
            <div className="p-6 flex items-center gap-12">
                <div className="flex items-center gap-12 mr-4">
                <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                    <svg 
                    className="absolute w-12 h-12 text-gray-400 -left-1" 
                    fill="currentColor" 
                    viewBox="0 0 20 20" 
                    xmlns="http://www.w3.org/2000/svg">
                <path 
                  fillRule="evenodd" 
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <button className="text-white hover:text-orange-600">Inbox</button>
            <button className="text-white hover:text-orange-600">Films</button>
            <button onClick={() => router.push("/profile")} className="text-white hover:text-orange-600">Profile</button>
            <button className="text-orange-600 hover:text-orange-600">Lists</button>
          </div>
          <div className="w-64">
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

        <section className="px-10 py-10">
          <div className="text-cyan-500 text-center mb-10">
            <h1 className="text-4xl font-bold">My Watchlist</h1>
            <ul>
              {watchlist.map((movie) => (
                <li key={movie.id}>
                  <img src={movie.poster_url} alt={movie.title} width={100} />
                  <p>{movie.title}</p>
                  <button onClick={() => removeFromWatchlist(movie.id)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
         <div>
          <h2 className="text-xl font-semibold text-white mb-4">Recently Watched</h2>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-700 h-40 rounded-lg flex items-center justify-center"
              >
                <p>Movie</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-white mb-4">Movies to watch</h2>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-700 h-40 rounded-lg flex items-center justify-center"
              >
                <p>Movie</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
          <h2 className="text-xl font-semibold text-white mb-4">Favourite Movies </h2>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-700 h-40 rounded-lg flex items-center justify-center"
              >
                <p>Movie</p>
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>
    </div>
    )
}

export default List;