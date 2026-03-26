import { useState, useEffect, useContext, useRef } from 'react';
import { parseXMLToReact } from '../utils/xmlParser';
import { LoadingTrackerContext } from '../contexts/LoadingTrackerContext';

let xmlIdCounter = 0;

/**
 * Fetches an XML file from the public directory
 * @param {string} filepath - Path to the file without extension
 * @returns {Promise<string>} The XML content as a string
 * @throws {Error} If the file cannot be fetched
 */
async function fetchXMLFile(filepath) {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}${filepath}.xml`);
    
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
  
  // Use module-level counter to generate unique IDs without calling impure functions during render
  const resourceId = useRef(null);
  if (resourceId.current === null) {
    resourceId.current = `xml-${fileName}-${++xmlIdCounter}`;
  }

  useEffect(() => {
    let isMounted = true;
    
    // Register resource with LoadingTracker if context is available and tracking is enabled
    if (trackLoading && loadingTracker?.registerResource) {
      loadingTracker.registerResource(resourceId.current);
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
            loadingTracker.markResourceComplete(resourceId.current);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
          console.error('Error loading XML content:', err);
          
          // Mark resource as complete even on error to prevent blocking
          if (trackLoading && loadingTracker?.markResourceComplete) {
            loadingTracker.markResourceComplete(resourceId.current);
          }
        }
      }
    }

    loadContent();

    return () => {
      isMounted = false;
      
      // Mark resource as complete on unmount for cleanup
      if (trackLoading && loadingTracker?.markResourceComplete) {
        loadingTracker.markResourceComplete(resourceId.current);
      }
    };
  }, [fileName, trackLoading, loadingTracker]);

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
