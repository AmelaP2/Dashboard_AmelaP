# Implementation Plan: Personal Dashboard

## Overview

Build a self-contained, single-page personal dashboard as a plain HTML/CSS/Vanilla JS application with no dependencies, no build step, and no network requests. Implementation proceeds in layers: project scaffolding → shared storage utility → each widget in isolation → integration and wiring → styling and layout → testing.

---

## Tasks

- [x] 1. Scaffold project structure and shared utilities
  - [x] 1.1 Create the file structure: `index.html`, `css/style.css`, and `js/app.js`
    - Create `index.html` with semantic HTML5 boilerplate, `<link>` to `css/style.css`, and `<script type="module" src="js/app.js">` (or deferred script)
    - Add four widget `<section>` containers with matching `id` attributes (greeting, timer, todo, quick-links)
    - _Requirements: 6.1, 6.2_
  - [x] 1.2 Implement the `Storage` utility module inside `js/app.js`
    - Define `Storage.KEYS` with `TASKS`, `LINKS`, and `TIMER_DURATION` constants
    - Implement `Storage.get(key, fallback)` with try/catch and JSON parse; return `fallback` on any error
    - Implement `Storage.set(key, value)` with try/catch; log a warning on failure
    - Implement a one-time session banner for storage unavailability (`role="alert"`)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [-] 1.3 Write property test for `Storage.get` fallback (Property 20)
    - **Property 20: Malformed localStorage data falls back to empty state**
    - **Validates: Requirements 5.4**
    - Use fast-check with `fc.string()` to generate arbitrary malformed JSON strings and verify `Storage.get` always returns the fallback without throwing
    - `numRuns: 100`

- [x] 2. Implement GreetingWidget
  - [x] 2.1 Implement `GreetingWidget` module with clock and greeting logic
    - Implement `formatTime(date)` → `"HH:MM"` with zero-padding
    - Implement `formatDate(date)` → human-readable string (e.g., "Monday, July 14, 2025")
    - Implement `getGreeting(hour)` using the four defined time ranges
    - Implement `render(date)` to update the DOM text nodes for time, date, and greeting
    - Implement `GreetingWidget.init(containerElement)` which calls `render` immediately and starts a 1-second `setInterval`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  - [~] 2.2 Write property test for `formatTime(date)` (Property 1)
    - **Property 1: Time formatting produces HH:MM output**
    - **Validates: Requirements 1.1**
    - Use fast-check `fc.date()` arbitrary; assert result matches `/^\d{2}:\d{2}$/` and values are in valid ranges
    - `numRuns: 100`
  - [~] 2.3 Write property test for `formatDate(date)` (Property 2)
    - **Property 2: Date formatting contains required components**
    - **Validates: Requirements 1.2**
    - Use fast-check `fc.date()` arbitrary; assert result contains a weekday name, month name, numeric day, and 4-digit year
    - `numRuns: 100`
  - [~] 2.4 Write property test for `getGreeting(hour)` (Property 3)
    - **Property 3: Greeting is determined entirely by hour**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
    - Use fast-check `fc.integer({ min: 0, max: 23 })`; assert each hour maps to exactly the correct greeting string per the defined ranges
    - `numRuns: 100` (or exhaustive — only 24 inputs)

- [ ] 3. Implement TimerWidget
  - [x] 3.1 Implement `TimerWidget` internal state and core functions
    - Define internal state object: `durationSeconds`, `remainingSeconds`, `intervalId`, `isRunning`
    - Implement `formatTime(seconds)` → `"MM:SS"` with zero-padding
    - Implement `loadDuration()` reading from `Storage.get(TIMER_DURATION, 1500)`
    - Implement `saveDuration(seconds)` writing via `Storage.set`
    - Implement `render()` updating the MM:SS display in the DOM
    - _Requirements: 2.1, 2.3_
  - [~] 3.2 Write property test for timer `formatTime(seconds)` (Property 4)
    - **Property 4: Timer countdown formatting produces MM:SS output**
    - **Validates: Requirements 2.3**
    - Use fast-check `fc.integer({ min: 0, max: 5940 })`; assert result matches `MM:SS` pattern and represents the correct total seconds
    - `numRuns: 100`
  - [x] 3.3 Implement `start()`, `stop()`, `reset()`, `tick()`, and `notifyComplete()` for TimerWidget
    - `start()`: sets `isRunning = true`, starts `setInterval` calling `tick()` each second
    - `stop()`: clears interval, sets `isRunning = false`; retains `remainingSeconds`
    - `reset()`: clears interval, sets `isRunning = false`, sets `remainingSeconds = durationSeconds`, calls `render()`
    - `tick()`: decrements `remainingSeconds`, calls `render()`; when it reaches 0, clears interval, sets `isRunning = false`, calls `notifyComplete()`
    - `notifyComplete()`: fires browser `Notification` if permission granted, otherwise plays a base64-encoded beep via `Audio`
    - _Requirements: 2.2, 2.4, 2.5, 2.6_
  - [~] 3.4 Write property test for `stop()` preserving remaining time (Property 5)
    - **Property 5: Stop preserves remaining time**
    - **Validates: Requirements 2.4**
    - Use fast-check `fc.integer({ min: 1, max: 5940 })` for `remainingSeconds`; assert `remainingSeconds` unchanged and `isRunning === false` after `stop()`
    - `numRuns: 100`
  - [~] 3.5 Write property test for `reset()` restoring duration (Property 6)
    - **Property 6: Reset restores configured duration**
    - **Validates: Requirements 2.5**
    - Use fast-check to generate arbitrary `durationSeconds` and `remainingSeconds`; assert `remainingSeconds === durationSeconds` and `isRunning === false` after `reset()`
    - `numRuns: 100`
  - [~] 3.6 Implement `setDuration(minutes)` with validation and guard
    - Validate that `minutes` is an integer in [1, 99]; reset the duration field to the current value if outside range
    - If `isRunning === true`, return immediately without updating state or localStorage
    - Otherwise set `durationSeconds = minutes * 60`, call `saveDuration`, and call `reset()`
    - _Requirements: 2.7, 2.8_
  - [~] 3.7 Write property test for `setDuration` valid range (Property 7)
    - **Property 7: Valid custom durations are accepted and persisted**
    - **Validates: Requirements 2.7**
    - Use fast-check `fc.integer({ min: 1, max: 99 })`; assert `durationSeconds === m * 60` and `loadDuration()` returns `m * 60`
    - `numRuns: 100`
  - [~] 3.8 Write property test for `setDuration` ignored while running (Property 8)
    - **Property 8: Duration change is ignored while timer is running**
    - **Validates: Requirements 2.8**
    - Use fast-check to generate an arbitrary new duration with `isRunning === true`; assert `durationSeconds`, `remainingSeconds`, and `isRunning` all remain unchanged
    - `numRuns: 100`
  - [~] 3.9 Wire `TimerWidget.init(containerElement)`, attach event listeners to Start/Stop/Reset buttons and duration input
    - Query DOM for timer container, attach `click` handlers calling `start()`, `stop()`, `reset()`
    - Attach `change`/`blur` handler on duration input calling `setDuration()`
    - Call `loadDuration()`, set initial state, call `render()`
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.7_

- [~] 4. Checkpoint — Ensure GreetingWidget and TimerWidget tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement TodoWidget
  - [x] 5.1 Implement `generateId()`, `validateTitle()`, `isDuplicate()`, and the Task data model
    - `generateId()` returns a unique string (e.g., `Date.now() + '-' + Math.random()`)
    - `validateTitle(title)` returns `false` if `title.trim().length === 0`
    - `isDuplicate(title, tasks)` returns `true` if any incomplete task has a case-insensitively matching trimmed title
    - Define the Task schema: `{ id, title, completed, createdAt }`
    - _Requirements: 3.1, 3.2, 3.3_
  - [~] 5.2 Write property test for `addTask` valid creation (Property 9)
    - **Property 9: Valid task creation populates all required fields**
    - **Validates: Requirements 3.1**
    - Use fast-check `fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)`; assert all four Task fields are correctly populated
    - `numRuns: 100`
  - [~] 5.3 Write property test for whitespace/empty rejection (Property 10)
    - **Property 10: Whitespace-only and empty inputs are rejected**
    - **Validates: Requirements 3.2, 3.5**
    - Use fast-check to generate strings where `s.trim().length === 0`; assert task list count is unchanged
    - `numRuns: 100`
  - [~] 5.4 Write property test for duplicate prevention (Property 11)
    - **Property 11: Duplicate task titles are rejected (case-insensitive)**
    - **Validates: Requirements 3.3**
    - Use fast-check to generate a task list with at least one incomplete task; assert that submitting a case-variant of its title is rejected when duplicate prevention is enabled
    - `numRuns: 100`
  - [~] 5.5 Implement `addTask()`, `editTask()`, `deleteTask()`, `toggleComplete()`, and `sortTasks()`
    - `addTask(title)`: validates, checks duplicates, creates Task, calls `saveTasks`, calls `render()`; shows inline error on rejection
    - `editTask(id, newTitle)`: validates new title (reject if empty/whitespace), mutates task in array, calls `saveTasks`, calls `render()`
    - `deleteTask(id)`: filters out task by id, calls `saveTasks`, calls `render()`
    - `toggleComplete(id)`: flips `completed` boolean, calls `saveTasks`, calls `render()`
    - `sortTasks(tasks, order)`: returns a **new** sorted array without mutating the original; supports `alpha-asc`, `alpha-desc`, `date`
    - _Requirements: 3.1, 3.4, 3.5, 3.6, 3.7, 3.8_
  - [~] 5.6 Write property test for completion toggle round trip (Property 12)
    - **Property 12: Completion toggle is a round trip**
    - **Validates: Requirements 3.6, 3.7**
    - Use fast-check to generate a task with arbitrary `completed` value; assert two consecutive `toggleComplete` calls restore original state
    - `numRuns: 100`
  - [~] 5.7 Write property test for task deletion (Property 13)
    - **Property 13: Deleted task is absent from the list**
    - **Validates: Requirements 3.8**
    - Use fast-check to generate a non-empty task array; pick a random task id, call `deleteTask`, assert the id is absent and count decreased by 1
    - `numRuns: 100`
  - [~] 5.8 Write property test for sorting non-mutation (Property 15)
    - **Property 15: Sorting does not mutate stored data**
    - **Validates: Requirements 3.11**
    - Use fast-check to generate an array of Task objects and a random sort order; assert original array is unmodified after `sortTasks` and `loadTasks()` returns the same data
    - `numRuns: 100`
  - [~] 5.9 Implement `saveTasks()`, `loadTasks()`, `render()`, and `renderTask()` for TodoWidget
    - `saveTasks(tasks)`: calls `Storage.set(TASKS, tasks)`
    - `loadTasks()`: calls `Storage.get(TASKS, [])`
    - `render()`: clears the task list container and re-renders all tasks using `renderTask(task)`
    - `renderTask(task)`: returns a DOM element with title, complete-toggle checkbox, edit button, and delete button; applies strikethrough style when `completed === true`
    - `showError(message)`: displays inline error below the input using an `aria-live="polite"` region
    - _Requirements: 3.9, 3.10_
  - [~] 5.10 Write property test for task serialization round trip (Property 14)
    - **Property 14: Task serialization round trip**
    - **Validates: Requirements 3.9, 3.10**
    - Use fast-check to generate arrays of valid Task objects; assert `Storage.get` after `Storage.set` returns a deeply equal array
    - `numRuns: 100`
  - [~] 5.11 Wire `TodoWidget.init(containerElement)`, attach event listeners, and restore from storage
    - Query the todo container, attach `submit` handler on the add-task form, `click` handlers for edit/delete/toggle per task
    - Attach sort-order `change` handler calling `sortTasks` and `render()` (without re-saving)
    - Call `loadTasks()`, call `render()`
    - _Requirements: 3.1, 3.4, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11_

- [ ] 6. Implement QuickLinksWidget
  - [x] 6.1 Implement `generateId()`, `validateLabel()`, `validateUrl()`, and the Link data model
    - `validateLabel(label)` returns `false` if `label.trim().length === 0`
    - `validateUrl(url)` returns `false` if `new URL(url)` throws
    - Define the Link schema: `{ id, label, url }`
    - _Requirements: 4.1, 4.2_
  - [~] 6.2 Write property test for valid link creation (Property 16)
    - **Property 16: Valid link creation preserves label and URL**
    - **Validates: Requirements 4.1**
    - Use fast-check with non-empty label strings and valid URL strings; assert the resulting Link object has all fields correctly set
    - `numRuns: 100`
  - [~] 6.3 Write property test for invalid link rejection (Property 17)
    - **Property 17: Invalid link submissions are rejected**
    - **Validates: Requirements 4.2**
    - Use fast-check to generate empty/whitespace labels and malformed URL strings; assert links list is unchanged after submission attempt
    - `numRuns: 100`
  - [~] 6.4 Implement `addLink()`, `deleteLink()`, and `openLink()` for QuickLinksWidget
    - `addLink(label, url)`: validates both fields, creates Link, calls `saveLinks`, calls `render()`; shows inline error on rejection
    - `deleteLink(id)`: filters out link by id, calls `saveLinks`, calls `render()`
    - `openLink(url)`: calls `window.open(url, '_blank', 'noopener,noreferrer')`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [~] 6.5 Write property test for link deletion (Property 18)
    - **Property 18: Link deletion removes exactly the target link**
    - **Validates: Requirements 4.4**
    - Use fast-check to generate a non-empty links array; pick a random link id, call `deleteLink`, assert the id is absent and count decreased by 1
    - `numRuns: 100`
  - [~] 6.6 Implement `saveLinks()`, `loadLinks()`, `render()`, and `renderLink()` for QuickLinksWidget
    - `saveLinks(links)`: calls `Storage.set(LINKS, links)`
    - `loadLinks()`: calls `Storage.get(LINKS, [])`
    - `render()`: clears the links container and re-renders all link buttons using `renderLink(link)`
    - `renderLink(link)`: returns a button element that calls `openLink(link.url)` on click and a delete control
    - `showError(message)`: inline error in the add-link form via `aria-live="polite"`
    - _Requirements: 4.5, 4.6_
  - [~] 6.7 Write property test for link serialization round trip (Property 19)
    - **Property 19: Link serialization round trip**
    - **Validates: Requirements 4.5, 4.6**
    - Use fast-check to generate arrays of valid Link objects; assert `Storage.get` after `Storage.set` returns a deeply equal array
    - `numRuns: 100`
  - [~] 6.8 Wire `QuickLinksWidget.init(containerElement)`, attach event listeners, and restore from storage
    - Query the quick-links container, attach `submit` handler on the add-link form, `click` handlers for link buttons and delete controls
    - Call `loadLinks()`, call `render()`
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6_

- [~] 7. Checkpoint — Ensure all widget unit and property tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Bootstrap and wire all widgets in `app.js`
  - [~] 8.1 Implement the `DOMContentLoaded` bootstrap routine in `app.js`
    - On `DOMContentLoaded`, query DOM containers and call `GreetingWidget.init`, `TimerWidget.init`, `TodoWidget.init`, `QuickLinksWidget.init` in order
    - Verify no widget throws during initialisation; each widget should silently handle missing or empty localStorage state
    - _Requirements: 6.1, 7.1_
  - [~] 8.2 Add example-based unit tests for integration behaviour
    - Test: timer initialises with default 1500 seconds when no localStorage entry exists
    - Test: countdown reaching 00:00 clears the interval and calls `notifyComplete`
    - Test: correct namespaced localStorage keys are used (`dashboard_tasks`, `dashboard_links`, `dashboard_timer_duration`)
    - Test: `openLink` calls `window.open` with `_blank` and `noopener,noreferrer`
    - Test: editing a task title updates the DOM to reflect the new title
    - Test: all four widget containers are present in the document on load
    - _Requirements: 5.1, 5.2, 5.3, 2.6, 4.3, 6.1_

- [ ] 9. Implement CSS layout and visual design
  - [~] 9.1 Write `css/style.css` with base typography, spacing, and colour scheme
    - Define CSS custom properties (variables) for the colour palette and spacing scale
    - Style the page body and overall grid/flex layout for the four widgets
    - Apply clear visual hierarchy: widget titles, body text, and interactive controls are visually distinct
    - _Requirements: 6.3_
  - [~] 9.2 Implement responsive layout for viewports below 768 px
    - Use a CSS media query (`max-width: 767px`) to stack each widget to full available width
    - Ensure touch targets on buttons are at least 44 × 44 px on small screens
    - _Requirements: 6.5_
  - [~] 9.3 Style each widget section: Greeting, Timer, Todo, QuickLinks
    - Greeting: prominent time display, subdued date, bold greeting message
    - Timer: large MM:SS display, clearly labelled Start/Stop/Reset buttons, duration input
    - Todo: compact task rows with checkbox, title (strikethrough when complete), edit and delete controls; inline error region
    - QuickLinks: button grid for link items with delete affordance; compact add-link form with inline error region
    - _Requirements: 6.3, 3.6_

- [ ] 10. Final checkpoint — Full integration and cross-browser verification
  - [~] 10.1 Verify no external network requests and no CDN dependencies
    - Review `index.html` and `js/app.js` to confirm there are no CDN URLs, no `fetch` calls, no `import` from remote origins
    - All assets (audio beep, fonts if any) must be inline or local
    - _Requirements: 5.5, 7.3_
  - [~] 10.2 Write a smoke-test suite covering end-to-end flows with JSDOM or a lightweight test harness
    - Test: page load renders all four widgets in the DOM (`#greeting`, `#timer`, `#todo`, `#quick-links`)
    - Test: adding a task, reloading (simulated via `loadTasks()`), and verifying the task is restored
    - Test: adding a link, deleting it, and confirming the links list is empty
    - Test: localStorage write failure (mock `localStorage.setItem` to throw) results in a warning banner without crashing
    - _Requirements: 3.9, 3.10, 4.5, 4.6, 5.4, 6.1_
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP build
- Each property test must include the tag comment `// Feature: personal-dashboard, Property N: <property_text>` and use `numRuns: 100`
- fast-check is the required PBT library; install it as a dev dependency: `npm install --save-dev fast-check`
- All correctness properties (1–20) are covered by dedicated `*` sub-tasks; the test framework should be set up as part of task 8.2
- Checkpoint tasks (4, 7, 10) are not included in the dependency graph — only leaf sub-tasks are scheduled

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "3.2", "3.3", "5.1", "6.1"] },
    { "id": 3, "tasks": ["3.4", "3.5", "3.6", "5.2", "5.3", "5.4", "6.2", "6.3"] },
    { "id": 4, "tasks": ["3.7", "3.8", "5.5", "6.4"] },
    { "id": 5, "tasks": ["3.9", "5.6", "5.7", "5.8", "5.9", "6.5", "6.6"] },
    { "id": 6, "tasks": ["5.10", "5.11", "6.7", "6.8"] },
    { "id": 7, "tasks": ["8.1"] },
    { "id": 8, "tasks": ["8.2", "9.1"] },
    { "id": 9, "tasks": ["9.2", "9.3", "10.1"] },
    { "id": 10, "tasks": ["10.2"] }
  ]
}
```
