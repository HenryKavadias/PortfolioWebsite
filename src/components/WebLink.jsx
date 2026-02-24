import { Link } from 'react-router-dom';

function WebLink({ link, text, img }) {

    if (img) {
        return (
            <Link to={link} className="web-link">
                <img src={img} alt={text} className="web-link-image" />
                {text}
            </Link>
        )
    }

    return (
        <Link to={link} className="web-link">
            {text}
        </Link>
    )
}

export default WebLink;