import XMLFileRenderer from "../../components/XMLFileRenderer";

/*
    Required content:
    - Title
    - Description
    - embedded video (if applicable)
    - Screenshots
*/

function Screenshot({ src, alt, imageSize = 600 }) {
    return (
        <img 
        src={src} 
        alt={alt} 
        className="web-link-image"
        style={{ width: `${imageSize}px`, height: `${imageSize}px` }}/>
    );
}

function Purger() {
    
    return (
        <div>
            <XMLFileRenderer fileName="content/Purger/P_Title" />
            <XMLFileRenderer fileName="content/Purger/P_Content" />
            <Screenshot src="/images/Purger/PurgerScreenShot1.png" alt="Purger Screenshot 1" />
            <Screenshot src="/images/Purger/PurgerScreenShot2.png" alt="Purger Screenshot 2" />
            <Screenshot src="/images/Purger/PurgerScreenShot3.png" alt="Purger Screenshot 3" />
            <Screenshot src="/images/Purger/PurgerScreenShot4.png" alt="Purger Screenshot 4" />
        </div>
    );

}

export default Purger;