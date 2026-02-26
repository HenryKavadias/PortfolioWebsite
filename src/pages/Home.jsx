
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
    
    const content = <XMLFileRenderer fileName="content/Home/AboutMe" />;
    const heading = <XMLFileRenderer fileName="content/Home/HP-Title" />;

    return (
        <div>
            {heading}
            {content}
        </div>
    );
}

export default Home;