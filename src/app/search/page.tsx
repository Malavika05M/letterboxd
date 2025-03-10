"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, X } from "lucide-react";

const FilmSearch = () => {
  const router = useRouter();
  type movie = {
    id: number;
    title: string;
    poster: string;
    year: string;
    director: string;
    genre: string;
  };

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const storedSearches = localStorage.getItem("recentSearches");
    if(storedSearches) {
      setRecentSearches(JSON.parse(storedSearches));
    }
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://127.0.0.1:5000/search?query=${query}`);
      if (!response.ok) throw new Error("Failed to fetch search results");

      const data = await response.json();
      setSearchResults(data.movies || []);

      const updatedSearches = [query, ...recentSearches.filter((item) => item !== query)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeSearch = (search: string) => {
    const updatedSearches = recentSearches.filter((item) => item !== search);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
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
          <button
            onClick={() => router.push("/home")}
            className="text-white text-xl font-semibold ml-2"
          >
            Letterboxd
          </button>
        </div>
        <div className="flex items-center gap-20">
          <div className="flex items-center gap-12 mr-4">
            <button className="text-white hover:text-orange-600">Inbox</button>
            <button className="text-white hover:text-orange-600">Films</button>
            <button
              onClick={() => router.push("/profile")}
              className="text-white hover:text-orange-600"
            >
              Profile
            </button>
            <button
              onClick={() => router.push("/lists")}
              className="text-white hover:text-orange-600"
            >
              Lists
            </button>
          </div>
          <div className="w-64">
            <div className="relative">
              <input
                className="w-full bg-gray-700 text-white placeholder:text-gray-400 text-sm border border-gray-600 rounded-md pl-3 pr-24 py-2 transition duration-300 ease-in-out focus:outline-none focus:border-gray-500 hover:border-gray-500"
                placeholder="Search Films"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                className="absolute top-1 right-1 flex items-center rounded bg-gray-600 py-1 px-2.5 text-sm text-white transition-all hover:bg-gray-500"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto flex gap-6 p-6">
        <div className="flex-grow bg-[#1c232a] rounded-lg p-6">
          <h2 className="text-gray-300 text-lg mb-6">Search Results</h2>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : searchResults.length > 0 ? (
            <div className="space-y-6">
              {searchResults.map((movie) => (
                <button key={movie.id} onClick={() => router.push("/lists/reviews/157336")}
                className="flex gap-4 w-full text-left hover:bg-[#2c3440] p-4 rounded transition duration-200">
                  <div className="w-32 h-48 bg-[#14181c] flex-shrink-0">
                    <img
                      src={movie.poster || "/api/placeholder/128/192"}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white text-lg font-medium">
                      {movie.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{movie.year}</p>
                    <p className="text-gray-400 text-sm">
                      Directed by {movie.director}
                    </p>
                    <p className="text-gray-400 text-sm">{movie.genre}</p>
                  </div>
                
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No results found.</p>
          )}
        </div>

        <div className="w-72 bg-[#1c232a] rounded-lg p-6">
          <h3 className="text-gray-300 text-lg mb-4">Recent Searches</h3>
          <div className="space-y-2">
            {recentSearches.map((search, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-[#14181c] p-3 rounded group hover:bg-[#2c3440]"
              >
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-500" />
              <span className="text-gray-300 text-sm" onClick={() => {setQuery(search); handleSearch();}}>{search}</span>
                </div>
                <button onClick={() => removeSearch(search)} className="opacity-0 group-hover:opacity-100">
                  <X size={14} className="text-gray-500 hover:text-gray-300" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilmSearch;


