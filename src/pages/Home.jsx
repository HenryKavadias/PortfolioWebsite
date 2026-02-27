
import XMLFileRenderer from "../components/XMLFileRenderer";

/*
    Required content:
    - Title
    - Email and other web links
    - Short bio (about me)
    - Project headings (Two Sections Independent / Team Projects, and University Group Projects)
    - Project links with image thumbnails
*/

function Home() {
    
    
    
    return (
        <div>
            <h1>Software Engineer &amp; Gameplay Programmer</h1>
            <XMLFileRenderer fileName="content/Home/AboutMe" />
            <h2>Independent / Team Projects</h2>
            
        </div>
    );
}

export default Home;