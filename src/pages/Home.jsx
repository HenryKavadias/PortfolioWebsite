
import XMLFileRenderer from "../components/XMLFileRenderer";
import WebLink from "../components/WebLink";
import PageLoader from "../components/PageLoader";
import "../css/Home.css";

/*
    Required content:
    - Title
    - Email and other web links
    - Short bio (about me)
    - Project headings (Two Sections Independent / Team Projects, and University Group Projects)
    - Project links with image thumbnails

    <WebLink link="/purger" text="Purger" img="/images/PurgerIcon.png" />
*/

function EmailAndExternalSiteLinks() {
    const email = <WebLink link="mailto:henrykavadiasbarnes@gmail.com" text="hkavadiasbarnes@gmail.com" />;
    const linkedIn = <WebLink link="https://www.linkedin.com/in/henrykavadiasbarnes/" text="LinkedIn" />;
    const gitHub = <WebLink link="https://github.com/HenryKavadias" text="GitHub" />;
    const itchIo = <WebLink link="https://thefid.itch.io/" text="Game Demos" />;


    return (
        <div className="email-and-links">
            <p>{email} | {linkedIn} | {gitHub} | {itchIo}</p>
        </div>
    );
}

function WebPageLinks() {

    return (
        <div>
            <div>
                <h2>Independent / Team Projects</h2>
                <div className="weblink-container">
                    <WebLink link="/purger" text="Purger" img="/images/Purger/PurgerIcon.png" />
                    <WebLink link="https://thefid.itch.io/cola-killer" text="Cola-Killer" img="/images/ColaKillerIcon.png" />
                    <WebLink link="https://thefid.itch.io/hue-behind-the-mask" text="Hue Behind the Mask" img="/images/HueBehindtheMaskIcon.jpg" />
                </div>
            </div>
            <div>
                <h2>University Group Projects</h2>
                <div className="weblink-container">
                    <WebLink link="/dodgeWest" text="Dodge West" img="/images/DodgeWest/DodgeWestIcon.png" />
                    <WebLink link="/friendInMe" text="Friend In Me" img="/images/FriendInMe/FriendInMeIcon.png" />
                    <WebLink link="/eggEscape" text="Egg Escape" img="/images/EggEscape/WhelpDragon.png" />
                    <WebLink link="/gambitAndTheAnchored" text="Gambit and the Anchored" img="/images/GambitAndTheAnchored/GambitAndAnchoredIcon.png" />
                </div>
            </div>
        </div>
    );
}


function Home() {    
    
    const homeContent = <div>
            <h1>Software Engineer &amp; Gameplay Programmer</h1>
            <EmailAndExternalSiteLinks />
            <XMLFileRenderer fileName="content/Home/AboutMe" />
            <WebPageLinks />
        </div>;
    
    return (
        <PageLoader>
            {homeContent}
        </PageLoader>
    );
}

export default Home;