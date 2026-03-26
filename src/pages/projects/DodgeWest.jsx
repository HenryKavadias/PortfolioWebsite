import PageLoader from "../../components/PageLoader";
import XMLFileRenderer from "../../components/XMLFileRenderer";
import WebPageImage from "../../components/WebPageImage";
import YouTubeVideo from "../../components/YouTubeVideo";

/*
    Required content:
    - Title
    - Description
    - embedded video (if applicable)
    - links
    - Screenshots
    - Major contributions section
*/

function DodgeWest() {
    
    return (
        <PageLoader>
            <div>
                <XMLFileRenderer fileName="content/DodgeWest/DW_Title" />
                <XMLFileRenderer fileName="content/DodgeWest/DW_Content" />
                <XMLFileRenderer fileName="content/DodgeWest/DW_Links" />
                <YouTubeVideo 
                    url="https://www.youtube.com/watch?v=oYSzKJ3RFl0" 
                    title="Dodge West Gameplay Demo"
                    width={800}
                    height={450}
                />
                <XMLFileRenderer fileName="content/DodgeWest/DW_MC_Title" />
                <XMLFileRenderer fileName="content/DodgeWest/DW_MajorContributions" />
                <WebPageImage src="/images/DodgeWest/DW_Level1.png" alt="Dodge West Screenshot 1" size={400} />
                <WebPageImage src="/images/DodgeWest/DW_Level1-2.png" alt="Dodge West Screenshot 2" size={400} />
                <WebPageImage src="/images/DodgeWest/DW_Level2.png" alt="Dodge West Screenshot 3" size={400} />
                <WebPageImage src="/images/DodgeWest/DW_Level3.png" alt="Dodge West Screenshot 4" size={400} />
            </div>
        </PageLoader>
    );
}

export default DodgeWest;
