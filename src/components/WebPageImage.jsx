import { useContext, useEffect, useRef } from 'react';
import { LoadingTrackerContext } from '../contexts/LoadingTrackerContext';

let imageIdCounter = 0;

function WebPageImage({ src, alt, size = 800, padding = 10, trackLoading = true, fixedSize = false }) {
    const context = useContext(LoadingTrackerContext);
    // Use module-level counter to generate unique IDs without calling impure functions during render
    const resourceId = useRef(null);
    if (!resourceId.current) {
        resourceId.current = `img-${src}-${++imageIdCounter}`;
    }
    const imageLoadedRef = useRef(false);

    useEffect(() => {
        // Register this image with the page loader if context is available
        if (trackLoading && context) {
            context.registerResource(resourceId.current);
        }

        return () => {
            // Cleanup: ensure resource is marked complete on unmount
            // Use ref to get the current value, not the closure value
            if (trackLoading && context && !imageLoadedRef.current) {
                context.markResourceComplete(resourceId.current);
            }
        };
    }, [trackLoading, context]);

    const handleLoad = () => {
        imageLoadedRef.current = true;
        if (trackLoading && context) {
            context.markResourceComplete(resourceId.current);
        }
    };

    const handleError = () => {
        imageLoadedRef.current = true;
        // Mark as complete even on error to unblock page
        if (trackLoading && context) {
            context.markResourceComplete(resourceId.current);
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
