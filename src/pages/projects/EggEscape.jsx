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

function EggEscape() {
    
    return (
        <PageLoader>
            <div>
                <XMLFileRenderer fileName="content/EggEscape/EE_Title" />
                <XMLFileRenderer fileName="content/EggEscape/EE_Content" />
                <WebPageImage src="/images/EggEscape/EggEscape-img1.png" alt="EggEscape Screenshot 1" size={400} />
                <WebPageImage src="/images/EggEscape/EggEscape-img2.png" alt="EggEscape Screenshot 2" size={400} />
                <WebPageImage src="/images/EggEscape/EggEscape-img3.png" alt="EggEscape Screenshot 3" size={400} />
            </div>
        </PageLoader>
    );
}

export default EggEscape;
