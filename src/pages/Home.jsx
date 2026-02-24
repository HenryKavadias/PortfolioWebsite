
import ParagraphContent from "../components/ParagraphContent";

import { TextFileRenderer } from "../contexts/TextFileRenderer";

function Home() {
    


    return (
        <div>
            <h1>Henry Kavadias-Barnes</h1>
            <ParagraphContent content={
                TextFileRenderer("/src/assets/AboutMe.txt")} />
        </div>
    );
}

export default Home;