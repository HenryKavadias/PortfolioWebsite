import XMLFileRenderer from "../../components/XMLFileRenderer";
import WebPageImage from "../../components/WebPageImage";
import PageLoader from "../../components/PageLoader";
import YouTubeVideo from "../../components/YouTubeVideo";

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
            <div>
                <XMLFileRenderer fileName="content/Purger/P_Title" />
                <XMLFileRenderer fileName="content/Purger/P_Content" />
                {/* Example YouTube video - replace with actual Purger gameplay video URL */}
                <YouTubeVideo 
                    url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
                    title="Purger Gameplay Trailer"
                    width={800}
                    height={450}
                />
                <WebPageImage src="/images/Purger/PurgerScreenshot1.png" alt="Purger Screenshot 1" size={400} />
                <WebPageImage src="/images/Purger/PurgerScreenshot2.png" alt="Purger Screenshot 2" size={400} />
                <WebPageImage src="/images/Purger/PurgerScreenshot3.png" alt="Purger Screenshot 3" size={400} />
                <WebPageImage src="/images/Purger/PurgerScreenshot4.png" alt="Purger Screenshot 4" size={400} />
            </div>
        </PageLoader>
    );

}

export default Purger;
