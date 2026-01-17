# Design Document: Messages List Feature

## Overview

The Messages List feature will add a new section to the home page that displays user-generated messages in a visually consistent and interactive format. The feature follows the established architectural patterns of the Cilia Scuderia application, including the service layer pattern, atomic design principles, and PrimeVue/Tailwind CSS styling approach.

The implementation will create a new message display system that integrates seamlessly with the existing HomeMessage form, providing users with a centralized view of company communications. The design emphasizes visual consistency with existing components while introducing new interactive elements like the like system.

## Architecture

### Component Hierarchy

```
HomeMessagesList (Main Container)
├── MessageItem (Individual Message Display)
│   ├── BaseAvatar (Author Avatar)
│   ├── MessageContent (Rich Text Display)
│   ├── MessageMeta (Timestamp & Author Info)
│   └── MessageActions (Like Button & Count)
└── LoadingState / ErrorState (Conditional States)
```

### Service Layer Integration

The feature will extend the existing service architecture with a new `MessageService` that follows the established interface-first pattern:

```typescript
MessageService (Interface)
├── MessageServiceMock (Development/Testing)
├── MessageServiceHttp (Future Backend Integration)
└── MessageServiceFetch (Nuxt API Integration)
```

### Data Flow

1. **Page Load**: HomeMessagesList fetches messages via MessageService
2. **Message Submission**: HomeMessage form triggers refresh of MessagesList
3. **Like Interaction**: User clicks like → Service call → UI update
4. **Error Handling**: Service failures trigger error states with user feedback

## Components and Interfaces

### HomeMessagesList Component

**Location**: `app/components/home/MessagesList.vue`

**Responsibilities**:

- Fetch and display messages using MessageService
- Handle loading and error states
- Manage message refresh after new submissions
- Provide container styling consistent with other home sections

**Props**: None (uses injected services)

**Key Features**:

- Reverse chronological message ordering
- Responsive grid layout
- Loading skeleton during data fetch
- Error boundary with retry functionality

### MessageItem Component

**Location**: `app/components/home/message/MessageItem.vue`

**Responsibilities**:

- Display individual message content and metadata
- Handle like/unlike interactions
- Format timestamps and rich text content
- Provide hover effects and visual feedback

**Props**:

```typescript
interface MessageItemProps {
  message: Message;
  currentUserId: number;
}
```

**Key Features**:

- Rich text content rendering with HTML sanitization
- Interactive like button with optimistic updates
- Responsive layout for mobile and desktop
- Consistent styling with existing components

### MessageActions Component

**Location**: `app/components/home/message/MessageActions.vue`

**Responsibilities**:

- Render like button and count
- Handle like/unlike state management
- Provide loading states during operations
- Display error feedback for failed operations

**Props**:

```typescript
interface MessageActionsProps {
  messageId: number;
  likeCount: number;
  isLiked: boolean;
  loading?: boolean;
}
```

## Data Models

### Message Interface

**Location**: `shared/types/Message.ts`

```typescript
export interface Message {
  id: number;
  content: string; // Rich text HTML from Quill editor
  author: User;
  createdAt: Date;
  likeCount: number;
  isLiked: boolean; // Current user's like status
  loading?: boolean; // For optimistic updates
}
```

### MessageService Interface

**Location**: `app/services/MessageService.ts`

```typescript
export interface MessageService {
  getMessages(): Promise<Message[]>;
  likeMessage(messageId: number): Promise<void>;
  unlikeMessage(messageId: number): Promise<void>;
  createMessage(content: string): Promise<Message>;
}
```

### Service Integration

The MessageService will be added to the existing Services interface:

```typescript
// shared/types/Services.ts
export interface Services {
  notification: NotificationService;
  message: MessageService; // New addition
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Message List Chronological Ordering

_For any_ set of messages with different timestamps, the message list should display them in reverse chronological order (newest first), and this ordering should be maintained after any refresh operations.
**Validates: Requirements 1.1, 3.3**

### Property 2: Message Content Display Completeness

_For any_ message, the message item should display all required content including rich text content, author name and avatar, formatted timestamp, and current like count.
**Validates: Requirements 1.2, 1.3, 1.4, 1.5**

### Property 3: Like State Toggle Behavior

_For any_ message, clicking the like button should toggle the like state from liked to unliked or vice versa.
**Validates: Requirements 2.1**

### Property 4: Like Count Accuracy

_For any_ message, liking should increment the count by exactly one, and unliking should decrement the count by exactly one.
**Validates: Requirements 2.2, 2.3**

### Property 5: Like Button State Representation

_For any_ message, the like button should display in active state when isLiked is true and inactive state when isLiked is false.
**Validates: Requirements 2.4, 2.5**

### Property 6: Loading State Management

_For any_ asynchronous operation (fetching messages, liking/unliking), the appropriate loading indicators should be displayed during the operation and removed when complete.
**Validates: Requirements 2.6, 5.1, 5.3**

### Property 7: Message List Refresh Integration

_For any_ new message submitted through the HomeMessage form, the message list should refresh to include the new message while maintaining proper ordering.
**Validates: Requirements 3.2**

### Property 8: Service Data Structure Compliance

_For any_ message returned by the MessageService, it should contain all required fields defined in the Message interface.
**Validates: Requirements 4.4**

### Property 9: Like Operation Persistence

_For any_ like/unlike operation, the MessageService should persist the change and return updated data reflecting the new state.
**Validates: Requirements 4.5**

### Property 10: Error State Management

_For any_ failed operation (message fetch, like operation), the system should display appropriate error messages and revert optimistic updates where applicable.
**Validates: Requirements 5.2, 5.4**

### Property 11: Rich Text Content Preservation

_For any_ message with HTML content from the Quill editor, the content should be preserved and displayed correctly while being sanitized for security.
**Validates: Requirements 7.1, 7.2**

### Property 12: Timestamp Formatting Consistency

_For any_ message timestamp, it should be formatted in a user-friendly format (e.g., "2 hours ago", "Yesterday").
**Validates: Requirements 7.5**

## Error Handling

### Service Layer Error Handling

The MessageService implementations will handle various error scenarios:

1. **Network Failures**: HTTP/Fetch services will catch network errors and throw standardized exceptions
2. **Data Validation**: All service responses will be validated against TypeScript interfaces
3. **Timeout Handling**: Long-running requests will have appropriate timeout mechanisms
4. **Retry Logic**: Failed operations will support retry mechanisms where appropriate

### Component Error Boundaries

Components will implement error boundaries to handle:

1. **Service Failures**: Display user-friendly error messages when service calls fail
2. **Rendering Errors**: Graceful degradation when message content cannot be rendered
3. **State Corruption**: Recovery mechanisms for invalid component states
4. **Optimistic Update Failures**: Reversion of UI changes when backend operations fail

### User Feedback Mechanisms

Error states will provide clear user feedback:

1. **Toast Notifications**: For operation failures (like/unlike errors)
2. **Inline Error Messages**: For persistent errors (failed message loading)
3. **Retry Actions**: User-initiated retry buttons for failed operations
4. **Loading States**: Clear indication of ongoing operations

## Testing Strategy

### Dual Testing Approach

The implementation will use both unit testing and property-based testing for comprehensive coverage:

**Unit Tests**:

- Specific examples of message display and interaction
- Edge cases like empty message lists, long content, special characters
- Integration points between components
- Error conditions and recovery scenarios
- Component lifecycle and state management

**Property Tests**:

- Universal properties that hold for all inputs using a property-based testing library
- Minimum 100 iterations per property test for thorough randomization
- Each property test will reference its corresponding design document property
- Tag format: **Feature: messages-list, Property {number}: {property_text}**

### Property-Based Testing Configuration

The implementation will use a TypeScript-compatible property-based testing library (such as fast-check) to verify the correctness properties. Each property test will:

1. Generate random test data (messages, users, timestamps, content)
2. Execute the system behavior being tested
3. Verify the property holds true for all generated inputs
4. Run a minimum of 100 iterations to ensure comprehensive coverage

### Testing Library Selection

For TypeScript/Vue 3 environment, the recommended property-based testing library is **fast-check**, which integrates well with existing testing frameworks like Vitest or Jest and provides excellent TypeScript support.

### Unit Testing Balance

Unit tests will focus on:

- Specific examples that demonstrate correct behavior
- Integration between MessagesList and HomeMessage form
- Error conditions and edge cases
- Component mounting and lifecycle events

Property tests will handle comprehensive input coverage through randomization, reducing the need for extensive unit test suites while ensuring correctness across all possible inputs.
