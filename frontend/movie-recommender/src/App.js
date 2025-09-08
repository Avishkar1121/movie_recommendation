import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";



function StarRating({ rating }) {
  const stars = Math.round(rating / 2); // Convert TMDB 10-scale to 5 stars
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
        {rating.toFixed(1)}/10
      </span>
    </div>
  );
}
function App() {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("en"); // default English
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
const [suggestions, setSuggestions] = useState([]);
const [trending, setTrending] = useState([]);
useEffect(() => {
  const fetchTrending = async () => {
    try {
      const response = await fetch(
        "https://movie-recommendation-2-pw6c.onrender.com/trending?language=en"
      );
      const data = await response.json();
      setTrending(data);
    } catch (err) {
      console.error("Error fetching trending movies:", err);
    }
  };
  fetchTrending();
}, []);
 let typingTimer;

  // Debounced input change handler
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      fetchSuggestions(value); // call your /suggest endpoint here
    }, 500); // wait 500ms after typing stops
  };
const fetchSuggestions = async (query) => {
  if (!query) {
    setSuggestions([]);
    return;
  }
// inside App component
const [userHistory, setUserHistory] = useState(() => {
  // Load from localStorage if exists
  const saved = localStorage.getItem("userHistory");
  return saved ? JSON.parse(saved) : [];
});

// When user clicks a movie
const handleMovieClick = (movie) => {
  const updatedHistory = [movie, ...userHistory.filter(m => m.id !== movie.id)].slice(0, 10); // keep last 10
  setUserHistory(updatedHistory);
  localStorage.setItem("userHistory", JSON.stringify(updatedHistory));
};

  try {
    const response = await fetch(`https://movie-recommendation-2-pw6c.onrender.com/suggest?query=${query}`);
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    // If backend returned an error object
    if (data.error) {
      console.error("Backend error:", data.error);
      setSuggestions([]); // clear suggestions
    } else {
      setSuggestions(data.length > 0 ? data : ["No results found"]);
    }
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    setSuggestions(["No results found"]);
  }
};

  const getRecommendations = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setRecommendations([]);

    try {
      const response = await fetch(
        "https://movie-recommendation-2-pw6c.onrender.com/recommend",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: query, language , history: userHistory}),
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      if (data.recommendations) {
        setRecommendations(data.recommendations);
      } else {
        setError(data.error || "No recommendations found.");
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to fetch recommendations.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>🎬 Movie Recommender</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter a movie (e.g. Inception)"
          value={query}
          onChange={handleChange}
          style={{
            padding: "10px",
            width: "300px",
            marginRight: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            padding: "10px",
            marginRight: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
          <option value="kn">Kannada</option>
          <option value="ml">Malayalam</option>
        </select>
{/* Suggestion dropdown */}
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
          style={{
            padding: "10px 15px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
          }}
        >
          Recommend
        </button>
      </div>

      {loading && <p>Loading recommendations...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {recommendations.map((movie, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
              boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
            }}
            onClick={() => handleMovieClick(movie)}
          >
            
            {movie.poster ? (
              <img
                src={movie.poster}
                alt={movie.title}
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "375px",
                  backgroundColor: "#eee",
                  borderRadius: "8px",
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#777",
                }}
              >
                No Poster
              </div>
            )}

            <h3>{movie.title}</h3>
    <StarRating rating={movie.vote_average} />

            <p style={{ fontSize: "14px", color: "#555" }}>{movie.overview}</p>
            <p style={{ fontSize: "12px", color: "#888" }}>
              Genres: {movie.genres}
            </p>
            <a
              href={movie.tmdb_link}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              View on TMDb
            </a>
          </div>
        ))}


      </div>
              {/* --- Trending Section --- */}
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
            
          }}
          onClick={() => handleMovieClick(movie)}
        >
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              style={{ width: "100%", borderRadius: "8px", marginBottom: "10px" }}
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
              }}
            >
              No Poster
            </div>
          )}

          <h4 style={{ fontSize: "16px", margin: "5px 0" }}>{movie.title}</h4>
          <StarRating rating={movie.vote_average} />
        </div>
      ))}
    </div>
  </>
)}
{userHistory.length > 0 && (
  <>
    <h2>🕒 Recently Viewed</h2>
    <div style={{ display: "flex", gap: "15px", overflowX: "auto" }}>
      {userHistory.map((movie, idx) => (
        <div key={idx} style={{ minWidth: "200px", border: "1px solid #ddd", borderRadius: "10px", padding: "10px" }}>
          <img src={movie.poster} alt={movie.title} style={{ width: "100%", borderRadius: "8px", marginBottom: "10px" }} />
          <h4>{movie.title}</h4>
        </div>
      ))}
    </div>
  </>
)}

    </div>
  );
}

export default App;
