import { useState, useEffect, useContext, useRef } from 'react';
import { parseXMLToReact } from '../utils/xmlParser';
import { LoadingTrackerContext } from '../contexts/LoadingTrackerContext';

/**
 * Fetches an XML file from the public directory
 * @param {string} filepath - Path to the file without extension
 * @returns {Promise<string>} The XML content as a string
 * @throws {Error} If the file cannot be fetched
 */
async function fetchXMLFile(filepath) {
  try {
    const response = await fetch(`/${filepath}.xml`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filepath}.xml: ${response.status} ${response.statusText}`);
    }
    
    const xmlString = await response.text();
    return xmlString;
  } catch (error) {
    throw new Error(`Error loading XML file: ${error.message}`);
  }
}

function XMLFileRenderer({ fileName, className, trackLoading = true }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Access LoadingTrackerContext (may be undefined if not within PageLoader)
  const loadingTracker = useContext(LoadingTrackerContext);
  
  // Generate stable resource ID using useRef
  const resourceId = useRef(`xml-${fileName}-${Math.random()}`).current;

  useEffect(() => {
    let isMounted = true;
    
    // Register resource with LoadingTracker if context is available and tracking is enabled
    if (trackLoading && loadingTracker?.registerResource) {
      loadingTracker.registerResource(resourceId);
    }

    async function loadContent() {
      try {
        setLoading(true);
        setError(null);

        const xmlString = await fetchXMLFile(fileName);
        const reactElements = parseXMLToReact(xmlString);

        if (isMounted) {
          setContent(reactElements);
          setLoading(false);
          
          // Mark resource as complete after successful load
          if (trackLoading && loadingTracker?.markResourceComplete) {
            loadingTracker.markResourceComplete(resourceId);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
          console.error('Error loading XML content:', err);
          
          // Mark resource as complete even on error to prevent blocking
          if (trackLoading && loadingTracker?.markResourceComplete) {
            loadingTracker.markResourceComplete(resourceId);
          }
        }
      }
    }

    loadContent();

    return () => {
      isMounted = false;
      
      // Mark resource as complete on unmount for cleanup
      if (trackLoading && loadingTracker?.markResourceComplete) {
        loadingTracker.markResourceComplete(resourceId);
      }
    };
  }, [fileName, trackLoading, loadingTracker, resourceId]);

  // Render logic based on state
  if (loading) {
    return <div className={className}>Loading...</div>;
  }

  if (error) {
    return <div className={className}>Error loading content</div>;
  }

  if (content) {
    return <div className={className}>{content}</div>;
  }

  return null;
}


export default XMLFileRenderer;
