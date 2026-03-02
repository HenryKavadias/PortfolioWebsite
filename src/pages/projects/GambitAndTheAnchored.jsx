import XMLFileRenderer from "../../components/XMLFileRenderer";
import WebPageImage from "../../components/WebPageImage";
import PageLoader from "../../components/PageLoader";

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
                <WebPageImage src="/images/GambitAndTheAnchored/GaA-img1.png" alt="Gambit And The Anchored Screenshot 1" />
                <WebPageImage src="/images/GambitAndTheAnchored/GaA-img2.png" alt="Gambit And The Anchored Screenshot 2" />
            </div>
        </PageLoader>
    );
}

export default GambitAndTheAnchored;
