import { useState, useEffect } from 'react';
import { parseXMLToReact } from '../utils/xmlParser';

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

function XMLFileRenderer({ fileName, className }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      try {
        setLoading(true);
        setError(null);

        const xmlString = await fetchXMLFile(fileName);
        const reactElements = parseXMLToReact(xmlString);

        if (isMounted) {
          setContent(reactElements);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
          console.error('Error loading XML content:', err);
        }
      }
    }

    loadContent();

    return () => {
      isMounted = false;
    };
  }, [fileName]);

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
