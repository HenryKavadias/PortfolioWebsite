function Screenshot({ src, alt, size = 600, padding = 10 }) {
    return (
        <img 
        src={src} 
        alt={alt} 
        className="web-link-image"
        style={{ maxWidth: `${size}px`, height: 'auto', padding: `${padding}px` }}/>
    );
}

export default Screenshot;
