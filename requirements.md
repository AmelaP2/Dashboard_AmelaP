# Requirements Document

## Introduction

A personal dashboard web application built with HTML, CSS, and Vanilla JavaScript (no frameworks, no backend). The dashboard runs entirely in the browser, using Local Storage for persistence. It provides four core widgets: a greeting with the current time and date, a Pomodoro focus timer, a to-do list, and a quick-links panel. Stretch goals include a configurable Pomodoro duration, duplicate task prevention, and task sorting.

---

## Glossary

- **Dashboard**: The single-page web application served as a standalone HTML file or browser extension.
- **Greeting_Widget**: The UI component that displays the current time, date, and a time-of-day greeting message.
- **Timer**: The Pomodoro focus timer component.
- **TodoList**: The to-do list component responsible for managing tasks.
- **Task**: A single to-do item with a title, completion state, and creation timestamp.
- **QuickLinks**: The component that manages and displays bookmark-style link buttons.
- **Link**: A single quick-link entry containing a label and a URL.
- **Local_Storage**: The browser's `localStorage` API used to persist all user data client-side.
- **Session**: A single completed Pomodoro interval (default 25 minutes).

---

## Requirements

### Requirement 1: Greeting Widget

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the dashboard, so that I have immediate situational awareness without checking another app.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM format, updated every second.
2. THE Greeting_Widget SHALL display the current date in a human-readable format (e.g., "Monday, July 14, 2025").
3. WHEN the local time is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good Morning".
4. WHEN the local time is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
5. WHEN the local time is between 18:00 and 20:59, THE Greeting_Widget SHALL display the greeting "Good Evening".
6. WHEN the local time is between 21:00 and 04:59, THE Greeting_Widget SHALL display the greeting "Good Night".

---

### Requirement 2: Focus Timer (Pomodoro)

**User Story:** As a user, I want a Pomodoro-style countdown timer, so that I can manage my focus sessions and take structured breaks.

#### Acceptance Criteria

1. THE Timer SHALL initialise with a default duration of 25 minutes (1500 seconds).
2. WHEN the user activates the Start control, THE Timer SHALL begin counting down one second per real-world second.
3. WHILE the Timer is counting down, THE Timer SHALL display the remaining time in MM:SS format.
4. WHEN the user activates the Stop control, THE Timer SHALL pause the countdown and retain the remaining time.
5. WHEN the user activates the Reset control, THE Timer SHALL stop the countdown and restore the display to the configured duration.
6. WHEN the countdown reaches 00:00, THE Timer SHALL stop automatically and notify the user that the session has ended (e.g., via a browser notification or an audible alert).
7. WHERE the configurable duration feature is enabled, THE Timer SHALL allow the user to set a custom session duration in whole minutes between 1 and 99 before a session starts.
8. IF the user attempts to change the duration while the Timer is counting down, THEN THE Timer SHALL ignore the change and retain the current countdown.

---

### Requirement 3: To-Do List

**User Story:** As a user, I want to add, edit, complete, and delete tasks in a persistent to-do list, so that I can track what I need to accomplish during my work sessions.

#### Acceptance Criteria

1. WHEN the user submits a non-empty task title, THE TodoList SHALL add a new Task with a unique identifier, the provided title, a completion state of false, and the current timestamp.
2. IF the user submits a task title that is empty or contains only whitespace, THEN THE TodoList SHALL reject the submission and display an inline validation message.
3. WHERE duplicate-prevention is enabled, IF the user submits a task title that matches an existing incomplete Task title (case-insensitive), THEN THE TodoList SHALL reject the submission and display a duplicate-warning message.
4. WHEN the user activates the edit control for a Task, THE TodoList SHALL allow the user to modify the Task title inline and save the updated title on confirmation.
5. IF the user saves an edited Task title that is empty or contains only whitespace, THEN THE TodoList SHALL reject the edit and retain the original title.
6. WHEN the user marks a Task as complete, THE TodoList SHALL update the Task's completion state to true and apply a visual distinction (e.g., strikethrough).
7. WHEN the user marks a completed Task as incomplete, THE TodoList SHALL update the Task's completion state to false and remove the visual distinction.
8. WHEN the user activates the delete control for a Task, THE TodoList SHALL remove the Task from the list permanently.
9. THE TodoList SHALL persist all Tasks to Local_Storage after every add, edit, complete, or delete operation.
10. WHEN the Dashboard loads, THE TodoList SHALL restore all Tasks from Local_Storage and render them in their last-saved state.
11. WHERE task sorting is enabled, WHEN the user selects a sort order (alphabetical ascending, alphabetical descending, or by creation date), THE TodoList SHALL re-render all Tasks in the selected order without altering the stored data.

---

### Requirement 4: Quick Links

**User Story:** As a user, I want to save and access my favourite website links as clickable buttons on the dashboard, so that I can navigate to frequently used pages with a single click.

#### Acceptance Criteria

1. WHEN the user provides a label and a valid URL and submits the add-link form, THE QuickLinks SHALL add a new Link and display it as a labelled button.
2. IF the user submits an add-link form with an empty label or an invalid URL, THEN THE QuickLinks SHALL reject the submission and display an inline validation message.
3. WHEN the user activates a Link button, THE QuickLinks SHALL open the associated URL in a new browser tab.
4. WHEN the user activates the delete control for a Link, THE QuickLinks SHALL remove the Link from the panel.
5. THE QuickLinks SHALL persist all Links to Local_Storage after every add or delete operation.
6. WHEN the Dashboard loads, THE QuickLinks SHALL restore all Links from Local_Storage and render them as labelled buttons.

---

### Requirement 5: Data Persistence and Storage

**User Story:** As a user, I want my tasks and links to survive page refreshes and browser restarts, so that I do not lose my data between sessions.

#### Acceptance Criteria

1. THE Dashboard SHALL store all Tasks under a single, namespaced Local_Storage key (e.g., `dashboard_tasks`).
2. THE Dashboard SHALL store all Links under a single, namespaced Local_Storage key (e.g., `dashboard_links`).
3. THE Dashboard SHALL store the user-configured Timer duration under a dedicated Local_Storage key (e.g., `dashboard_timer_duration`).
4. IF Local_Storage is unavailable or a read operation returns malformed JSON, THEN THE Dashboard SHALL fall back to an empty default state and display a non-blocking warning to the user.
5. THE Dashboard SHALL NOT transmit any user data outside of the browser.

---

### Requirement 6: Layout and Visual Design

**User Story:** As a user, I want a clean, readable, and visually organised dashboard layout, so that I can use it comfortably for extended periods.

#### Acceptance Criteria

1. THE Dashboard SHALL render all four widgets (Greeting_Widget, Timer, TodoList, QuickLinks) on a single HTML page without requiring navigation.
2. THE Dashboard SHALL use a single CSS file located at `css/style.css` and a single JavaScript file located at `js/app.js`.
3. THE Dashboard SHALL apply a clear visual hierarchy using typography, spacing, and colour to distinguish widget sections.
4. THE Dashboard SHALL be fully functional in the latest stable releases of Chrome, Firefox, Edge, and Safari without requiring additional plugins.
5. WHEN the viewport width is below 768 px, THE Dashboard SHALL reflow the layout so that each widget occupies the full available width.

---

### Requirement 7: Performance

**User Story:** As a user, I want the dashboard to load and respond instantly, so that it does not interrupt my focus workflow.

#### Acceptance Criteria

1. THE Dashboard SHALL complete initial page load and render all widgets within 2 seconds on a modern device with a cached local file.
2. WHEN the user performs any interactive action (add, edit, delete, start timer), THE Dashboard SHALL reflect the change in the UI within 100 ms.
3. THE Dashboard SHALL NOT introduce any external network requests (no CDN fonts, no remote scripts, no analytics) unless the user navigates via a Quick Link.
