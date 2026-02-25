import Paragraph from "../components/ParagraphContent";

import TextFileRenderer from "../components/TextFileRenderer";

function Home() {
    
    const HomePageContent = "it didn't work";//TextFileRenderer(process.env.PUBLIC_URL + "/text/AboutMe.txt");
    //<Paragraph text={HomePageContent} />
    return (
        <div>
            <h1>Henry Kavadias-Barnes</h1>
            <TextFileRenderer fileName="text/AboutMe" />
        </div>
    );
}

export default Home;