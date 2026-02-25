import XMLFileRenderer from "../../components/XMLFileRenderer";

/*
    Required content:
    - Title
    - Description
    - embedded video (if applicable)
    - Screenshots
*/

function Purger() {
    
    return (
        <div>
            <XMLFileRenderer fileName="content/Purger/P_Title" />
            <XMLFileRenderer fileName="content/Purger/P_Content" />
        </div>
    );
}

export default Purger;