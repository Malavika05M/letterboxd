"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

type Movie = {
  id: string;
  title: string;
  poster: string;
  overview: string;
  director: string;
  genre: string;
};

const ReviewPage = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  console.log("Extracted movie ID:", id);


  const [movie, setMovie] = useState<Movie | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        console.log("Fetching movie details for ID:", id);
        const response = await fetch(`http://127.0.0.1:5000/movie/${encodeURIComponent(id)}`);
        if (!response.ok) throw new Error("Failed to fetch movie details");

        const data = await response.json();
        console.log("Fetched Movie Data", data);
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };

    if (id) fetchMovieDetails();
  }, [id]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const toggleWatchlist = async () => {
    if(!movie) return;
    setInWatchlist(!inWatchlist);
  };

  const handleReviewSubmit = async () => {
    if (!review.trim()) {
      alert("Please enter a review before submitting.");
      return;
    }
  
    try {
      const response = await fetch("http://127.0.0.1:5000/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          movie_id: id, 
          username: "user_id",  
          review: review,
          rating: rating, 
        }),
      });
  
      const data = await response.json(); 
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit review");
      }
  
      alert("Review submitted successfully!");
      setReview("");
      setRating(5);
      
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    }
  
    console.log("Movie ID from URL params:", id);
  };
  

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <nav className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          </div>
          <button onClick={() => router.push("/home")} className="text-white text-xl font-semibold ml-2">
            Letterboxd
          </button>
        </div>
        <div className="flex items-center gap-20">
          <div className="flex items-center gap-12 mr-4">
            <button className="text-white hover:text-orange-600">Inbox</button>
            <button className="text-white hover:text-orange-600">Films</button>
            <button onClick={() => router.push("/profile")} className="text-white hover:text-orange-600">
              Profile
            </button>
            <button onClick={() => router.push("/lists")} className="text-white hover:text-orange-600">
              Lists
            </button>
          </div>
          <div className="w-64">
            <div className="relative">
              <input
                className="w-full bg-gray-700 text-white placeholder:text-gray-400 text-sm border border-gray-600 rounded-md pl-3 pr-24 py-2 transition duration-300 ease-in-out focus:outline-none focus:border-gray-500 hover:border-gray-500"
                placeholder="Search Films"
              />
              <button className="absolute top-1 right-1 flex items-center rounded bg-gray-600 py-1 px-2.5 text-sm text-white transition-all hover:bg-gray-500">
                Search
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {movie ? (
          <div className="flex gap-6">
            <div className="w-80 h-72">
              <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold">{movie.title}</h1>
              <p className="text-gray-400">{movie.genre}</p>
              <p className="text-gray-400">Directed by {movie.director}</p>
              <p className="mt-4 text-gray-300">{movie.overview}</p>
              <div className="mt-6 flex gap-4">
                <button
                  className={`px-4 py-2 rounded-md transition ${isFavorite ? "bg-orange-600" : "bg-gray-600"}`}
                  onClick={toggleFavorite}
                >
                  {isFavorite ? "★ Favorite" : "☆ Mark as Favorite"}
                </button>

                <button
                  className={`px-4 py-2 rounded-md transition ${inWatchlist ? "bg-green-600" : "bg-gray-600"}`}
                  onClick={toggleWatchlist}
                >
                  {inWatchlist ? "✔ In Watchlist" : "+ Add to Watchlist"}
                </button>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-bold">Write a Review</h2>
                <textarea
                  className="w-full p-2 bg-gray-700 text-white rounded mt-2"
                  rows={3}
                  placeholder="Write your thoughts..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
                <div className="flex items-center justify-between mt-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="bg-gray-700 text-white p-2 rounded w-20"
                  />
                  <button className="bg-blue-600 px-4 py-2 rounded-md" onClick={handleReviewSubmit}>
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">Loading movie details...</p>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;

