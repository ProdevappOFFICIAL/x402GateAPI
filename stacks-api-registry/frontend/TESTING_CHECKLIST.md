# Testing Checklist - API Proxy Manager

## Pre-Testing Setup

- [ ] Backend server is running on `http://localhost:4000`
- [ ] Frontend is running on `http://localhost:5173`
- [ ] `.env` file is configured with correct `VITE_API_BASE_URL`
- [ ] Browser console is open for debugging
- [ ] Network tab is open to monitor API calls

## Authentication Tests

### Wallet Connection
- [ ] Connect wallet button works
- [ ] User address is displayed correctly
- [ ] Landing page shows when not authenticated
- [ ] Dashboard shows when authenticated

### API Key Generation
- [ ] "Generate API Key" button appears in navbar
- [ ] Clicking button opens modal
- [ ] Modal has proper styling and layout
- [ ] Can enter key name
- [ ] Generate button is disabled when name is empty
- [ ] Loading state shows during generation
- [ ] Success message appears after generation
- [ ] Generated key is displayed
- [ ] Copy button works and shows checkmark
- [ ] Key is saved to localStorage (`x402_api_key`)
- [ ] Button text changes to "API Key Active" after generation
- [ ] Modal can be closed with X button
- [ ] Modal can be closed with Done button

### API Key Persistence
- [ ] Refresh page - API key still active
- [ ] Close and reopen browser - API key still active
- [ ] Clear localStorage - API key is removed
- [ ] Generate new key - old key is replaced

## API Proxy Tab Tests

### Initial State
- [ ] Tab switcher shows "Registry API Rules" and "API Proxy"
- [ ] Clicking "API Proxy" tab switches view
- [ ] Tab has active styling when selected
- [ ] Content animates in smoothly

### Without API Key
- [ ] Shows "API Key Required" message
- [ ] Shows key icon
- [ ] Shows helpful instruction text
- [ ] No create button visible
- [ ] No API list visible

### With API Key - Empty State
- [ ] Shows "No API Proxies" message
- [ ] Shows plug icon
- [ ] Shows helpful instruction text
- [ ] "Create API Proxy" button is visible
- [ ] "Refresh" button is visible

### Create API Proxy
- [ ] Click "Create API Proxy" opens form
- [ ] Form has all required fields
- [ ] Form has proper styling
- [ ] Cancel button closes form
- [ ] All input fields are editable
- [ ] Network dropdown works
- [ ] Price fields accept decimal numbers
- [ ] URL fields validate format
- [ ] Submit button is enabled when form is valid
- [ ] Loading state shows during creation
- [ ] Success message appears after creation
- [ ] Form closes after successful creation
- [ ] New API appears in list
- [ ] Wrapper URL is generated correctly

### API List View
- [ ] All APIs are displayed
- [ ] Each card shows correct information
- [ ] Active status badge is green
- [ ] Inactive status badge is red
- [ ] Original URL is displayed
- [ ] Wrapper URL is displayed
- [ ] Price and network are displayed
- [ ] Action buttons are visible

### Edit API Proxy
- [ ] Click "Edit" opens form
- [ ] Form is pre-filled with existing data
- [ ] Can modify all fields
- [ ] Cancel button closes form without saving
- [ ] Update button saves changes
- [ ] Loading state shows during update
- [ ] Success message appears after update
- [ ] Form closes after successful update
- [ ] List updates with new data
- [ ] Scroll to top happens when editing

### Enable/Disable API
- [ ] Active API shows "Disable" button
- [ ] Inactive API shows "Enable" button
- [ ] Clicking button toggles state
- [ ] Loading state shows during toggle
- [ ] Success message appears
- [ ] Badge updates immediately
- [ ] Button text updates immediately

### Delete API
- [ ] Click "Delete" shows confirmation dialog
- [ ] Confirmation dialog has API name
- [ ] Cancel in dialog keeps API
- [ ] Confirm in dialog deletes API
- [ ] Loading state shows during deletion
- [ ] Success message appears
- [ ] API is removed from list
- [ ] Form closes if API being edited is deleted

### Refresh List
- [ ] Click "Refresh" fetches latest data
- [ ] Loading state shows during refresh
- [ ] Success message shows count
- [ ] List updates with fresh data
- [ ] Handles empty list correctly
- [ ] Handles errors gracefully

## Error Handling Tests

### Network Errors
- [ ] Backend offline - shows error message
- [ ] Invalid API key - shows error message
- [ ] Timeout - shows error message
- [ ] CORS error - shows error message

### Validation Errors
- [ ] Empty required fields - shows error
- [ ] Invalid URL format - shows error
- [ ] Invalid price values - shows error
- [ ] Invalid Stacks address - shows error

### API Errors
- [ ] 401 Unauthorized - shows error message
- [ ] 404 Not Found - shows error message
- [ ] 409 Conflict - shows error message
- [ ] 500 Server Error - shows error message

### Error Message Display
- [ ] Error messages have red background
- [ ] Error messages have ❌ emoji
- [ ] Error messages are dismissible
- [ ] Error messages clear on new action
- [ ] Multiple errors don't stack

## Success Message Tests

### Message Display
- [ ] Success messages have slate background
- [ ] Success messages have ✅ emoji
- [ ] Success messages are dismissible
- [ ] Success messages clear on new action
- [ ] Messages show for all operations

### Message Content
- [ ] Create: "API created successfully!"
- [ ] Update: "API updated successfully!"
- [ ] Delete: "API deleted successfully!"
- [ ] Refresh: "Loaded X API(s)"
- [ ] Key generation: "API Key generated..."

## UI/UX Tests

### Styling
- [ ] All components match design system
- [ ] Colors are consistent
- [ ] Borders and shadows are consistent
- [ ] Typography is consistent
- [ ] Spacing is consistent

### Responsiveness
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] No horizontal scroll
- [ ] All buttons are clickable
- [ ] All text is readable

### Animations
- [ ] Tab switch animates smoothly
- [ ] Form open/close is smooth
- [ ] Loading spinner rotates
- [ ] Hover states work
- [ ] Transitions are smooth

### Accessibility
- [ ] All buttons have hover states
- [ ] All inputs have focus states
- [ ] All text is readable
- [ ] Color contrast is sufficient
- [ ] Tab navigation works
- [ ] Screen reader friendly (basic)

## Performance Tests

### Loading Times
- [ ] Initial page load < 2s
- [ ] Tab switch < 100ms
- [ ] Form open < 100ms
- [ ] API calls < 1s
- [ ] List render < 500ms

### Memory
- [ ] No memory leaks on tab switch
- [ ] No memory leaks on form open/close
- [ ] No memory leaks on list updates

### Network
- [ ] API calls are not duplicated
- [ ] Unnecessary calls are avoided
- [ ] Loading states prevent double-clicks

## Integration Tests

### Registry Tab Integration
- [ ] Can switch between tabs
- [ ] State is preserved when switching
- [ ] No conflicts between tabs
- [ ] Both tabs work independently

### Wallet Integration
- [ ] Wallet connection works with proxy tab
- [ ] User address is available
- [ ] Disconnect wallet shows landing page

### localStorage Integration
- [ ] API key persists correctly
- [ ] No conflicts with other data
- [ ] Clear storage works correctly

## Edge Cases

### Empty States
- [ ] No APIs - shows empty state
- [ ] No API key - shows prompt
- [ ] Loading - shows spinner
- [ ] Error - shows error message

### Boundary Values
- [ ] Price = 0 - handled correctly
- [ ] Price = very large number - handled correctly
- [ ] Very long API name - truncates or wraps
- [ ] Very long URL - truncates or wraps

### Concurrent Operations
- [ ] Multiple rapid clicks - handled correctly
- [ ] Edit while creating - handled correctly
- [ ] Delete while editing - handled correctly

### Browser Compatibility
- [ ] Chrome - works correctly
- [ ] Firefox - works correctly
- [ ] Safari - works correctly
- [ ] Edge - works correctly

## Security Tests

### API Key Security
- [ ] API key not visible in URL
- [ ] API key not logged to console
- [ ] API key stored securely
- [ ] API key sent in headers only

### Input Validation
- [ ] XSS attempts are sanitized
- [ ] SQL injection attempts are blocked
- [ ] Script tags are escaped
- [ ] Special characters are handled

### CORS
- [ ] Backend allows frontend origin
- [ ] Credentials are sent correctly
- [ ] Preflight requests work

## Regression Tests

After any changes, verify:
- [ ] All existing features still work
- [ ] No new console errors
- [ ] No new console warnings
- [ ] No broken styles
- [ ] No broken functionality

## Final Checklist

- [ ] All tests pass
- [ ] No console errors
- [ ] No console warnings
- [ ] Code is clean and formatted
- [ ] Documentation is updated
- [ ] Ready for production

## Test Results

| Test Category | Pass | Fail | Notes |
|--------------|------|------|-------|
| Authentication | ☐ | ☐ | |
| API Key Generation | ☐ | ☐ | |
| API Proxy CRUD | ☐ | ☐ | |
| Error Handling | ☐ | ☐ | |
| UI/UX | ☐ | ☐ | |
| Performance | ☐ | ☐ | |
| Integration | ☐ | ☐ | |
| Security | ☐ | ☐ | |

## Notes

```
Date: _______________
Tester: _______________
Environment: _______________
Browser: _______________
Issues Found: _______________
```
