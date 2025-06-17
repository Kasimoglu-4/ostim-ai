# React Components Documentation

A comprehensive guide to all React components in the Ostim.AI frontend application.

## 📁 Component Structure

```
components/
├── Chat/                         # Chat-related components (7 files)
│   ├── ChatInterface.js          # Main chat container
│   ├── ChatArea.js               # Chat display area
│   ├── Message.js                # Individual message component
│   ├── MessageList.js            # Message container with scrolling
│   ├── TextAreaInput.js          # Enhanced text input
│   ├── FileUploadDemo.js         # File upload demonstration
│   └── GlobalFeedbackModal.js    # Global feedback system
├── Sidebar/                      # Navigation components (7 files)
│   ├── Sidebar.js                # Main navigation sidebar
│   ├── ConversationList.js       # Chat history display
│   ├── Logo.js                   # University branding
│   ├── ModelSelector.js          # AI model selection
│   ├── SettingsModal.js          # Settings management
│   └── ChangePasswordModal.js    # Password change interface
└── ThemeToggle.js               # Theme selection component
```

## 🎯 Component Categories

### **Core Chat Components**

#### `ChatInterface.js`
- **Purpose**: Main chat application container
- **Props**: None (manages global state)
- **Features**: 
  - Chat list management
  - Active chat switching
  - Responsive layout coordination
  - Service integration hub

#### `ChatArea.js`
- **Purpose**: Primary chat interaction area
- **Props**: `activeChat`, `onMessageSend`, `chatFiles`
- **Features**:
  - Message display and rendering
  - Input handling with file upload
  - Real-time AI response streaming
  - Message action controls

#### `Message.js`
- **Purpose**: Individual message rendering
- **Props**: `message`, `onVote`, `onCopy`, `onEdit`
- **Features**:
  - Markdown and code syntax highlighting
  - File attachment previews
  - Interactive voting buttons
  - Copy and edit functionality
  - Think tag processing display

#### `MessageList.js`
- **Purpose**: Message container with scroll management
- **Props**: `messages`, `chatId`, `isLoading`
- **Features**:
  - Auto-scroll to bottom
  - Virtual scrolling for performance
  - Loading states for older messages
  - Scroll position preservation

#### `TextAreaInput.js`
- **Purpose**: Enhanced message input with file support
- **Props**: `onSend`, `onFileUpload`, `disabled`, `placeholder`
- **Features**:
  - Auto-expanding textarea
  - Drag-and-drop file upload
  - Keyboard shortcuts (Ctrl+Enter)
  - Character counting and validation

### **Navigation Components**

#### `Sidebar.js`
- **Purpose**: Main navigation and chat management
- **Props**: `isCollapsed`, `onToggle`, `activeChat`
- **Features**:
  - Collapsible responsive design
  - Chat list with search
  - User menu and settings access
  - Theme toggle integration

#### `ConversationList.js`
- **Purpose**: Chat history management
- **Props**: `chats`, `activeChat`, `onChatSelect`, `onChatDelete`
- **Features**:
  - Chat list rendering with titles
  - Inline title editing
  - Delete confirmation dialogs
  - Search and filtering

#### `ModelSelector.js`
- **Purpose**: AI model selection interface
- **Props**: `selectedModel`, `onModelChange`, `availableModels`
- **Features**:
  - Model dropdown with descriptions
  - Real-time model status checking
  - Model performance indicators
  - Fallback handling for unavailable models

### **Modal Components**

#### `SettingsModal.js`
- **Purpose**: Comprehensive settings management
- **Props**: `isOpen`, `onClose`, `currentUser`
- **Features**:
  - User profile management
  - Theme preferences
  - Password change integration
  - Account deletion with confirmation
  - Data export options

#### `ChangePasswordModal.js`
- **Purpose**: Secure password change interface
- **Props**: `isOpen`, `onClose`, `onPasswordChange`
- **Features**:
  - Current password verification
  - New password strength validation
  - Confirmation field matching
  - Real-time validation feedback

#### `GlobalFeedbackModal.js`
- **Purpose**: Application-wide feedback collection
- **Props**: `isOpen`, `onClose`, `contextData`
- **Features**:
  - Multiple feedback categories
  - Rich text input support
  - File attachment for bug reports
  - Email integration for support

### **Utility Components**

#### `Logo.js`
- **Purpose**: University branding display
- **Props**: `size`, `variant`, `clickable`
- **Features**:
  - Responsive SVG logo
  - Multiple size variants
  - University color theming
  - Optional navigation link

#### `ThemeToggle.js`
- **Purpose**: Theme selection component
- **Props**: `currentTheme`, `onThemeChange`
- **Features**:
  - Three-theme support (Light, Dark, Sepia)
  - Smooth theme transitions
  - Persistent preference storage
  - Accessibility support

## 🔧 Component Patterns

### **State Management**
- **Local State**: useState for component-specific data
- **Global State**: Context API for theme and authentication
- **Server State**: React hooks with service layer integration

### **Props Interface Standards**
```javascript
// Standard prop patterns used across components
interface CommonProps {
  className?: string;           // Additional CSS classes
  isLoading?: boolean;         // Loading state
  onError?: (error) => void;   // Error handling
  testId?: string;             // Testing identifiers
}
```

### **Event Handling Patterns**
```javascript
// Consistent event naming conventions
onItemSelect = (item) => {}     // Selection events
onItemChange = (item) => {}     // Modification events
onItemDelete = (item) => {}     // Deletion events
onItemCreate = (data) => {}     // Creation events
```

## 🎨 Styling Approach

### **CSS Architecture**
- **Component-specific CSS**: Individual stylesheets for each component
- **CSS Modules**: Scoped styling for authentication components
- **CSS Variables**: Theme-based color and spacing systems
- **Material-UI**: Emotion CSS-in-JS for complex components

### **Responsive Design**
- **Mobile-first**: Components designed for mobile and scaled up
- **Breakpoints**: Consistent responsive breakpoint usage
- **Touch-friendly**: Appropriate touch targets and gestures
- **Accessibility**: WCAG 2.1 compliance for all interactive elements

## 🧪 Testing Strategy

### **Component Testing**
```javascript
// Example component test structure
import { render, screen, userEvent } from '@testing-library/react';
import Message from './Message';

describe('Message Component', () => {
  it('renders user messages correctly', () => {
    const mockMessage = {
      content: 'Hello world',
      type: 'user',
      timestamp: new Date().toISOString()
    };
    
    render(<Message message={mockMessage} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });
});
```

### **Integration Testing**
- **Component interaction**: Testing component communication
- **Service integration**: Mocking API calls and responses
- **User workflows**: End-to-end user journey testing

## 📚 Usage Examples

### **Basic Component Usage**
```javascript
import ChatInterface from './components/Chat/ChatInterface';
import Sidebar from './components/Sidebar/Sidebar';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <ChatInterface />
    </div>
  );
}
```

### **Advanced Component Configuration**
```javascript
import Message from './components/Chat/Message';

function MessageDisplay({ messages }) {
  return (
    <div className="message-list">
      {messages.map(message => (
        <Message
          key={message.id}
          message={message}
          onVote={handleVote}
          onCopy={handleCopy}
          onEdit={handleEdit}
          showActions={true}
          enableVoting={true}
        />
      ))}
    </div>
  );
}
```

## 🔄 Component Lifecycle

### **Mounting Lifecycle**
1. **Constructor/useState**: Initialize component state
2. **useEffect**: Setup subscriptions and API calls
3. **Render**: Initial component rendering
4. **useEffect cleanup**: Setup cleanup functions

### **Update Lifecycle**
1. **Props changes**: React to new props
2. **State updates**: Handle state modifications
3. **Re-render**: Update DOM with changes
4. **Effect dependencies**: Run effects when dependencies change

## 🚀 Performance Optimization

### **React.memo Usage**
```javascript
// Memoize expensive components
const Message = React.memo(({ message, onVote }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.message.id === nextProps.message.id;
});
```

### **useMemo and useCallback**
```javascript
// Optimize expensive calculations and functions
const MessageComponent = ({ messages, onMessageAction }) => {
  const sortedMessages = useMemo(() => 
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
    [messages]
  );
  
  const handleAction = useCallback((messageId, action) => {
    onMessageAction(messageId, action);
  }, [onMessageAction]);
  
  return (
    // Component JSX
  );
};
```

## 🔗 Component Dependencies

### **Internal Dependencies**
- **Contexts**: ThemeContext for theme management
- **Services**: API service layer for data operations
- **Utilities**: Helper functions and validation

### **External Dependencies**
- **Material-UI**: UI component library
- **React Router**: Navigation and routing
- **React Syntax Highlighter**: Code block rendering
- **Axios**: HTTP client for API calls

## 📖 Development Guidelines

### **Code Standards**
- **ESLint**: Consistent code formatting and linting
- **Prettier**: Automatic code formatting
- **PropTypes**: Runtime type checking for development
- **JSDoc**: Comprehensive function documentation

### **Component Creation Checklist**
- [ ] Create component file with proper naming
- [ ] Add corresponding CSS file
- [ ] Implement PropTypes or TypeScript interfaces
- [ ] Write unit tests
- [ ] Add to component documentation
- [ ] Ensure accessibility compliance
- [ ] Test responsive behavior

---

This documentation serves as a comprehensive guide for understanding, using, and maintaining the React components in the Ostim.AI frontend application. 