from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
CORS(app)


TMDB_API_KEY = "3172acaf0608280c74fc67d9324a38a2"  
TMDB_BASE_URL = "https://api.themoviedb.org/3"


CACHE_FILE = "tmdb_cache.json"
if os.path.exists(CACHE_FILE):
    with open(CACHE_FILE, "r", encoding="utf-8") as f:
        tmdb_cache = json.load(f)
else:
    tmdb_cache = {}


def get_movie_details(movie_id, language="en"):
    cache_key = f"{movie_id}_{language}"
    if cache_key in tmdb_cache:
        return tmdb_cache[cache_key]

    url = f"{TMDB_BASE_URL}/movie/{movie_id}?api_key={TMDB_API_KEY}&language={language}"
    response = requests.get(url).json()

    details = {
        "title": response.get("title", "Unknown"),
        "poster": f"https://image.tmdb.org/t/p/w500{response['poster_path']}" if response.get("poster_path") else None,
        "overview": response.get("overview", "No description available."),
        "genres": ", ".join([g["name"] for g in response.get("genres", [])]) or "N/A",
        "tmdb_link": f"https://www.themoviedb.org/movie/{movie_id}"
    }

    tmdb_cache[cache_key] = details
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(tmdb_cache, f, ensure_ascii=False, indent=4)

    return details

def get_similar_movies(movie_id, language="en"):
    url = f"{TMDB_BASE_URL}/movie/{movie_id}/similar?api_key={TMDB_API_KEY}&language={language}&page=1"
    response = requests.get(url).json()
    results = response.get("results", [])[:10]

    recommendations = []
    for movie in results:
        rec = get_movie_details(movie["id"], language)
        recommendations.append(rec)
    return recommendations

# --- Search movie by title ---
def search_movie(title, language="en"):
    url = f"{TMDB_BASE_URL}/search/movie?api_key={TMDB_API_KEY}&query={title}&language={language}"
    response = requests.get(url).json()
    results = response.get("results")
    if results:
        return results[0]["id"]  # return first match
    return None

# --- Flask route ---
@app.route("/recommend", methods=["POST"])
def recommend_movie():
    data = request.json
    title = data.get("title")
    language = data.get("language", "en")

    if not title:
        return jsonify({"error": "No movie title provided"}), 400

    movie_id = search_movie(title, language)
    if not movie_id:
        return jsonify({"error": "Movie not found"}), 404

    # Fetch original movie details
    original_movie = get_movie_details(movie_id, language)

    # Fetch similar movies
    recommendations = get_similar_movies(movie_id, language)

    # Include the original movie at the top
    all_movies = [original_movie] + recommendations

    return jsonify({"recommendations": all_movies})

# --- Run server ---
if __name__ == "__main__":
    app.run(debug=True)
