import XMLFileRenderer from "../../components/XMLFileRenderer";
import WebPageImage from "../../components/WebPageImage";
import PageLoader from "../../components/PageLoader";
import YouTubeVideo from "../../components/YouTubeVideo";
import WebLink from "../../components/WebLink";
import '../../css/ProjectPage.css';

/*
    Required content:
    - Title
    - Description
    - embedded video (if applicable)
    - links
    - Screenshots
*/

function ExternalSiteLinks() {
    const gitHubProjectWiki = <WebLink link="https://github.com/HenroyK/DreamEngine/wiki" text="GitHub Wiki" />;
    const gitHubProject = <WebLink link="https://github.com/HenroyK/DreamEngine" text="GitHub" />;
    const itchIoProject = <WebLink link="https://dreamengine.itch.io/a-friend-in-me" text="Download Demo" />;

    return (
        <>
            <p>{itchIoProject} | {gitHubProject} | {gitHubProjectWiki}</p>
        </>
    );
}

function FriendInMe() {

    return (
        <PageLoader>
            <div className="project-page">
                <div className="project-title">
                    <XMLFileRenderer fileName="content/FriendInMe/FIM_Title" />
                </div>
                <div className="project-hero">
                    <div className="VideoBlock">
                        <YouTubeVideo 
                            url="https://www.youtube.com/watch?v=3stt8SeqgyU" 
                            title="Friend In Me Gameplay Demo"
                            width={800}
                            height={450}
                        />
                    </div>
                    <div className="TextBlock-A">
                        <XMLFileRenderer fileName="content/FriendInMe/FIM_Content" />
                        <div className="ExternalLinks">
                            <ExternalSiteLinks />
                        </div>
                    </div>
                </div>
                <div className="ImageBlock-A">
                    <WebPageImage src="/images/FriendInMe/FriendInMeScreenshot1.png" alt="FriendInMe Screenshot 1" size={400} />
                    <WebPageImage src="/images/FriendInMe/FriendInMeScreenshot2.png" alt="FriendInMe Screenshot 2" size={400} />
                    <WebPageImage src="/images/FriendInMe/FriendInMeScreenshot3.png" alt="FriendInMe Screenshot 3" size={400} />
                </div>
            </div>
        </PageLoader>
    );
}

export default FriendInMe;
