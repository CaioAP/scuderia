# Technology Stack & Build System

## Core Framework

- **Nuxt.js 4.2.2** - Full-stack Vue framework with SSR/SSG capabilities
- **Vue 3.5.25** - Progressive JavaScript framework with Composition API
- **TypeScript** - Strict typing throughout the codebase
- **Vue Router 4.6.4** - Client-side routing

## UI Framework & Styling

- **PrimeVue 4.5.3** - Primary UI component library
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **TailwindCSS PrimeUI** - Integration between Tailwind and PrimeVue
- **PrimeIcons 7.0.0** - Icon system
- **Custom Indigo Theme** - Built on PrimeVue's theming system

## Key Libraries

- **Axios 1.13.2** - HTTP client for API communication
- **Zod 4.2.1** - TypeScript-first schema validation
- **Quill 2.0.3** - Rich text editor
- **Nuxt Icons 4.0.0** - Icon management
- **Nuxt Image 2.0.0** - Image optimization

## Package Manager

- **pnpm** - Primary package manager (evidenced by pnpm-lock.yaml and pnpm-workspace.yaml)

## Common Commands

### Development

```bash
# Install dependencies
pnpm install

# Start development server (http://localhost:3000)
pnpm dev

# Type checking
nuxt typecheck
```

### Build & Deploy

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Generate static site
pnpm generate

# Prepare Nuxt (run after dependency changes)
pnpm postinstall
```

### Development Notes

- Uses Nuxt 4's new directory structure with `app/` folder
- Vite-based build system with Tailwind CSS plugin
- Auto-imports enabled for composables and services
- TypeScript strict mode enabled
