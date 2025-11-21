# Custom User Field Link Renderer

A Discourse theme component that automatically renders URLs in custom user fields as clickable links on user cards and profile pages.

## Features

- Automatically detects and converts URLs in custom user fields to clickable links
- Uses Discourse's markdown rendering for consistent styling
- Supports both plain URLs and pre-formatted HTML anchor tags
- Configurable per-field with custom labels
- Choose whether to display on user cards, profiles, or both
- Open links in new tabs (configurable)

## Installation

1. Go to your Discourse admin panel
2. Navigate to **Customize** > **Themes**
3. Click **Install** > **From a git repository**
4. Enter the repository URL: `https://github.com/dereklputnam/profile-link-rendering`
5. Click **Install**

## Configuration

After installation, go to the theme component's settings:

### Field Link Rules

Add rules for each custom user field you want to render as a link:

```yaml
field_name: LinkedIn
link_type: auto
custom_label: LinkedIn Profile
open_in_new_tab: true
```

**Settings:**

- **field_name** (required): The name of your custom user field (case-insensitive)
- **link_type**: How to render the link
  - `auto`: Automatically detect and render URLs (default)
  - `url`: Treat field value as a URL
  - `custom_html`: Field already contains HTML anchor tags
- **custom_label** (optional): Display a custom label instead of the field name
- **open_in_new_tab**: Whether to open links in a new tab (default: true)

### Display Options

- **show_on_user_card**: Show links on user cards (hover popups) - default: true
- **show_on_user_profile**: Show links on user profile pages - default: true

## Example Use Cases

### Social Media Links

If you have custom fields for LinkedIn, Twitter, GitHub, etc., this component will automatically make them clickable:

```
Field Name: LinkedIn
Field Value: https://linkedin.com/in/username
Result: Clickable link "linkedin.com/in/username"
```

### Company Websites

```
Field Name: Company Website
Field Value: https://www.example.com
Result: Clickable link "www.example.com"
```

### Pre-formatted HTML

If your field already contains HTML (e.g., from automation):

```
Field Value: <a href="https://example.com">View Profile</a>
Result: Renders the HTML as-is
```

## How It Works

1. The component scans configured custom user fields
2. Detects URLs using pattern matching (http://, https://, www.)
3. Converts URLs to markdown links
4. Renders using Discourse's markdown engine for consistency
5. Displays on user cards and/or profiles based on settings

## Compatibility

- **Minimum Discourse Version**: 2.8.0
- Works with the [discourse-hidden-user-fields](https://github.com/dereklputnam/discourse-hidden-user-fields) component for combined visibility control and link rendering

## License

MIT License - see [LICENSE](https://opensource.org/licenses/MIT)

## Contributing

Issues and pull requests are welcome! Please report bugs or suggest features at the [GitHub repository](https://github.com/dereklputnam/profile-link-rendering/issues).

## Credits

Created by Derek Putnam for the Discourse community.
