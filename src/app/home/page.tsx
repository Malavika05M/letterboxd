"use client";

import React, {useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HomePage = () => {
  const router = useRouter();
  const [popularMovies, setPopularMovies] = useState([]);
  const [newReleases, setNewReleases] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/movies/new-releases")
    .then((res) => res.json())
    .then ((data) => {
      if(data.success) setNewReleases(data.movies);
    })
    .catch ((err) => console.error("Error fetching new releases:", err));

    fetch("http://127.0.0.1:5000/movies/poster")
    .then((res) => res.json())
    .then((data) => {
      if(data.success) setPopularMovies(data.movies);
    })
    .catch((err) => console.error("Error fetching popular movies:", err));
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    adaptiveHeight: true,
  };

  const moviePosters = [
    "https://assets.onecompiler.app/4362xbeju/3x2zp2yd7/Untitled%20design%20(1).png",
    "https://assets.onecompiler.app/4362xbeju/3x2zp2yd7/image-1200x600%20(1).jpg",
    "https://assets.onecompiler.app/4362xbeju/3x2zp2yd7/Untitled%20design%20(3).png",
  ];

  return (
    <div className="min-h-screen bg-gray-800">
      <nav className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          </div>
          <span className="text-white text-xl text-lg font-semibold ml-2">
            Letterboxd
          </span>
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
            <button onClick={() => router.push("/profile")} className="text-white hover:text-orange-600">Profile</button>
            <button onClick={() => router.push("/lists")} className="text-white hover:text-orange-600">Lists</button>
          </div>
          <div className="w-64">
            <div className="relative">
              <input
                className="w-full bg-gray-700 text-white placeholder:text-gray-400 text-sm border border-gray-600 rounded-md pl-3 pr-24 py-2 transition duration-300 ease-in-out focus:outline-none focus:border-gray-500 hover:border-gray-500"
                placeholder="Search Films"
              />
              <button onClick={() => router.push("/search")}  className="absolute top-1 right-1 flex items-center rounded bg-gray-600 py-1 px-2.5 text-sm text-white transition-all hover:bg-gray-500 focus:bg-gray-500 focus:outline-none" type="button">
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
        <div className="bg-gray-600 mx-auto w-4/5 max-h-[500px] overflow-hidden relative flex flex-col justify-between rounded-lg">
          <Slider {...sliderSettings}>
          {moviePosters.map((poster, index) => (
          <div key={index} className="w-full">
            <img
            src={poster}
            alt={`Movie Poster ${index + 1}`}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        ))}
      </Slider>
  </div>
</section>


        <div className="px-6">
          <h2 className="text-xl font-semibold text-white mb-4">Newly Released</h2>
          <div className="flex overflow-x-auto space-x-16">
          {newReleases.slice(0, 9).map((movie) => {
            const { id, title, poster } = movie;
            return (
              <div key={id} className="w-40">
                <img src={`https://image.tmdb.org/t/p/w500${poster}`} alt={title} className="rounded-lg" />
                <p className="text-center text-white">{title}</p>
              </div>
            );
          })}
          </div>
        </div>

        <div className="p-4">
          <h2 className="text-xl font-semibold text-white mb-4">Popular Movies</h2>
          <div className="flex overflow-x-auto space-x-16">
          {popularMovies.slice(0, 9).map((movie) => {
            const { id, title, poster } = movie;
            return (
              <div key={id} className="w-40">
                <img src={`https://image.tmdb.org/t/p/w500${poster}`} alt={title} className="rounded-lg" />
                <p className="text-center text-white">{title}</p>
              </div>
            );
          })}
          </div>
        </div>
    </div>
  );
}

export default HomePage;