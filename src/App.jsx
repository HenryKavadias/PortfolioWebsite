import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Purger from "./pages/projects/Purger";
import DodgeWest from "./pages/projects/DodgeWest";
import FriendInMe from "./pages/projects/FriendInMe";
import EggEscape from "./pages/projects/EggEscape";
import GambitAndTheAnchored from "./pages/projects/GambitAndTheAnchored";
import NavBar from "./components/NavBar";
import './css/App.css';

function App() {
  

  return (
    <div>
      <NavBar />
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
    </div>
  )
}

export default App
