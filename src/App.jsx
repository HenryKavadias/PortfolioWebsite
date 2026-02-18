import { useState } from 'react';
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Purger from "./pages/Purger";
import DodgeWest from "./pages/DodgeWest";
import FriendInMe from "./pages/FriendInMe";
import EggEscape from "./pages/EggEscape";
import GambitAndTheAnchored from "./pages/GambitAndTheAnchored";
import './css/App.css';

function App() {
  

  return (
    <main className='main-content'>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/purger" element={<Purger />} />
        <Route path="/dodgewest" element={<DodgeWest />} />
        <Route path="/friendinme" element={<FriendInMe />} />
        <Route path="/eggescape" element={<EggEscape />} />
        <Route path="/gambitandtheanchored" element={<GambitAndTheAnchored />} />
      </Routes>
    </main>
  )
}

export default App
