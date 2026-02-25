import XMLFileRenderer from "../../components/XMLFileRenderer";

/*
    Required content:
    - Title
    - Description
    - embedded video (if applicable)
    - links
    - Screenshots
*/

function FriendInMe() {
    
    return (
        <div>
            <XMLFileRenderer fileName="content/FriendInMe/FIM_Title" />
            <XMLFileRenderer fileName="content/FriendInMe/FIM_Content" />
        </div>
    );
}

export default FriendInMe;