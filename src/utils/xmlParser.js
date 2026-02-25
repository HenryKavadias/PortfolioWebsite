import React from 'react';

/**
 * Parses an XML string and converts it to an array of React elements.
 * 
 * @param {string} xmlString - The XML content to parse
 * @returns {Array<React.ReactElement>} Array of React elements, or empty array on error
 */
export function parseXMLToReact(xmlString) {
  // Parse XML string to DOM using DOMParser
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  
  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    console.error('XML parsing error:', parserError.textContent);
    return [];
  }
  
  // Get root element
  const root = xmlDoc.documentElement;
  
  // Convert root children to React elements
  const reactElements = [];
  const children = root.childNodes;
  
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    const element = convertNodeToReact(node, i);
    
    if (element !== null) {
      reactElements.push(element);
    }
  }
  
  return reactElements;
}

/**
 * Converts an XML DOM node to a React element recursively.
 *
 * @param {Node} node - The XML DOM node to convert
 * @param {number} index - The index for React key
 * @returns {React.ReactElement|string|null} React element, text string, or null
 */
function convertNodeToReact(node, index) {
  // Handle text nodes
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    // Only filter out whitespace-only text nodes
    if (text.trim().length === 0) {
      return null;
    }
    return text;
  }

  // Handle element nodes
  if (node.nodeType === Node.ELEMENT_NODE) {
    const tagName = node.tagName.toLowerCase();
    const attributes = extractAttributes(node);

    // Recursively convert children
    const children = [];
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = convertNodeToReact(node.childNodes[i], i);
      if (child !== null) {
        children.push(child);
      }
    }

    // Map XML tag to React component
    const reactElement = mapTagToComponent(tagName, attributes, children, index);
    return reactElement;
  }

  // Ignore other node types (comments, processing instructions, etc.)
  return null;
}

/**
 * Extracts attributes from an XML node and converts them to React props format.
 *
 * @param {Element} node - The XML element node
 * @returns {Object} Object containing attributes as key-value pairs
 */
function extractAttributes(node) {
  const attributes = {};

  if (node.attributes) {
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      attributes[attr.name] = attr.value;
    }
  }

  return attributes;
}

/**
 * Maps an XML tag name to the appropriate React component.
 *
 * @param {string} tagName - The XML tag name (lowercase)
 * @param {Object} attributes - The element attributes
 * @param {Array} children - The child elements
 * @param {number} key - The React key for the element
 * @returns {React.ReactElement} The corresponding React element
 */
function mapTagToComponent(tagName, attributes, children, key) {
  const props = { key, ...attributes };

  switch (tagName) {
    case 'paragraph':
    case 'p':
      return React.createElement('p', props, ...children);

    case 'bold':
    case 'b':
      return React.createElement('strong', props, ...children);

    case 'italic':
    case 'i':
      return React.createElement('em', props, ...children);

    case 'break':
    case 'br':
      return React.createElement('br', props);

    case 'heading':
      const level = attributes.level || 2;
      const headingTag = `h${level}`;
      return React.createElement(headingTag, props, ...children);

    case 'list':
      const listTag = attributes.type === 'ordered' ? 'ol' : 'ul';
      return React.createElement(listTag, props, ...children);

    case 'item':
      return React.createElement('li', props, ...children);

    case 'link':
      return React.createElement('a', { ...props, href: attributes.href }, ...children);

    default:
      // Fallback for unsupported tags
      return React.createElement('span', props, ...children);
  }
}

