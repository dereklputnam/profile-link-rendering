import { withPluginApi } from "discourse/lib/plugin-api";

function isUrl(text) {
  if (!text || typeof text !== "string") return false;
  return /^(https?:\/\/|www\.)/i.test(text.trim());
}

function isAlreadyHtml(text) {
  if (!text || typeof text !== "string") return false;
  return /<a\s+[^>]*href=/i.test(text);
}

function getSettings() {
  const siteSettings = window.Discourse?.SiteSettings || {};
  return {
    openInNewTab: siteSettings.open_links_in_new_tab !== false
  };
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

    const textContent = fieldElement.textContent?.trim();
    if (!textContent) return;

    // If it's already HTML with links, render as-is
    if (isAlreadyHtml(textContent)) {
      fieldElement.innerHTML = textContent;
      return;
    }

    // If it looks like a URL, create a clickable link
    if (isUrl(textContent)) {
      let href = textContent;
      let displayText = textContent;

      // Add protocol if missing
      if (!/^https?:\/\//i.test(href)) {
        href = `https://${href}`;
      }

      // Clean up display text
      displayText = displayText.replace(/^https?:\/\//, "").replace(/^www\./, "");

      const link = document.createElement("a");
      link.href = href;
      link.textContent = displayText;
      link.rel = "noopener noreferrer";
      if (settings.openInNewTab) {
        link.target = "_blank";
      }

      fieldElement.innerHTML = "";
      fieldElement.appendChild(link);
    }
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
