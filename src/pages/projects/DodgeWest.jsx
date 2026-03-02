import XMLFileRenderer from "../../components/XMLFileRenderer";
import Screenshot from "../../components/Screenshot";

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
            <Screenshot src="/images/DodgeWest/DW_Level1.png" alt="Dodge West Screenshot 1" size={400} />
            <Screenshot src="/images/DodgeWest/DW_Level1-2.png" alt="Dodge West Screenshot 2" size={400} />
            <Screenshot src="/images/DodgeWest/DW_Level2.png" alt="Dodge West Screenshot 3" size={400} />
            <Screenshot src="/images/DodgeWest/DW_Level3.png" alt="Dodge West Screenshot 4" size={400} />
        </div>
    );
}

export default DodgeWest;