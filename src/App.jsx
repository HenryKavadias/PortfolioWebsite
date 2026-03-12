import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import './css/App.css'
import { Home, Purger, DodgeWest, FriendInMe, EggEscape, GambitAndTheAnchored, YouTubeTest, YouTubeErrorTest } from "./pages";


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
          {/* test routes */}
          <Route path="/youtube-test" element={<YouTubeTest />} />
          <Route path="/youtube-error-test" element={<YouTubeErrorTest />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
