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

function GambitAndTheAnchored() {
    
    return (
        <div>
            <XMLFileRenderer fileName="content/GambitAnchored/GatA_Title" />
            <XMLFileRenderer fileName="content/GambitAnchored/GtaA_Content" />
            <Screenshot src="/images/GambitAndTheAnchored/GaA-img1.png" alt="Gambit And The Anchored Screenshot 1" />
            <Screenshot src="/images/GambitAndTheAnchored/GaA-img2.png" alt="Gambit And The Anchored Screenshot 2" />
        </div>
    );
}

export default GambitAndTheAnchored;