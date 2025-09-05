import React, { useState } from "react";

function App() {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("en"); // default English
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getRecommendations = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setRecommendations([]);

    try {
      const response = await fetch("http://127.0.0.1:5000/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: query, language }),
      });

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
          onChange={(e) => setQuery(e.target.value)}
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
            <p style={{ fontSize: "14px", color: "#555" }}>{movie.overview}</p>
            <p style={{ fontSize: "12px", color: "#888" }}>Genres: {movie.genres}</p>
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
    </div>
  );
}

export default App;
