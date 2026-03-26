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

function EggEscape() {
    
    return (
        <PageLoader>
            <div className="project-page">
                <div className="project-title">
                    <XMLFileRenderer fileName="content/EggEscape/EE_Title" />
                </div>
                <div className="project-hero">
                    <div className="VideoBlock">
                        <YouTubeVideo 
                            url="https://www.youtube.com/watch?v=d9uCKUo8h64" 
                            title="Egg Escape Gameplay Demo"
                            width={800}
                            height={450}
                        />
                    </div>
                    <div className="TextBlock-A">
                        <XMLFileRenderer fileName="content/EggEscape/EE_Content" />
                        <div className="ExternalLinks">
                            <WebLink link="https://thefid.itch.io/egg-escape" text="Download Demo" />
                        </div>
                    </div>
                </div>

                <div className="ImageBlock-A">
                    <WebPageImage src="/images/EggEscape/EggEscape-img1.png" alt="EggEscape Screenshot 1" size={400} />
                    <WebPageImage src="/images/EggEscape/EggEscape-img2.png" alt="EggEscape Screenshot 2" size={400} />
                    <WebPageImage src="/images/EggEscape/EggEscape-img3.png" alt="EggEscape Screenshot 3" size={400} />
                </div>
            </div>
        </PageLoader>
    );
}

export default EggEscape;
