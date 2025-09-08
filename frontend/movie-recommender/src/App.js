import { useEffect, useState, useRef } from "react";
import { FaStar } from "react-icons/fa";

const BACKEND_URL = "https://movie1-recommend.onrender.com"; // live backend URL

// Safe StarRating component
function StarRating({ rating }) {
  const safeRating = rating ?? 0; // fallback if undefined/null
  const stars = Math.round(safeRating / 2);

  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
      {[...Array(5)].map((_, index) => (
        <FaStar
          key={index}
          color={index < stars ? "gold" : "lightgray"}
          style={{ marginRight: "2px" }}
        />
      ))}
      <span style={{ marginLeft: "5px", fontSize: "12px", color: "#555" }}>
        {safeRating ? safeRating.toFixed(1) : "N/A"}/10
      </span>
    </div>
  );
}

function App() {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("en");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [userHistory, setUserHistory] = useState(() => {
    const saved = localStorage.getItem("userHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const typingTimer = useRef(null);

  // Fetch trending movies
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/trending?language=${language}`);
        const data = await response.json();
        setTrending(data || []);
      } catch (err) {
        console.error("Error fetching trending movies:", err);
      }
    };
    fetchTrending();
  }, [language]);

  // Debounced input handler
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 500);
  };

  // Fetch suggestions
  const fetchSuggestions = async (queryParam) => {
    if (!queryParam) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/suggest?query=${queryParam}`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setSuggestions(data?.length ? data : ["No results found"]);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setSuggestions(["No results found"]);
    }
  };

  // Click on a movie to add to history
  const handleMovieClick = (movie) => {
    if (!movie.id) return;
    const updatedHistory = [movie, ...userHistory.filter((m) => m.id !== movie.id)].slice(0, 10);
    setUserHistory(updatedHistory);
    localStorage.setItem("userHistory", JSON.stringify(updatedHistory));
  };

  // Fetch recommendations
  const getRecommendations = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setRecommendations([]);

    try {
      const response = await fetch(`${BACKEND_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: query, language, history: userHistory }),
      });
      const data = await response.json();
      setRecommendations(data.recommendations || []);
      if (!data.recommendations?.length) setError(data.error || "No recommendations found.");
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to fetch recommendations.");
    }
    setLoading(false);
  };

  // Helper to safely render text
  const safeText = (text, fallback = "N/A") => text || fallback;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>🎬 Movie Recommender</h1>

      {/* Search Bar */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter a movie (e.g. Inception)"
          value={query}
          onChange={handleChange}
          style={{ padding: "10px", width: "300px", marginRight: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{ padding: "10px", marginRight: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
          <option value="kn">Kannada</option>
          <option value="ml">Malayalam</option>
        </select>

        <ul style={{ listStyle: "none", padding: 0, marginTop: "5px" }}>
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              style={{ cursor: "pointer", padding: "5px", background: "#f8f9fa" }}
              onClick={() => {
                setQuery(s);
                setSuggestions([]);
              }}
            >
              {s}
            </li>
          ))}
        </ul>

        <button
          onClick={getRecommendations}
          style={{ padding: "10px 15px", borderRadius: "5px", border: "none", backgroundColor: "#007bff", color: "white", cursor: "pointer" }}
        >
          Recommend
        </button>
      </div>

      {loading && <p>Loading recommendations...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Recommendations Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
        {recommendations.map((movie, idx) => (
          <div
            key={idx}
            style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "15px", boxShadow: "0px 2px 5px rgba(0,0,0,0.1)", backgroundColor: "#fff" }}
            onClick={() => handleMovieClick(movie)}
          >
            {movie.poster ? (
              <img src={movie.poster} alt={safeText(movie.title)} style={{ width: "100%", borderRadius: "8px", marginBottom: "10px" }} />
            ) : (
              <div style={{ width: "100%", height: "375px", backgroundColor: "#eee", borderRadius: "8px", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#777" }}>
                No Poster
              </div>
            )}
            <h3>{safeText(movie.title)}</h3>
            <StarRating rating={movie.vote_average} />
            <p style={{ fontSize: "14px", color: "#555" }}>{safeText(movie.overview, "No description available.")}</p>
            <p style={{ fontSize: "12px", color: "#888" }}>Genres: {safeText(movie.genres, "Unknown")}</p>
            {movie.tmdb_link && (
              <a href={movie.tmdb_link} target="_blank" rel="noreferrer" style={{ color: "#007bff", textDecoration: "none" }}>
                View on TMDb
              </a>
            )}
          </div>
        ))}
      </div>
{/* Trending Section */}
{trending.length > 0 && (
  <>
    <h2 style={{ marginTop: "40px" }}>🔥 Trending This Week</h2>
    <div
      style={{
        display: "flex",
        overflowX: "auto",
        gap: "15px",
        padding: "10px 0",
      }}
    >
      {trending.map((movie, idx) => (
        <div
          key={idx}
          style={{
            minWidth: "200px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "10px",
            background: "#fff",
            flexShrink: 0,
            cursor: "pointer",
            boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
          }}
          onClick={() => handleMovieClick(movie)}
        >
          {/* Poster */}
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              style={{
                width: "100%",
                height: "300px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "300px",
                background: "#eee",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#777",
                marginBottom: "10px",
              }}
            >
              No Poster
            </div>
          )}

          {/* Movie Info */}
          <h4 style={{ fontSize: "16px", margin: "5px 0" }}>{movie.title}</h4>
          <StarRating rating={movie.vote_average} />
          <a
  href={movie.tmdb_link}
  target="_blank"
  rel="noreferrer"
  style={{ color: "#007bff", textDecoration: "none", fontSize: "12px" }}
>
  View on TMDb
</a>

          <p style={{ fontSize: "12px", color: "#888", marginTop: "5px" }}>
            Genres: {movie.genres}
          </p>
        </div>
      ))}
    </div>
  </>
)}


      {/* Recently Viewed */}
      {userHistory.length > 0 && (
        <>
          <h2>🕒 Recently Viewed</h2>
          <div style={{ display: "flex", gap: "15px", overflowX: "auto" }}>
            {userHistory.map((movie, idx) => (
              <div key={idx} style={{ minWidth: "200px", border: "1px solid #ddd", borderRadius: "10px", padding: "10px" }}>
                {movie.poster ? (
                  <img src={movie.poster} alt={safeText(movie.title)} style={{ width: "100%", borderRadius: "8px", marginBottom: "10px" }} />
                ) : (
                  <div style={{ width: "100%", height: "300px", background: "#eee", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#777" }}>
                    No Poster
                  </div>
                )}
                <h4>{safeText(movie.title)}</h4>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
