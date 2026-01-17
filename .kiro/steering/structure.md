# Project Structure & Organization

## Directory Structure

```
├── app/                    # Main application code (Nuxt 4 structure)
│   ├── assets/            # Static assets (CSS, icons, images)
│   ├── components/        # Vue components (atomic design pattern)
│   ├── composables/       # Vue composables (business logic)
│   ├── layouts/           # Nuxt layouts
│   ├── pages/             # Nuxt pages (file-based routing)
│   ├── plugins/           # Nuxt plugins
│   ├── services/          # Business logic services
│   ├── themes/            # PrimeVue theme configuration
│   └── utils/             # Utility functions
├── shared/                # Shared types and interfaces
│   └── types/             # TypeScript type definitions
├── public/                # Static public assets
├── docs/                  # Project documentation
└── .kiro/                 # Kiro configuration and specs
```

## Component Organization

### Naming Conventions

- **PascalCase** for components: `TheHeader.vue`, `NotificationsMenu.vue`
- **Component Prefixes**:
  - `The*` - Layout/singleton components (TheHeader, TheAside)
  - `Base*` - Reusable base components (BaseAvatar)
  - `*Form` - Form components
  - `*Menu` - Menu/dropdown components

### Component Structure (Atomic Design)

```
app/components/
├── Base*.vue              # Atoms - Basic UI elements
├── The*.vue              # Layout-level components
├── feature/              # Feature-specific components
│   ├── ComponentName.vue # Molecules/Organisms
│   └── sub-components/   # Related sub-components
└── header/               # Feature-grouped components
    ├── Notifications.vue
    └── UserMenu.vue
```

## File Naming Conventions

- **kebab-case** for directories: `home/insight/`
- **PascalCase** for TypeScript files: `NotificationService.ts`
- **camelCase** for composables: `useApi.ts`
- **PascalCase** for types/interfaces: `Notification.ts`, `User.ts`

## Service Layer Pattern

Services follow interface-first design with multiple implementations:

```
app/services/
├── NotificationService.ts    # Service interface and implementations
└── [FeatureName]Service.ts  # Other feature services
```

### Service Implementation Strategy

- **Interface definition** - TypeScript interface for service contract
- **Multiple implementations** - Mock, HTTP, and Fetch variants
- **Dependency injection** - Via Vue's provide/inject system

## Type Definitions

Centralized in `shared/types/` with descriptive naming:

- `Notification.ts` - Notification system types
- `User.ts` - User-related types
- `HttpClient.ts` - HTTP client interfaces
- `Services.ts` - Service injection types

## Asset Organization

```
app/assets/
├── css/
│   └── main.css          # Global styles and Tailwind imports
└── icons/                # SVG icons (kebab-case naming)
    ├── account_tree.svg
    └── arrow_back.svg
```

## Configuration Files

- `nuxt.config.ts` - Nuxt configuration with modules and plugins
- `tailwind.config.js` - Tailwind CSS configuration with PrimeUI plugin
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts

## Key Architectural Patterns

1. **Composition API** - Exclusive use of Vue 3's Composition API
2. **Service Layer** - Business logic abstracted into services
3. **Type Safety** - Strict TypeScript throughout
4. **Utility-First CSS** - Tailwind CSS with PrimeVue components
5. **File-Based Routing** - Nuxt's automatic routing from `pages/` directory
