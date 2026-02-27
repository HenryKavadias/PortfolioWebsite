
import XMLFileRenderer from "../components/XMLFileRenderer";
import WebLink from "../components/WebLink";

/*
    Required content:
    - Title
    - Email and other web links
    - Short bio (about me)
    - Project headings (Two Sections Independent / Team Projects, and University Group Projects)
    - Project links with image thumbnails

    <WebLink link="/purger" text="Purger" img="/images/PurgerIcon.png" />
*/

function WebPageLinks() {

    return (
        <div>
            <div>
                <h2>Independent / Team Projects</h2>
                <WebLink link="/purger" text="Purger" img="/images/Purger/PurgerIcon.png" />
                <WebLink link="https://thefid.itch.io/cola-killer" text="Cola-Killer" img="/images/ColaKillerIcon.png" />
                <WebLink link="https://thefid.itch.io/hue-behind-the-mask" text="Hue Behind the Mask" img="/images/HueBehindtheMaskIcon.jpg" />
            </div>
            <div>
                <h2>University Group Projects</h2>
                <WebLink link="/dodgeWest" text="Dodge West" img="/images/DodgeWest/DodgeWestIcon.png" />
                <WebLink link="/friendInMe" text="Friend In Me" img="/images/FriendInMe/FriendInMeIcon.png" />
                <WebLink link="/eggEscape" text="Egg Escape" img="/images/EggEscape/WhelpDragon.png" />
                <WebLink link="/gambitAndTheAnchored" text="Gambit and the Anchored" img="/images/GambitAndTheAnchored/GambitAndAnchoredIcon.png" />
            </div>
        </div>
    );
}


function Home() {    
    return (
        <div>
            <h1>Software Engineer &amp; Gameplay Programmer</h1>
            <XMLFileRenderer fileName="content/Home/AboutMe" />
            <WebPageLinks />
        </div>
    );
}

export default Home;