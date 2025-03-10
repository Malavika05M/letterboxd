from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import requests
from dotenv import load_dotenv
import os

app = Flask(__name__)
app.secret_key = "hello" 
load_dotenv()
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
print("Loaded API Key:", TMDB_API_KEY)
TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/movie"

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///letterboxd.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

DB_FILE = "letterboxd.db"

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(250), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Watchlist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('user.id'), nullable=False)
    movie_id = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    poster_url = db.Column(db.String(500), nullable=True)

class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    movie_id = db.Column(db.String(50), nullable = False)
    title = db.Column(db.String(200), nullable=False)

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)
    username = db.Column(db.String(100), nullable=False)  
    movie_id = db.Column(db.Integer, nullable=False)
    review_text = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)


with app.app_context():
    db.create_all()


def get_movie_details(title):
    search_url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={title}"
    response = requests.get(search_url)
    if response.status_code == 200:
        results = response.json()['results']
        if results:
            movie = results[0]
            return {
                'title': movie['title'],
                'poster': f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie['poster_path'] else None,
                'link': f"https://www.themoviedb.org/movie/{movie['id']}"
            }
        return None
    
def get_movie_details(movie_id):
    try:
        url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}&append_to_response=credits"
        response = requests.get(url, timeout=10)
        response.raise_for_status() 

        data = response.json()
        director = next((crew["name"] for crew in data["credits"]["crew"] if crew["job"] == "Director"), "Unknown")
        genres = ", ".join([genre["name"] for genre in data.get("genres", [])])
        return {"director": director, "genre": genres}

    except requests.exceptions.RequestException as e:
        print(f"Error fetching movie details: {e}")
        return {"director": "Unknown", "genre": "Unknown"}

@app.route("/register", methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"status": "error", "message": "All fields are required"}), 400

    try:
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return jsonify({"status": "success", "message": "Registration successful"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": "Username or email already exists"}), 409

@app.route("/login", methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"status": "error", "message": "All fields are required"}), 400

    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        session['username'] = user.username
        session['email'] = user.email

        return jsonify({"status": "success", "message": "Login successful"})
        response.set_cookie("session", session['username'], httponly=True, samesite="None")
        return response
    else:
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401
    
@app.after_request
def apply_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, DELETE"
    return response


@app.route("/profile", methods=['GET'])
def profile():
    if 'username' not in session:
        return jsonify({"status": "error", "message": "Not logged in"}), 401
    
    user = User.query.filter_by(username=session["username"]).first()
    if not user: 
        return jsonify({"status": "error", "message": "User not found"}), 404
    
    recent_reviews =Review.query.filter_by(user_id = user.id).order_by(Review.created_at.desc()).limit(5).all()
    reviews = [{"movie_id": r.movie_id, "review": r.review.text, "rating": r.rating} for r in recent_reviews]

    favourite_movies = Favorite.query.filter_by(user_id = user.id).all()
    favourites = [{"movie_id": f.movie_id, "title": f.title} for f in favourite_movies]
    
    return jsonify({
        "status": "success",
        "username": user.username,
        "email": user.email,
        "recent_reviews": reviews,
        "favourite_movies": favourites
    })

@app.route("/logout", methods=['GET'])
def logout():
    session.clear()
    return jsonify({"status": "success", "message": "Logged out"})

@app.route("/", methods=['GET'])
def check_login():
    if 'username' in session:
        return jsonify({"status": "success", "message": f"Logged in as {session['username']}"})
    return jsonify({"status": "error", "message": "Not logged in"})

@app.route("/search", methods=["GET"])
def search_movie():
    query = request.args.get("query")
    if not query:
        return jsonify({"error": "No search query provided"}), 400
    
    search_url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={query}"
    response = requests.get(search_url)
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch search results"}), 500

    movies = response.json().get("results", [])
    formatted_movies = []

    for movie in movies:
        movie_details = get_movie_details(movie["id"]) 
        formatted_movies.append({
            "id": movie["id"],
            "title": movie["title"],
            "year": movie["release_date"][:4] if movie.get("release_date") else "Unknown",
            "poster": f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie.get("poster_path") else None,
            "director": movie_details["director"],
            "genre": movie_details["genre"],
        })

    return jsonify({"movies": formatted_movies})

@app.route("/lists/add", methods=["POST"])
def add_to_watchlist():
    if "username" not in session:
        return jsonify({"success": False, "message": "Not logged i"}), 401
    
    user = User.query.filter_by(username=session["username"]).first()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    data = request.json
    user_id = data.get("user_id")
    movie_id = data.get("movie_id")
    title = data.get("title")
    poster_url = data.get("poster_url")

    if not all([user_id, movie_id, title]):
        return jsonify({"success": False, "message": "Missing required fields"}), 400
    
    existing_entry = Watchlist.query.filter_by(user_id=user_id, movie_id=movie_id).first()
    if existing_entry:
        return jsonify ({"success": False, "message": "Movie already exists in watchlist"}), 400
    
    new_movie = Watchlist(user_id=user_id, movie_id=movie_id, title=title,poster_url=poster_url)
    db.session.add(new_movie)
    db.session.commit()

    return jsonify({"success": True, "message": "Movie added to watchlist"}), 201

@app.route("/movies/poster", methods=["GET"])
def get_popular_movies():
    url = f"https://api.themoviedb.org/3/movie/popular?api_key={TMDB_API_KEY}&page=1"
    response = requests.get(url)

    if response.status_code == 200:
        movies =  response.json().get("results", [])
        formatted_movies = [{
            "id": movie["id"],
            "title": movie["title"],
            "release-date": movie.get("release_date", "Unknown"),
            "poster": f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie.get("poster_path") else None
        } for movie in movies]

        return jsonify({"success": True, "movies": formatted_movies})
    return jsonify({"success": False, "message": "Failed to fetch popular movies"}), 500

@app.route("/movies/new-releases", methods=["GET"])
def get_new_releases():
    url = f"https://api.themoviedb.org/3/movie/now_playing?api_key={TMDB_API_KEY}&page=1"
    response = requests.get(url)

    if response.status_code == 200:
        movies = response.json().get("results", [])
        formatted_movies = [{
            "id": movie["id"],
            "title": movie["title"],
            "release-date": movie.get("release_date", "Unknown"),
            "poster": f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie.get("poster_path") else None
        } for movie in movies]

        return jsonify({"success": True, "movies": formatted_movies})
    return jsonify({"success": False, "message": "Failed to fetch new releases"}), 500

@app.route("/movie/<int:movie_id>", methods=["GET"])
def get_movie_by_id(movie_id):
    """Fetches detailed movie information using TMDB API."""
    try:
        url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}&append_to_response=credits"
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        data = response.json()
        director = next((crew["name"] for crew in data["credits"]["crew"] if crew["job"] == "Director"), "Unknown")
        genres = ", ".join([genre["name"] for genre in data.get("genres", [])])

        return jsonify({
            "id": data["id"],
            "title": data["title"],
            "poster": f"https://image.tmdb.org/t/p/w500{data['poster_path']}" if data.get("poster_path") else None,
            "overview": data.get("overview", "No description available."),
            "director": director,
            "genre": genres
        }), 200

    except requests.exceptions.RequestException as e:
        print(f"Error fetching movie details: {e}")
        return jsonify({"error": "Failed to fetch movie details"}), 500
    
@app.route("/review", methods=["POST"])
def submit_review():
    data = request.json
    user_id = data.get("user_id")
    movie_id = data.get("movie_id")
    username = data.get("username")
    review_text = data.get("review")
    rating = data.get("rating")

    if not all([movie_id, review_text, user_id, rating]):
        return jsonify({"success": False, "message": "Missing Field"}), 400
    
    try:
        new_review = Review(movie_id = movie_id, user_id = user_id,username = username, review_text = review_text, rating = rating)
        print(new_review, review_text)
        db.session.add(new_review)
        print(new_review, review_text)
        db.session.commit()
        print(new_review, review_text)
        return jsonify({"success": True, "message": "Review submitted successfully"}), 201
    except Exception as e:
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500
    
@app.route("/review/<int:movie_id>", methods=["GET"])
def get_review(movie_id):
    if "username" not in session:
        return jsonify({"success": False, "message": "User not logged in"}), 401

    user = User.query.filter_by(username=session["username"]).first()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    user_id = request.args.get("user_id")

    reviews = Review.query.filter_by(movie_id=movie_id).all()
    if not reviews:
        return jsonify({"success": False, "message": "No reviews found"}), 404

    reviews_data = [
        {
            "id": review.id,
            "username": review.username,
            "review_text": review.review_text,
            "rating": review.rating,
        }
        for review in reviews
    ]

    return jsonify({"success": True, "reviews": reviews_data}), 200

@app.route("/lists", methods=["GET"])
def get_watchlist():
    if "username" not in session:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    
    user = User.query.filter_by(username=session["username"]).first()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    user_id = request.args.get("user_id")
    movies = Watchlist.query.filter_by(user_id=user_id).all()
    watchlist = [{"id": m.movie_id, "title": m.title, "poster_url": m.poster_url} for m in movies]

    return jsonify({"success": True, "watchlist": watchlist}), 200


@app.route("/lists/remove", methods=["POST"])
def remove_from_watchlist():

    if "username" not in session:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    
    user = User.query.filter_by(username=session["username"]).first()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    data = request.json
    user_id = data.get("user_id")
    movie_id = data.get("movie_id")

    if not all([user_id, movie_id]):
        return jsonify({"success": False, "message": "Missing required fields"}), 400
    
    movie = Watchlist.query.filter_by(user_id=user_id, movie_id=movie_id).first()
    if not movie:
        return jsonify({"success": False, "message": "Movie not found"}), 404
    db.session.delete(movie)
    db.session.commit()

    return jsonify({"success": True, "message": "Movie removed from watchlist"}), 200

@app.route("/lists/reviews/add", methods=['POST'])
def add_review():
    if 'username' not in session:
        return jsonify({"status": "error", "message": "Not logged in"}), 401
    
    data = request.get_json()
    movie_id = data.get('movie_id')
    review_text = data.get('review_text')
    rating = data.get('rating')
    
    if not all([movie_id, review_text, rating]):
        return jsonify({"status": "error", "message": "All fields are required"}), 400
    
    user = User.query.filter_by(username=session["username"]).first()
    review = Review(user_id=user.id, movie_id=movie_id, review_text=review_text, rating=rating)
    db.session.add(review)
    db.session.commit()
    
    return jsonify({"status": "success", "message": "Review added"})

@app.route("/lists/reviews/<movie_id>", methods=['GET'])
def get_reviews(movie_id):
    reviews = Review.query.filter_by(movie_id=movie_id).all()
    formatted_reviews = [{
        "username": User.query.get(r.user_id).username,
        "review": r.review_text,
        "rating": r.rating
    } for r in reviews]
    
    return jsonify({"reviews": formatted_reviews})

@app.route("/favorites/add", methods=['POST'])
def add_favorite():
    if 'username' not in session:
        return jsonify({"status": "error", "message": "Not logged in"}), 401
    
    data = request.get_json()
    movie_id = data.get('movie_id')
    title = data.get('title')
    
    if not all([movie_id, title]):
        return jsonify({"status": "error", "message": "Missing required fields"}), 400
    
    user = User.query.filter_by(username=session["username"]).first()
    favorite = Favorite(user_id=user.id, movie_id=movie_id, title=title)
    db.session.add(favorite)
    db.session.commit()
    
    return jsonify({"status": "success", "message": "Movie added to favorites"})

@app.route("/favorites", methods=['GET'])
def get_favorites():
    if 'username' not in session:
        return jsonify({"status": "error", "message": "Not logged in"}), 401
    
    user = User.query.filter_by(username=session["username"]).first()
    favorites = Favorite.query.filter_by(user_id=user.id).all()
    
    formatted_favorites = [{"movie_id": f.movie_id, "title": f.title} for f in favorites]
    
    return jsonify({"favorites": formatted_favorites})


if __name__ == '__main__':
    app.run(debug=True)


