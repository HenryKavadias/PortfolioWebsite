import XMLFileRenderer from "../../components/XMLFileRenderer";

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
        </div>
    );
}

export default EggEscape;