import PageLoader from "../../components/PageLoader";
import XMLFileRenderer from "../../components/XMLFileRenderer";
import WebPageImage from "../../components/WebPageImage";
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
    - Major contributions section
*/

function ExternalSiteLinks() {
    const gitHubProjectWiki = <WebLink link="https://github.com/HenroyK/DreamEngine/wiki" text="GitHub Wiki" />;
    const gitHubProject = <WebLink link="https://github.com/HenroyK/DreamEngine" text="GitHub" />;
    const itchIoProject = <WebLink link="https://dreamengine.itch.io/a-friend-in-me" text="Download Demo" />;
    const presskit = <WebLink link="https://github.com/HenryKavadias/Dodge-West/wiki/Press-Kit" text="Press Kit" />;

    return (
        <>
            <p>{itchIoProject} | {gitHubProject} | {gitHubProjectWiki} | {presskit}</p>
        </>
    );
}

function DodgeWest() {
    
    return (
        <PageLoader>
            <div className="project-page">
                <div className="project-title">
                    <XMLFileRenderer fileName="content/DodgeWest/DW_Title" />
                </div>
                <div className="project-hero">
                    <div className="VideoBlock">
                        <YouTubeVideo 
                            url="https://www.youtube.com/watch?v=oYSzKJ3RFl0" 
                            title="Dodge West Gameplay Demo"
                            width={800}
                            height={450}
                        />
                    </div>
                    <div className="TextBlock-A">
                        <XMLFileRenderer fileName="content/DodgeWest/DW_Content" />
                        <div className="ExternalLinks">
                            <ExternalSiteLinks />
                        </div>
                    </div>
                </div>
                <div className="project-subsection">
                    <div className="ImageBlock-B">
                        <WebPageImage src="/images/DodgeWest/DW_Level1.png" alt="Dodge West Screenshot 1" size={300} />
                        <WebPageImage src="/images/DodgeWest/DW_Level3.png" alt="Dodge West Screenshot 4" size={300} />
                        <WebPageImage src="/images/DodgeWest/DW_Level2.png" alt="Dodge West Screenshot 3" size={300} />
                        <WebPageImage src="/images/DodgeWest/DW_Level1-2.png" alt="Dodge West Screenshot 2" size={300} />
                    </div>
                    <div className="TextBlock-B">
                        <div className="Subtitle"><XMLFileRenderer fileName="content/DodgeWest/DW_MC_Title" /></div>
                        <div className="Subcontent"><XMLFileRenderer fileName="content/DodgeWest/DW_MajorContributions" /></div>
                    </div>
                </div>
            </div>
        </PageLoader>
    );
}

export default DodgeWest;
