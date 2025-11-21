import { withPluginApi } from "discourse/lib/plugin-api";

function isUrl(text) {
  if (!text || typeof text !== "string") return false;
  return /^(https?:\/\/|www\.)/i.test(text.trim());
}

function isAlreadyHtml(text) {
  if (!text || typeof text !== "string") return false;
  return /<a\s+[^>]*href=/i.test(text);
}

function processUserFieldLinks(container) {
  const openInNewTab = container.lookup("service:site-settings").open_links_in_new_tab;

  // Find all user field value containers
  const fieldElements = container.querySelectorAll(".user-field-value, .public-user-field");

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
      if (openInNewTab) {
        link.target = "_blank";
      }

      fieldElement.innerHTML = "";
      fieldElement.appendChild(link);
    }
  });
}

export default {
  name: "custom-field-link-renderer",

  initialize(container) {
    withPluginApi("0.8.31", (api) => {
      // Process links after user card is shown
      api.decorateWidget("user-card-contents:after", (helper) => {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          const userCard = document.querySelector(".user-card");
          if (userCard) {
            processUserFieldLinks(userCard);
          }
        }, 100);
      });

      // Process links on user profile page
      api.decorateWidget("user-profile-primary:after", (helper) => {
        setTimeout(() => {
          const profileArea = document.querySelector(".user-main");
          if (profileArea) {
            processUserFieldLinks(profileArea);
          }
        }, 100);
      });

      // Also use MutationObserver to catch any dynamically added user fields
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // Check if the node itself or its children contain user fields
              if (node.classList?.contains("user-field-value") ||
                  node.classList?.contains("public-user-field") ||
                  node.querySelector?.(".user-field-value, .public-user-field")) {
                processUserFieldLinks(node.closest(".user-card, .user-main") || document);
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }
};
