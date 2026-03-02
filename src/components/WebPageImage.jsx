import { useContext, useEffect, useRef, useState } from 'react';
import { LoadingTrackerContext } from '../contexts/LoadingTrackerContext';

function WebPageImage({ src, alt, size = 600, padding = 10, trackLoading = true, fixedSize = false }) {
    const context = useContext(LoadingTrackerContext);
    const resourceId = useRef(`img-${src}-${Math.random()}`).current;
    const [imageLoaded, setImageLoaded] = useState(false);
    const imageLoadedRef = useRef(false);

    useEffect(() => {
        // Register this image with the page loader if context is available
        if (trackLoading && context) {
            context.registerResource(resourceId);
        }

        return () => {
            // Cleanup: ensure resource is marked complete on unmount
            // Use ref to get the current value, not the closure value
            if (trackLoading && context && !imageLoadedRef.current) {
                context.markResourceComplete(resourceId);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trackLoading, context, resourceId]);

    const handleLoad = () => {
        setImageLoaded(true);
        imageLoadedRef.current = true;
        if (trackLoading && context) {
            context.markResourceComplete(resourceId);
        }
    };

    const handleError = () => {
        setImageLoaded(true);
        imageLoadedRef.current = true;
        // Mark as complete even on error to unblock page
        if (trackLoading && context) {
            context.markResourceComplete(resourceId);
        }
    };

    const imageStyle = fixedSize 
        ? { width: `${size}px`, height: `${size}px`, padding: `${padding}px` }
        : { maxWidth: `${size}px`, height: 'auto', padding: `${padding}px` };

    return (
        <img 
            src={src} 
            alt={alt} 
            className="web-link-image"
            style={imageStyle}
            onLoad={handleLoad}
            onError={handleError}
        />
    );
}

export default WebPageImage;
