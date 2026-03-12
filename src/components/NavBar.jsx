import { Link } from 'react-router-dom';
import '../css/NavBar.css';

function NavBar() {
    
    const NavBarOG = (<div className="navbar-links">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/purger" className="nav-link">Purger</Link>
                <Link to="/dodgeWest" className="nav-link">Dodge West</Link>
                <Link to="/friendinme" className="nav-link">Friend In Me</Link>
                <Link to="/eggescape" className="nav-link">Egg Escape</Link>
                <Link to="/gambitandtheanchored" className="nav-link">Gambit And The Anchored</Link>
            </div>);
    
    const NavBarNew = (<div className="navbar-links">
                <Link to="/" className="nav-link">Home</Link>
                <ul>
                    <li><Link to="/purger" className="nav-link">Purger</Link></li>
                    <li><Link to="/dodgeWest" className="nav-link">Dodge West</Link></li>
                    <li><Link to="/friendinme" className="nav-link">Friend In Me</Link></li>
                    <li><Link to="/eggescape" className="nav-link">Egg Escape</Link></li>
                    <li><Link to="/gambitandtheanchored" className="nav-link">Gambit And The Anchored</Link></li>
                </ul>
            </div>);
    
    return (
        <nav className='navbar'>
            {NavBarOG}
        </nav>
    );
}

export default NavBar;