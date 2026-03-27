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
    - Screenshots
*/

function Purger() {
    
    return (
        <PageLoader>
            <div className="project-page">
                <div className="project-title"><XMLFileRenderer fileName="content/Purger/P_Title" /></div>
                <div className="project-hero">
                    <div className="VideoBlock">
                        <YouTubeVideo 
                            url="https://www.youtube.com/watch?v=HKYCYPcqDZA" 
                            title="Purger Gameplay Demo"
                            width={800}
                            height={450}
                        />
                    </div>
                    <div className="TextBlock-A">
                        <XMLFileRenderer fileName="content/Purger/P_Content" />
                        <div className="ExternalLinks">
                            <WebLink link="https://fiddury.itch.io/purger" text="Prototype Demo" />
                        </div>
                    </div>
                </div>
                <div className="ImageBlock-A">
                <WebPageImage src="/images/Purger/PurgerScreenShot1.png" alt="Purger Screenshot 1" size={340} />
                <WebPageImage src="/images/Purger/PurgerScreenShot2.png" alt="Purger Screenshot 2" size={340} />
                <WebPageImage src="/images/Purger/PurgerScreenShot3.png" alt="Purger Screenshot 3" size={340} />
                <WebPageImage src="/images/Purger/PurgerScreenShot4.png" alt="Purger Screenshot 4" size={340} />
                </div>
            </div>
        </PageLoader>
    );

}

export default Purger;
