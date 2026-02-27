import { Link } from 'react-router-dom';

function validateProps(link, text, img) {
    if (!link || link === '') {
        throw new Error("WebLink requires a 'link' prop");
    }

    const hasText = text && text !== '';
    const hasImg = img && img !== '';

    if (!hasText && !hasImg) {
        throw new Error("WebLink requires either 'text' or 'img' prop");
    }
}

function isExternalLink(link) {
    return link.startsWith('http://') || 
           link.startsWith('https://') || 
           link.startsWith('//');
}

function renderContent(text, img, imageSize, fontSize) {
    if (img && text) {
        // Both image and text - image on top, text underneath
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img 
                    src={img} 
                    alt={text} 
                    className="web-link-image"
                    style={{ width: `${imageSize}px`, height: `${imageSize}px` }}
                />
                <span style={{ fontSize: `${fontSize}px`, marginTop: '8px' }}>{text}</span>
            </div>
        );
    }

    if (img) {
        // Image only - empty alt text
        return (
            <img 
                src={img} 
                alt="" 
                className="web-link-image"
                style={{ width: `${imageSize}px`, height: `${imageSize}px` }}
            />
        );
    }

    // Text only
    return <span style={{ fontSize: `${fontSize}px` }}>{text}</span>;
}

function WebLink({ link, text, img, imageSize = 200, fontSize = 24 }) {
    validateProps(link, text, img);

    const content = renderContent(text, img, imageSize, fontSize);
    const isExternal = isExternalLink(link);

    if (isExternal) {
        return (
            <a
                href={link}
                className="web-link"
                target="_blank"
                rel="noopener noreferrer"
            >
                {content}
            </a>
        );
    }

    return (
        <Link to={link} className="web-link">
            {content}
        </Link>
    );
}


export default WebLink;