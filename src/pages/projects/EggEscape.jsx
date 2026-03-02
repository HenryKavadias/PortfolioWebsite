import XMLFileRenderer from "../../components/XMLFileRenderer";
import Screenshot from "../../components/Screenshot";

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
        <div>
            <XMLFileRenderer fileName="content/EggEscape/EE_Title" />
            <XMLFileRenderer fileName="content/EggEscape/EE_Content" />
            <Screenshot src="/images/EggEscape/EggEscape-img1.png" alt="EggEscape Screenshot 1" size={400} />
            <Screenshot src="/images/EggEscape/EggEscape-img2.png" alt="EggEscape Screenshot 2" size={400} />
            <Screenshot src="/images/EggEscape/EggEscape-img3.png" alt="EggEscape Screenshot 3" size={400} />
        </div>
    );
}

export default EggEscape;