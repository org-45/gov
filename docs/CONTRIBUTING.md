# Contributing to Government Structure Visualization

Thank you for your interest in contributing! This guide will help you add or update data for the visualization.

## How to Contribute Data

### Quick Start

1. Fork this repository
2. Edit the JSON file in `public/data/`
3. Validate your changes
4. Submit a Pull Request

### Data Files

All visualization data is stored as JSON files in the `public/data/` directory:

- `nepal-government.json` - Government of Nepal structure
- `schema.json` - Data schema specification

## Data Format

### Structure

Each data file must follow this structure:

```json
{
  "metadata": {
    "title": "Government Name",
    "description": "Brief description",
    "lastUpdated": "YYYY-MM-DD",
    "country": "Country Name",
    "source": "Data Source"
  },
  "nodes": [
    {
      "id": "unique-id",
      "label": "Display Name",
      "type": "executive|legislative|judicial|constitutional|ministry|provincial|local",
      "tier": 1,
      "description": "Detailed description",
      "currentHolder": "Name (optional)",
      "metadata": {
        "key": "value"
      }
    }
  ],
  "edges": [
    {
      "from": "source-node-id",
      "to": "target-node-id",
      "relationship": "relationship-type"
    }
  ]
}
```

### Node Types and Colors

Each node type has a specific color:

- `executive` - Blue (President, PM, Cabinet)
- `legislative` - Green (Parliament, Assembly)
- `judicial` - Orange (Courts)
- `constitutional` - Purple (Constitutional bodies)
- `ministry` - Cyan (Government ministries)
- `provincial` - Pink (Provincial governments)
- `local` - Teal (Local governments)

### Required Fields

#### Metadata
- `title` (string) - Name of the structure
- `description` (string) - Brief description
- `lastUpdated` (string) - Date in YYYY-MM-DD format

#### Nodes
- `id` (string) - Unique identifier (use kebab-case: "prime-minister")
- `label` (string) - Display name ("Prime Minister")
- `type` (string) - One of the node types listed above

#### Edges
- `from` (string) - Source node ID
- `to` (string) - Target node ID

### Optional Fields

#### Nodes
- `tier` (number) - Hierarchy level (1 = top level)
- `description` (string) - Detailed information
- `currentHolder` (string) - Current office holder name
- `metadata` (object) - Additional key-value pairs
  - Can include: `established`, `website`, `term`, `members`, etc.

#### Edges
- `relationship` (string) - Type of relationship ("appoints", "oversees", "elects")

## Examples

### Adding a New Node

To add a new ministry:

```json
{
  "id": "ministry-agriculture",
  "label": "Ministry of Agriculture",
  "type": "ministry",
  "tier": 4,
  "description": "Oversees agricultural development and food security",
  "metadata": {
    "website": "https://moald.gov.np",
    "established": "1951"
  }
}
```

Then connect it to the Cabinet:

```json
{
  "from": "council-of-ministers",
  "to": "ministry-agriculture",
  "relationship": "includes"
}
```

### Updating Existing Data

To update the current holder of an office:

```json
{
  "id": "president",
  "label": "President",
  "type": "executive",
  "tier": 1,
  "description": "Head of State (Ceremonial)",
  "currentHolder": "Updated Name Here",
  "metadata": {
    "established": "2008",
    "website": "https://presidentofnepal.gov.np",
    "term": "5 years"
  }
}
```

## Validation

### Before Submitting

1. **Validate JSON syntax**: Use a JSON validator or your code editor
2. **Check node IDs**: Ensure all IDs are unique and referenced correctly in edges
3. **Verify node types**: Use only the allowed types
4. **Test locally**: Run `yarn dev` and check the visualization

### Automated Validation

When you submit a Pull Request:
- JSON syntax is automatically validated
- The visualization is built to ensure no errors
- A preview deployment is created for review

## Pull Request Guidelines

### Title Format

Use clear, descriptive titles:
- "Add Ministry of Education data"
- "Update Prime Minister information"
- "Fix edge relationship for Supreme Court"

### Description

Include in your PR description:
- What changes you made
- Why the changes are needed
- Source of your information (if applicable)

### Example PR Description

```markdown
## Changes
- Added three new ministries to the government structure
- Updated the current holder for the President
- Fixed typo in Election Commission description

## Source
- Official government website: https://nepal.gov.np
- Constitution of Nepal 2015

## Checklist
- [x] JSON is valid
- [x] All node IDs are unique
- [x] Edges reference existing nodes
- [x] Tested locally
```

## Creating Visualizations for Other Structures

This framework is designed to visualize any hierarchical structure, not just governments.

### Use Cases

- Corporate organizational charts
- University department structures
- Project team hierarchies
- Family trees
- Software architecture diagrams

### Creating a New Visualization

1. Create a new JSON file in `public/data/` (e.g., `my-organization.json`)
2. Follow the same data schema
3. Customize node types if needed
4. Access your visualization at `/?data=my-organization`

### Custom Node Types

To add custom node types, you'll need to:
1. Update `src/types/index.ts` to include your new type
2. Add color configuration in `tailwind.config.js`
3. Update `src/components/CustomNode.tsx` color mapping

## Questions?

If you have questions or need help:
- Open an issue in the repository
- Check existing issues for similar questions
- Review the data schema in `public/data/schema.json`

## Code of Conduct

- Be respectful and constructive
- Provide accurate information
- Cite your sources
- Follow the data format guidelines

Thank you for contributing!
