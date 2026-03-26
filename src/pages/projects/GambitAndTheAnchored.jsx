import XMLFileRenderer from "../../components/XMLFileRenderer";
import WebPageImage from "../../components/WebPageImage";
import PageLoader from "../../components/PageLoader";
import YouTubeVideo from "../../components/YouTubeVideo";

/*
    Required content:
    - Title
    - Description
    - embedded video (if applicable)
    - links
    - Screenshots
*/

function GambitAndTheAnchored() {
    
    return (
        <PageLoader>
            <div>
                <XMLFileRenderer fileName="content/GambitAnchored/GatA_Title" />
                <XMLFileRenderer fileName="content/GambitAnchored/GtaA_Content" />
                <XMLFileRenderer fileName="content/GambitAnchored/GatA_Links" />
                <YouTubeVideo 
                    url="https://www.youtube.com/watch?v=3Mo6NxXUL5E" 
                    title="Gambit And The Anchored Gameplay Demo"
                    width={800}
                    height={450}
                />
                <WebPageImage src="/images/GambitAndTheAnchored/GaA-img1.png" alt="Gambit And The Anchored Screenshot 1" size={400} />
                <WebPageImage src="/images/GambitAndTheAnchored/GaA-img2.png" alt="Gambit And The Anchored Screenshot 2" size={400} />
            </div>
        </PageLoader>
    );
}

export default GambitAndTheAnchored;
