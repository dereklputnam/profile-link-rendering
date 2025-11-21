/**
 * Custom User Field Link Renderer
 *
 * Automatically converts URLs in custom user fields to clickable links.
 * Supports multiple formats: plain URLs, markdown links, and HTML anchor tags.
 */

import { withPluginApi } from "discourse/lib/plugin-api";

// Check if text starts with a URL
function isUrl(text) {
  if (!text || typeof text !== "string") return false;
  return /^(https?:\/\/|www\.)/i.test(text.trim());
}

// Check if text contains HTML anchor tags
function isAlreadyHtml(text) {
  if (!text || typeof text !== "string") return false;
  return /<a\s+[^>]*href=/i.test(text);
}

// Get theme settings
function getSettings() {
  const siteSettings = window.Discourse?.SiteSettings || {};
  return {
    openInNewTab: siteSettings.open_links_in_new_tab !== false
  };
}

// Extract URLs from text nodes and replace them with clickable links
function extractAndReplaceUrls(element, settings) {
  // Get all text nodes within the element
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }

  // Process each text node
  textNodes.forEach((textNode) => {
    const text = textNode.textContent;

    // Check if it's already HTML
    if (isAlreadyHtml(text)) {
      const temp = document.createElement('div');
      temp.innerHTML = text;
      textNode.replaceWith(temp.firstChild);
      return;
    }

    // Look for markdown-style links: [Text](URL)
    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const markdownMatches = [...text.matchAll(markdownLinkRegex)];

    // If we found markdown-style links, process them
    if (markdownMatches.length > 0) {
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;

      markdownMatches.forEach((match) => {
        const fullMatch = match[0];
        const linkText = match[1];
        const url = match[2];

        // Add text before the link
        if (match.index > lastIndex) {
          fragment.appendChild(
            document.createTextNode(text.substring(lastIndex, match.index))
          );
        }

        // Create the link with custom text
        const link = document.createElement("a");
        link.href = url;
        link.textContent = linkText;
        link.rel = "noopener noreferrer";
        if (settings.openInNewTab) {
          link.target = "_blank";
        }
        fragment.appendChild(link);

        lastIndex = match.index + fullMatch.length;
      });

      // Add remaining text
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
      }

      textNode.replaceWith(fragment);
      return;
    }

    // Look for plain URLs in the text (including those in parentheses)
    const urlRegex = /(\(?)((https?:\/\/[^\s)]+)|((www\.)[^\s)]+))(\)?)/gi;
    const matches = [...text.matchAll(urlRegex)];

    if (matches.length > 0) {
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;

      matches.forEach((match) => {
        const fullMatch = match[0];
        const url = match[2] || match[3];
        const startParen = match[1] || '';
        const endParen = match[6] || '';

        // Add text before the URL
        if (match.index > lastIndex) {
          fragment.appendChild(
            document.createTextNode(text.substring(lastIndex, match.index))
          );
        }

        // Add opening parenthesis if present
        if (startParen) {
          fragment.appendChild(document.createTextNode(startParen));
        }

        // Create the link
        let href = url;
        if (!/^https?:\/\//i.test(href)) {
          href = `https://${href}`;
        }

        const displayText = url.replace(/^https?:\/\//, "").replace(/^www\./, "");

        const link = document.createElement("a");
        link.href = href;
        link.textContent = displayText;
        link.rel = "noopener noreferrer";
        if (settings.openInNewTab) {
          link.target = "_blank";
        }
        fragment.appendChild(link);

        // Add closing parenthesis if present
        if (endParen) {
          fragment.appendChild(document.createTextNode(endParen));
        }

        lastIndex = match.index + fullMatch.length;
      });

      // Add remaining text
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
      }

      textNode.replaceWith(fragment);
    }
  });
}

function unescapeHtml(text) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = text;
  return tempDiv.textContent || tempDiv.innerText || '';
}

function processUserFieldLinks() {
  const settings = getSettings();

  // Find all user field value containers - try multiple selectors
  const fieldElements = document.querySelectorAll(
    ".user-field-value, .public-user-field, .user-profile-fields .value, .user-card-additional-controls .user-field"
  );

  fieldElements.forEach((fieldElement) => {
    // Skip if already processed
    if (fieldElement.dataset.linkProcessed) return;
    fieldElement.dataset.linkProcessed = "true";

    const innerHTML = fieldElement.innerHTML;
    const textContent = fieldElement.textContent?.trim();

    if (!textContent) return;

    // Check if innerHTML contains escaped HTML entities (&lt;a becomes <a)
    if (innerHTML.includes('&lt;a') || innerHTML.includes('&lt;A')) {
      const unescaped = unescapeHtml(innerHTML);
      if (isAlreadyHtml(unescaped)) {
        fieldElement.innerHTML = unescaped;
        return;
      }
    }

    // Check if the text content contains HTML anchor tags (not escaped)
    if (isAlreadyHtml(textContent)) {
      fieldElement.innerHTML = textContent;
      return;
    }

    // Otherwise, extract and replace URLs within the element
    extractAndReplaceUrls(fieldElement, settings);
  });
}

export default {
  name: "custom-field-link-renderer",

  initialize() {
    withPluginApi("0.8.31", (api) => {
      // Process fields when the DOM is ready
      api.onPageChange(() => {
        // Small delay to ensure DOM is fully rendered
        setTimeout(() => {
          processUserFieldLinks();
        }, 100);
      });

      // Use MutationObserver to catch dynamically added user fields
      const observer = new MutationObserver(() => {
        processUserFieldLinks();
      });

      // Start observing after a short delay to let the page initialize
      setTimeout(() => {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }, 500);
    });
  }
};
