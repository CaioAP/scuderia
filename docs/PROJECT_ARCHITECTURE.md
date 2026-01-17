# Cilia Scuderia - Project Architecture Documentation

## Overview

Cilia Scuderia is a modern web application built with **Nuxt.js 4** and **Vue 3**, designed as an employee engagement and communication platform. The application follows a component-based architecture with a focus on modularity, type safety, and modern development practices.

## Technology Stack

### Core Framework

- **Nuxt.js 4.2.2** - Full-stack Vue framework with SSR/SSG capabilities
- **Vue 3.5.25** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe JavaScript with strong typing throughout the codebase
- **Vue Router 4.6.4** - Official router for Vue.js applications

### UI Framework & Styling

- **PrimeVue 4.5.3** - Comprehensive Vue UI component library
- **PrimeIcons 7.0.0** - Icon library for PrimeVue components
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **TailwindCSS PrimeUI** - Integration between Tailwind and PrimeVue
- **Custom Theme System** - Built on PrimeVue's theming with Indigo color palette

### Development Tools & Libraries

- **Axios 1.13.2** - HTTP client for API communication
- **Zod 4.2.1** - TypeScript-first schema validation
- **Quill 2.0.3** - Rich text editor
- **Nuxt Icons 4.0.0** - Icon management system
- **Nuxt SVGO 4.2.6** - SVG optimization
- **Nuxt Fonts 0.12.1** - Font optimization and loading
- **Nuxt Image 2.0.0** - Image optimization and processing

## Architecture Patterns

### 1. Layered Architecture

The application follows a clean layered architecture:

```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│     (Components, Pages, Layouts)    │
├─────────────────────────────────────┤
│           Business Layer            │
│      (Composables, Services)        │
├─────────────────────────────────────┤
│            Data Layer               │
│    (API Clients, HTTP Services)     │
├─────────────────────────────────────┤
│          Infrastructure             │
│     (Types, Utils, Plugins)         │
└─────────────────────────────────────┘
```

### 2. Component Architecture

#### Atomic Design Principles

The component structure follows atomic design methodology:

- **Atoms**: `BaseAvatar.vue` - Basic UI elements
- **Molecules**: `NotificationsButton.vue`, `UserMenu.vue` - Simple component combinations
- **Organisms**: `TheHeader.vue`, `Notifications.vue` - Complex UI sections
- **Templates**: Layout components in `/layouts`
- **Pages**: Route-level components in `/pages`

#### Component Organization

```
app/components/
├── Base*.vue           # Reusable base components
├── The*.vue           # Layout-level components
├── feature/           # Feature-specific components
│   ├── ComponentName.vue
│   └── sub-components/
└── shared/            # Cross-feature components
```

### 3. Service Layer Pattern

The application implements a robust service layer with multiple implementation strategies:

#### Service Interface Pattern

```typescript
export interface NotificationService {
	getMostRecent(): Promise<Notification[]>;
	markAllRead(): Promise<void>;
	markRead(id: number): Promise<void>;
}
```

#### Multiple Implementation Strategy

- **NotificationServiceFetch**: Production implementation using Nuxt's `$fetch`
- **NotificationServiceHttp**: Generic HTTP client implementation
- **NotificationServiceMock**: Development/testing implementation with mock data

This pattern enables:

- Easy testing with mock implementations
- Flexible deployment configurations
- Clean separation of concerns
- Dependency injection capabilities

### 4. Dependency Injection Pattern

Services are injected using Vue's provide/inject mechanism:

```typescript
// In plugins/services.ts
const services = inject<Services>('services');
```

This allows for:

- Loose coupling between components and services
- Easy service swapping for different environments
- Better testability

## File Structure & Organization

### Directory Structure

```
├── app/                    # Application source code
│   ├── assets/            # Static assets (CSS, icons, images)
│   ├── components/        # Vue components (atomic design)
│   ├── composables/       # Vue composables (business logic)
│   ├── layouts/           # Nuxt layouts
│   ├── pages/             # Nuxt pages (routes)
│   ├── plugins/           # Nuxt plugins
│   ├── services/          # Business logic services
│   ├── themes/            # PrimeVue theme configuration
│   └── utils/             # Utility functions
├── shared/                # Shared types and interfaces
│   └── types/             # TypeScript type definitions
├── public/                # Static public assets
└── config files           # Configuration files
```

### Naming Conventions

#### Components

- **PascalCase** for component names: `TheHeader.vue`, `NotificationsMenu.vue`
- **Prefixes for component types**:
  - `The*` - Layout/singleton components
  - `Base*` - Reusable base components
  - `*Form` - Form components
  - `*Menu` - Menu/dropdown components

#### Files & Directories

- **kebab-case** for directories: `home/insight/`
- **PascalCase** for TypeScript files: `NotificationService.ts`
- **camelCase** for utility files: `useApi.ts`

#### Types & Interfaces

- **PascalCase** for interfaces: `Notification`, `User`, `HttpClient`
- **Descriptive naming**: `HomeCardBirthdays`, `NotificationService`

## Design Patterns

### 1. Composition API Pattern

The application exclusively uses Vue 3's Composition API:

```typescript
<script setup lang="ts">
// Reactive state
const notifications: Ref<MenuItem[]> = ref([]);

// Computed properties
const notificationsUnread = computed(() => {
  // Logic here
});

// Methods
const toggleNotificationsMenu = (event: PointerEvent) => {
  // Logic here
};
</script>
```

Benefits:

- Better TypeScript integration
- More flexible code organization
- Easier logic reuse through composables
- Better tree-shaking

### 2. Composables Pattern

Business logic is extracted into reusable composables:

```typescript
// useApi.ts - HTTP client composable
export const useApi = (): typeof $fetch => {
	const config = useRuntimeConfig();
	return $fetch.create({
		baseURL: config.public.apiBase,
		// Configuration...
	});
};
```

### 3. Provider Pattern

Configuration and services are provided at the application level:

```typescript
// In nuxt.config.ts
runtimeConfig: {
  public: {
    apiBase: '',
  },
}
```

### 4. Strategy Pattern

Multiple service implementations allow for different strategies:

- Development: Mock services with static data
- Testing: Controlled mock responses
- Production: Real API integration

## Type Safety & Data Modeling

### Strong Typing Strategy

The application maintains strict TypeScript typing:

```typescript
// Shared type definitions
export interface Notification {
	id: number;
	read: boolean;
	initials: string;
	name: string;
	label: string;
	avatar: string | null;
	createdAt: Date;
	loading?: boolean;
}
```

### Generic HTTP Client Interface

```typescript
export interface HttpClient {
	baseURL: string;
	get<T>(endpoint: string): Promise<T>;
	post<T, D>(endpoint: string, body: D): Promise<T>;
	patch<T, D>(endpoint: string, body: D): Promise<T>;
	put<T, D>(endpoint: string, body: D): Promise<T>;
	delete<T>(endpoint: string): Promise<T>;
}
```

This provides:

- Type-safe API calls
- Consistent error handling
- Easy mocking for tests
- Clear contracts between layers

## Styling Architecture

### Utility-First Approach with Component Library

The application combines Tailwind CSS's utility-first approach with PrimeVue's component library:

```vue
<template>
	<header
		class="fixed inset-0 w-full h-16 flex items-center px-5 py-2 font-bold bg-white shadow-md shadow-primary-100 z-50"
	>
		<!-- Content -->
	</header>
</template>
```

### Theme System

Custom theming built on PrimeVue's theme system:

```typescript
// Custom theme preset
const CiliaPreset = definePreset(Aura, {
	semantic: {
		primary: {
			50: '{indigo.50}',
			// ... color scale
			950: '{indigo.950}',
		},
	},
});
```

### CSS Architecture

- **Tailwind utilities** for layout and spacing
- **PrimeVue components** for complex UI elements
- **Custom CSS variables** for theme consistency
- **Component-scoped styles** when needed

## State Management

### Local State Management

The application uses Vue's reactive system for local state:

```typescript
// Reactive refs for component state
const notifications: Ref<MenuItem[]> = ref([]);
const notificationsMenu: Ref<InstanceType<typeof Menu> | undefined> = ref();

// Computed properties for derived state
const notificationsUnread = computed(() => {
	return new Set(unreadNotificationsId);
});
```

### Async Data Management

Nuxt's `useAsyncData` for server-side data fetching:

```typescript
const { data: notificationsData } = await useAsyncData<Notification[]>(
	'notifications',
	async () => {
		const { data, error } = await tryCatch(
			services.notification.getMostRecent(),
		);
		return error ? [] : data;
	},
);
```

## Error Handling

### Utility-Based Error Handling

Custom `tryCatch` utility for consistent error handling:

```typescript
// Usage in components
const { data, error } = await tryCatch(services.notification.getMostRecent());

if (error) {
	// Handle error gracefully
	return [];
}
```

### HTTP Error Handling

Centralized error handling in API composables:

```typescript
return $fetch.create({
	onResponseError({ response }) {
		if (response.status === 401) {
			// Handle unauthorized
		}
	},
});
```

## Performance Optimizations

### Image Optimization

- **Nuxt Image** module for automatic image optimization
- **WebP/AVIF** format support
- **Lazy loading** by default

### Font Optimization

- **Nuxt Fonts** module for font optimization
- **Font display: swap** for better loading performance
- **Preload critical fonts**

### Code Splitting

- **Automatic code splitting** via Nuxt
- **Component-level splitting** with dynamic imports
- **Route-based splitting** for pages

### Bundle Optimization

- **Tree shaking** for unused code elimination
- **SVG optimization** via nuxt-svgo
- **CSS purging** via Tailwind CSS

## Development Best Practices

### 1. Component Development

- **Single Responsibility Principle**: Each component has one clear purpose
- **Props validation**: TypeScript interfaces for all props
- **Event naming**: Descriptive event names with `on:` prefix
- **Slot usage**: Flexible content projection where appropriate

### 2. Service Development

- **Interface-first design**: Define interfaces before implementations
- **Dependency injection**: Use provide/inject for service access
- **Error boundaries**: Consistent error handling across services
- **Mock implementations**: Always provide mock versions for development

### 3. Type Safety

- **Strict TypeScript**: No `any` types in production code
- **Interface segregation**: Small, focused interfaces
- **Generic constraints**: Proper generic type constraints
- **Runtime validation**: Zod schemas for API responses

### 4. Testing Strategy

- **Component testing**: Test component behavior and props
- **Service testing**: Mock external dependencies
- **Integration testing**: Test service integrations
- **Type testing**: Ensure TypeScript compilation

## Security Considerations

### 1. XSS Prevention

- **Template escaping**: Vue's automatic XSS protection
- **Content sanitization**: Sanitize rich text content
- **CSP headers**: Content Security Policy implementation

### 2. Authentication & Authorization

- **Token-based auth**: JWT token handling (prepared but not implemented)
- **Route guards**: Protected routes implementation
- **Role-based access**: Service-level permission checks

### 3. Data Validation

- **Input validation**: Zod schemas for all inputs
- **API validation**: Server-side validation
- **Type safety**: TypeScript compile-time checks

## Deployment & Build

### Build Configuration

- **Nuxt 4**: Modern build system with Vite
- **TypeScript compilation**: Strict type checking
- **CSS optimization**: Tailwind CSS purging
- **Asset optimization**: Image and font optimization

### Environment Configuration

- **Runtime config**: Environment-specific settings
- **API endpoints**: Configurable base URLs
- **Feature flags**: Environment-based feature toggles

## Future Considerations

### Scalability

- **Micro-frontend architecture**: Potential module federation
- **State management**: Pinia integration for complex state
- **Caching strategies**: Redis/memory caching for API responses

### Performance

- **Service workers**: Offline functionality
- **Progressive Web App**: PWA capabilities
- **Edge deployment**: Cloudflare/Vercel edge functions

### Monitoring

- **Error tracking**: Sentry integration
- **Performance monitoring**: Web Vitals tracking
- **User analytics**: Privacy-focused analytics

This architecture provides a solid foundation for a scalable, maintainable, and performant web application while following modern development best practices and patterns.
