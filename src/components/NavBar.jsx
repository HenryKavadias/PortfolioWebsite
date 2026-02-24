import { Link } from 'react-router-dom';

function NavBar() {
    return (
        <nav className='navbar'>
            <ul>
                <li><Link to="/" className="nav-link">Home</Link></li>
                <li><Link to="/purger" className="nav-link">Projects</Link></li>
                <li><Link to="/dodgeWest" className="nav-link">Dodge West</Link></li>
                <li><Link to="/friendinme" className="nav-link">Friend In Me</Link></li>
                <li><Link to="/eggescape" className="nav-link">Egg Escape</Link></li>
                <li><Link to="/gambitandtheanchored" className="nav-link">Gambit And The Anchored</Link></li>
            </ul>
        </nav>
    );
}

export default NavBar;