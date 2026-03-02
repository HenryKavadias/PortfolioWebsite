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

function FriendInMe() {

    return (
        <PageLoader>
            <div>
                <XMLFileRenderer fileName="content/FriendInMe/FIM_Title" />
                <XMLFileRenderer fileName="content/FriendInMe/FIM_Content" />
                <WebPageImage src="/images/FriendInMe/FriendInMeScreenshot1.png" alt="FriendInMe Screenshot 1" size={400} />
                <WebPageImage src="/images/FriendInMe/FriendInMeScreenshot2.png" alt="FriendInMe Screenshot 2" size={400} />
                <WebPageImage src="/images/FriendInMe/FriendInMeScreenshot3.png" alt="FriendInMe Screenshot 3" size={400} />
            </div>
        </PageLoader>
    );
}


export default FriendInMe;
