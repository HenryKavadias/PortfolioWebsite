import XMLFileRenderer from "../../components/XMLFileRenderer";

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
        <div>
            <XMLFileRenderer fileName="content/DodgeWest/DW_Title" />
            <XMLFileRenderer fileName="content/DodgeWest/DW_Content" />
            <XMLFileRenderer fileName="content/DodgeWest/DW_MC_Title" />
            <XMLFileRenderer fileName="content/DodgeWest/DW_MajorContributions" />
        </div>
    );
}

export default DodgeWest;