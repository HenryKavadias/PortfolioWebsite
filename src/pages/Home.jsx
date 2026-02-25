
import TextFileRenderer from "../components/TextFileRenderer";

/*
    Required content:
    - Title
    - Email and other web links
    - Short bio (about me)
    - Project headings (Two Sections Independent / Team Projects, and University Group Projects)
    - Project links with image thumbnails
*/

function Home() {
    
    const content = <TextFileRenderer fileName="text/Home/AboutMe" />;
    
    return (
        <div>
            <h1>Henry Kavadias-Barnes</h1>
            {content}
        </div>
    );
}

export default Home;