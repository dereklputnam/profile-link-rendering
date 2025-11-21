# User Field Link Rendering

A Discourse theme component that automatically renders URLs in custom user fields as clickable links on user cards and profile pages.

## Features

- **Zero configuration** - works automatically on all custom user fields
- **Multiple link formats supported**:
  - Plain URLs: `https://example.com`
  - URLs with www: `www.example.com`
  - Markdown-style links: `[Link Text](https://example.com)`
  - HTML anchor tags (escaped or raw): `<a href="...">Text</a>`
- Clean URL display (removes protocol/www prefix for plain URLs)
- Works on user cards and profile pages
- Configurable new tab behavior

## Installation

1. Go to your Discourse admin panel
2. Navigate to **Customize** > **Themes**
3. Click **Install** > **From a git repository**
4. Enter the repository URL: `https://github.com/dereklputnam/profile-link-rendering`
5. Click **Install**

## Configuration

The component works automatically with no configuration needed. The only setting available is:

- **open_links_in_new_tab**: Whether to open links in a new tab (default: true)

## Supported Formats

### Plain URLs

```
Field Value: https://linkedin.com/in/username
Result: Clickable link displaying "linkedin.com/in/username"
```

### Markdown-Style Links

Perfect for custom text with URLs:

```
Field Value: [View Profile](https://example.com/profile)
Result: Clickable link displaying "View Profile"
```

### HTML Anchor Tags

If your automation tool outputs HTML (like Salesforce, Zapier, etc.):

```
Field Value: <a href="https://example.com">Company Name</a>
Result: Clickable link displaying "Company Name"
```

### URLs in Parentheses

```
Field Value: (https://example.com)
Result: Clickable link with parentheses preserved
```

## How It Works

The component automatically:
1. Monitors all custom user field displays on user cards and profile pages
2. Detects various URL formats (plain URLs, markdown links, HTML tags)
3. Converts them to properly formatted, clickable HTML links
4. Preserves surrounding text and formatting

## Use Cases

- **CRM Integration**: Display Salesforce, HubSpot, or other CRM links with custom text
- **Social Media Profiles**: Make LinkedIn, Twitter, GitHub profiles clickable
- **Company Information**: Link to company websites or internal resources
- **Documentation**: Link to external documentation or support pages

## Compatibility

- **Minimum Discourse Version**: 2.8.0
- Works with other theme components like [discourse-hidden-user-fields](https://github.com/dereklputnam/discourse-hidden-user-fields) for combined visibility control and link rendering

## License

MIT License - see [LICENSE](https://opensource.org/licenses/MIT)

## Contributing

Issues and pull requests are welcome! Please report bugs or suggest features at the [GitHub repository](https://github.com/dereklputnam/profile-link-rendering/issues).

## Credits

Created by Derek Putnam for the Discourse community.
