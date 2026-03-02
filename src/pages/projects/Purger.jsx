import XMLFileRenderer from "../../components/XMLFileRenderer";
import Screenshot from "../../components/Screenshot";

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
            <Screenshot src="/images/Purger/PurgerScreenshot1.png" alt="Purger Screenshot 1" size={400} />
            <Screenshot src="/images/Purger/PurgerScreenshot2.png" alt="Purger Screenshot 2" size={400} />
            <Screenshot src="/images/Purger/PurgerScreenshot3.png" alt="Purger Screenshot 3" size={400} />
            <Screenshot src="/images/Purger/PurgerScreenshot4.png" alt="Purger Screenshot 4" size={400} />
        </div>
    );

}

export default Purger;