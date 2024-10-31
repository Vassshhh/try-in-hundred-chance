import React, { useState, useEffect } from "react";
import Map from "./Map";
import "./App.css";

const App = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lightStyle, setLightStyle] = useState({});

  const handleStart = () => {
    setIsStarted(true);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMouseMove = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    setLightStyle({
      transform: `translate(${x - 50}px, ${y - 50}px)`,
      opacity: 0.5,
      transition: "transform 0.1s, opacity 0.2s",
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      boxShadow: "0 0 20px rgba(255, 255, 255, 0.5)",
    });
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="app-container">
      <div className="hamburger-menu" onClick={toggleMenu}>
        ☰
      </div>
      {isMenuOpen && (
        <div className="menu">
          <button onClick={toggleMenu}>Close</button>
          <button onClick={() => window.open("https://fyjktn-8080.csb.app/")}>
            External Link
          </button>
        </div>
      )}
      {!isStarted ? (
        <div className="welcome-screen">
          <h1 class="h1">VERRÀT</h1>
          <button className="bt" onClick={handleStart}>
            Start
          </button>
        </div>
      ) : (
        <Map setIsStarted={setIsStarted} />
      )}
      <a href="https://fyjktn-8080.csb.app/" target="_blank">
        <img
          src="https://i.imgur.com/zVbDw59.png" // Ensure the URL is correct
          alt="A descriptive alt text"
          className="centered-image"
        />
      </a>

      <div className="light" style={{ ...lightStyle }}></div>
    </div>
  );
};

export default App;
