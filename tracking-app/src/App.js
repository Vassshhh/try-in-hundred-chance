import React, { useState } from "react";
import Map from "./Map";
import "./App.css";

const App = () => {
  const [isStarted, setIsStarted] = useState(false);

  const handleStart = () => {
    setIsStarted(true);
  };

  return (
    <div className="app-container">
      {!isStarted ? (
        <div className="welcome-screen">
          <h1>VERRÀT</h1>
          <button onClick={handleStart}>Start</button>
          <button> onCLick= window open (https://4qxcwx-8080.csb.app/)</button>
        </div>
      ) : (
        <Map />
      )}
    </div>
  );
};

export default App;
