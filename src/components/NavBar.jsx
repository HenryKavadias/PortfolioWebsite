import { Link } from 'react-router-dom';
import '../css/NavBar.css';

function NavBar() {
    return (
        <nav className='navbar'>
            <div className="navbar-links">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/purger" className="nav-link">Projects</Link>
                <Link to="/dodgeWest" className="nav-link">Dodge West</Link>
                <Link to="/friendinme" className="nav-link">Friend In Me</Link>
                <Link to="/eggescape" className="nav-link">Egg Escape</Link>
                <Link to="/gambitandtheanchored" className="nav-link">Gambit And The Anchored</Link>
            </div>
        </nav>
    );
}

export default NavBar;