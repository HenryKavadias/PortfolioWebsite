import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../css/NavBar.css';

function NavBar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const NavBarOG = (
            <>
                <Link to="/" className="author-name">Henry Kavadias-Barnes</Link>
                <div className="navbar-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/purger" className="nav-link">Purger</Link>
                    <Link to="/dodgeWest" className="nav-link">Dodge West</Link>
                    <Link to="/friendinme" className="nav-link">Friend In Me</Link>
                    <Link to="/eggescape" className="nav-link">Egg Escape</Link>
                    <Link to="/gambitandtheanchored" className="nav-link">Gambit And The Anchored</Link>
                </div>
            </>);
    
    const NavBarNew = (<div className="navbar-container">
                <Link to="/" className="nav-title">Home</Link>
                <div className="nav-menu" onClick={() => {
                    setMenuOpen(!menuOpen);
                }}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <ul className={menuOpen ? "open" : ""}>
                    <li><NavLink to="/purger">Purger</NavLink></li>
                    <li><NavLink to="/dodgeWest">Dodge West</NavLink></li>
                    <li><NavLink to="/friendinme">Friend In Me</NavLink></li>
                    <li><NavLink to="/eggescape">Egg Escape</NavLink></li>
                    <li><NavLink to="/gambitandtheanchored">Gambit And The Anchored</NavLink></li>
                </ul>
            </div>);
    
    return (
        <nav className='navbar'>
            {NavBarNew}
        </nav>
    );
}

export default NavBar;