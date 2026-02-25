import XMLFileRenderer from "../../components/XMLFileRenderer";

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
        </div>
    );
}

export default GambitAndTheAnchored;