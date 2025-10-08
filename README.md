# redoist-todo-app

## API Documentation

The API documentation is available at `/api/docs` when the server is running. Open your browser and navigate to: 
http://localhost:8080/api/docs
This documentation provides details about all available endpoints, their parameters, and response formats.

## MVP (Release 1)
### Must-have features
1. Auth
- Email/password sign up & login (JWT)
- Password reset via emailed magic link (stub mailer ok for MVP)
2. Projects
- Create/rename/archive projects
- Project color/icon
3. Tasks
- Create/edit/delete
- Title (required), description, due date, priority, project
- Complete/incomplete toggle
- Quick filters: Today, Upcoming (next 7 days), All, by project
- Search by title/description (prefix text search)
4. UI
- Inbox (no project) + Projects list
- “Today” and “Upcoming” views
- Responsive (desktop first, mobile OK)
5. Quality bar
- Error states & empty states
- Form validation
- Basic analytics (page views, task create)
Non-functional MVP targets
- P50 add/edit task < 150ms server time
- Handle 5k tasks per user without visible lag in list views (pagination or windowing)
- A11y: keyboard navigable task list, focus states, labels
- Tests: 15–20 unit tests (backend) + 3–5 critical e2e flows
## Future (Release 2+)
- Recurring tasks (RRULE-style: daily/weekly/monthly; generate next occurrence on completion)
- Natural-language input (“pay rent every month on the 1st @high #home”)
- Subtasks + checklists
- Tags (cross-project organization)
- Drag & drop ordering and project re-assignment
- Calendar view (month/week) + iCal export
- Notifications (email or web push; daily digest)
- Offline-first with optimistic UI (IndexedDB + background sync)
- Collaboration: shared projects, task assignees, comments, activity log
- Insights: streaks, completed-per-week, priorities distribution

