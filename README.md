# Government Structure Visualization Framework

An interactive, open-source framework for visualizing hierarchical structures using graph networks. Currently showcasing the **Government of Nepal** structure.

## Features

- **Interactive Graph Visualization**: Zoom, pan, and explore government structures
- **Beautiful Design**: Color-coded nodes by branch/type with smooth animations
- **Detailed Information**: Click any node to see comprehensive details
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- **Framework Approach**: Easily adapt for any hierarchical structure
- **Data-Driven**: Simple JSON files power the entire visualization
- **Open Contribution**: Community can contribute via Pull Requests
- **Auto-Deployment**: Powered by Cloudflare Pages with CI/CD

## Live Demo

Visit the live visualization: `[Your Cloudflare Pages URL]`

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Visualization**: React Flow
- **Layout**: Dagre (automatic graph layout)
- **Styling**: Tailwind CSS
- **Deployment**: Cloudflare Pages
- **CI/CD**: GitHub Actions

## Quick Start

### Prerequisites

- Node.js 20+
- Yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/visualize_gov.git
cd visualize_gov

# Enable Corepack (for Yarn)
corepack enable

# Install dependencies
yarn install

# Start development server
yarn dev
```

Visit `http://localhost:5173` to see the visualization.

### Build for Production

```bash
yarn build
```

The built files will be in the `dist/` directory.

## Project Structure

```
visualize_gov/
├── public/
│   └── data/
│       ├── nepal-government.json    # Government data
│       └── schema.json              # Data schema
├── src/
│   ├── components/
│   │   ├── GraphVisualization.tsx   # Main graph component
│   │   ├── CustomNode.tsx           # Node renderer
│   │   └── NodeDetails.tsx          # Details panel
│   ├── lib/
│   │   ├── dataLoader.ts            # Data loading
│   │   ├── graphBuilder.ts          # Graph transformation
│   │   └── layoutEngine.ts          # Auto-layout
│   ├── types/
│   │   └── index.ts                 # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── docs/
│   └── CONTRIBUTING.md              # Contribution guide
└── .github/
    └── workflows/
        └── deploy.yml               # CI/CD pipeline
```

## How It Works

### Data Structure

All visualizations are powered by JSON files in `public/data/`. Each file contains:

1. **Metadata**: Title, description, last updated
2. **Nodes**: Government bodies, offices, or entities
3. **Edges**: Relationships between nodes

Example:

```json
{
  "metadata": {
    "title": "Government of Nepal",
    "description": "Federal Democratic Republic of Nepal",
    "lastUpdated": "2025-12-27"
  },
  "nodes": [
    {
      "id": "president",
      "label": "President",
      "type": "executive",
      "description": "Head of State"
    }
  ],
  "edges": [
    {
      "from": "president",
      "to": "prime-minister",
      "relationship": "appoints"
    }
  ]
}
```

### Node Types

Each node type has a specific color:

- **Executive** (Blue): President, Prime Minister, Cabinet
- **Legislative** (Green): Parliament, Assemblies
- **Judicial** (Orange): Courts
- **Constitutional** (Purple): Constitutional bodies
- **Ministry** (Cyan): Government ministries
- **Provincial** (Pink): Provincial governments
- **Local** (Teal): Local governments

## Contributing Data

We welcome contributions! See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

### Quick Guide

1. Fork this repository
2. Edit `public/data/nepal-government.json`
3. Test your changes locally with `yarn dev`
4. Submit a Pull Request

Your PR will automatically:
- Validate JSON syntax
- Build the visualization
- Create a preview deployment
- Deploy to production when merged

## Using for Other Visualizations

This framework is designed to be generic. You can visualize:

- Corporate org charts
- University structures
- Project hierarchies
- Software architectures
- Any hierarchical data

### Creating a New Visualization

1. Create a new JSON file in `public/data/` (e.g., `my-org.json`)
2. Follow the data schema in `public/data/schema.json`
3. Access it at `/?data=my-org`

## Deployment

### Cloudflare Pages Setup

1. Push your repository to GitHub

2. Create a Cloudflare Pages project:
   - Connect your GitHub repository
   - Build command: `yarn build`
   - Build output directory: `dist`

3. Add GitHub secrets (for CI/CD):
   - `CLOUDFLARE_API_TOKEN`: Get from Cloudflare Dashboard → API Tokens
   - `CLOUDFLARE_ACCOUNT_ID`: Get from Cloudflare Dashboard → Workers & Pages

4. Deploy!
   - Push to `main` branch → Production deployment
   - Create PR → Preview deployment

## Architecture

### Component Hierarchy

```
App
└── GraphVisualization
    ├── ReactFlow (React Flow library)
    │   ├── CustomNode (×N)
    │   ├── Background
    │   ├── Controls
    │   └── MiniMap
    └── NodeDetails (side panel)
```

### Data Flow

```
JSON File
  → dataLoader.ts (load & validate)
  → graphBuilder.ts (transform to React Flow format)
  → layoutEngine.ts (apply dagre layout)
  → GraphVisualization (render)
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized for graphs with 100+ nodes
- Viewport-based rendering (only visible nodes rendered)
- Smooth animations with 60fps
- Fast initial load (<2s)

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [React Flow](https://reactflow.dev/)
- Government data sourced from official Government of Nepal websites
- Layout powered by [Dagre](https://github.com/dagrejs/dagre)

## Roadmap

- [ ] Search functionality
- [ ] Filter by node type
- [ ] Export as image/PDF
- [ ] Multiple layout algorithms
- [ ] Dark mode
- [ ] Historical timeline view
- [ ] Comparison view (compare different structures)

## Support

- Open an [issue](https://github.com/your-username/visualize_gov/issues)
- Read the [Contributing Guide](docs/CONTRIBUTING.md)
- Check the [Data Schema](public/data/schema.json)

## About

This project aims to make government structures transparent and easy to understand through interactive visualization. It's built as an open framework so anyone can create similar visualizations for their own use cases.

Made with ❤️ for transparency and civic engagement.
