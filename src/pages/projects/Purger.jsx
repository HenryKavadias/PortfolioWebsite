import XMLFileRenderer from "../../components/XMLFileRenderer";
import WebPageImage from "../../components/WebPageImage";
import PageLoader from "../../components/PageLoader";
import YouTubeVideo from "../../components/YouTubeVideo";
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
                    
                    <div className="ContentBlock-B">
                    <YouTubeVideo 
                        url="https://www.youtube.com/watch?v=HKYCYPcqDZA" 
                        title="Purger Gameplay Demo"
                        width={800}
                        height={450}
                    />
                    </div>
                    <div className="ContentBlock-A">
                    
                    <XMLFileRenderer fileName="content/Purger/P_Content" />
                    </div>
                </div>
                <div className="ExternalLinks">
                    <XMLFileRenderer fileName="content/Purger/P_Links" />
                </div>
                <div className="ContentBlock-C">
                <WebPageImage src="/images/Purger/PurgerScreenshot1.png" alt="Purger Screenshot 1" size={400} />
                <WebPageImage src="/images/Purger/PurgerScreenshot2.png" alt="Purger Screenshot 2" size={400} />
                <WebPageImage src="/images/Purger/PurgerScreenshot3.png" alt="Purger Screenshot 3" size={400} />
                <WebPageImage src="/images/Purger/PurgerScreenshot4.png" alt="Purger Screenshot 4" size={400} />
                </div>
            </div>
        </PageLoader>
    );

}

export default Purger;
