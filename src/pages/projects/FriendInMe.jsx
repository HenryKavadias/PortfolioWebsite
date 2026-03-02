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

function FriendInMe() {
    
    return (
        <div>
            <XMLFileRenderer fileName="content/FriendInMe/FIM_Title" />
            <XMLFileRenderer fileName="content/FriendInMe/FIM_Content" />
            <Screenshot src="/images/FriendInMe/FriendInMeScreenshot1.png" alt="FriendInMe Screenshot 1" size={400} />
            <Screenshot src="/images/FriendInMe/FriendInMeScreenshot2.png" alt="FriendInMe Screenshot 2" size={400} />
            <Screenshot src="/images/FriendInMe/FriendInMeScreenshot3.png" alt="FriendInMe Screenshot 3" size={400} />
        </div>
    );
}

export default FriendInMe;