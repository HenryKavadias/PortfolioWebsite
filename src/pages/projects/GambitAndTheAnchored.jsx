import XMLFileRenderer from "../../components/XMLFileRenderer";
import WebPageImage from "../../components/WebPageImage";
import PageLoader from "../../components/PageLoader";
import YouTubeVideo from "../../components/YouTubeVideo";
import WebLink from "../../components/WebLink";
import '../../css/ProjectPage.css';

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
            <div className="project-page">
                <div className="project-title">
                    <XMLFileRenderer fileName="content/GambitAnchored/GatA_Title" />
                </div>
                <div className="project-hero">
                    <div className="VideoBlock">
                        <YouTubeVideo 
                            url="https://www.youtube.com/watch?v=3Mo6NxXUL5E" 
                            title="Gambit And The Anchored Gameplay Demo"
                            width={800}
                            height={450}
                        />
                    </div>
                    <div className="TextBlock-A">
                        <XMLFileRenderer fileName="content/GambitAnchored/GtaA_Content" />
                        <div className="ExternalLinks">
                            <WebLink link="https://fiddury.itch.io/gambit-and-the-anchored" text="Download Demo" />
                        </div>
                    </div>
                </div>
                
                <div className="ImageBlock-A">
                    <WebPageImage src="/images/GambitandtheAnchored/GaA-img1.png" alt="Gambit And The Anchored Screenshot 1" size={600} />
                    <WebPageImage src="/images/GambitandtheAnchored/GaA-img2.png" alt="Gambit And The Anchored Screenshot 2" size={600} />
                </div>
            </div>
        </PageLoader>
    );
}

export default GambitAndTheAnchored;
