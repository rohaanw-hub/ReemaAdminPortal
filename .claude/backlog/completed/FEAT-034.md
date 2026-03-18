---
id: FEAT-034
title: Paginate student list with configurable page size
status: pending
priority: medium
created: 2026-03-18
assignee: unassigned
blockers: []
depends_on: []
---

## Context
The student list has 80 students and will grow. Pagination is needed to
make the list manageable. Search, filter, and sort must continue to work
across all students not just the current page.

## Description

### Pagination controls
Add pagination controls below the student table:
- Page size selector: "Show: 10 | 25 | 50 | 100 per page"
- Default: 25 per page
- Page navigation: Previous | 1 2 3 ... | Next
- Current page info: "Showing 26-50 of 80 students"

### Search and filter behaviour with pagination
- Search, filter, and sort apply to ALL students (full dataset)
- After applying a search or filter, pagination resets to page 1
- The "Showing X-Y of Z students" count reflects filtered results
  e.g. "Showing 1-25 of 34 students matching 'Emma'"
- Changing page size resets to page 1

### Sort behaviour with pagination
- Sorting applies across all students not just current page
- Sort indicator persists when changing pages

### Page size persistence
- Store selected page size in component state
- If user changes to 50 per page, switching pages keeps 50 per page
- Resets to 25 default on page refresh (in-memory only for prototype)

### Shared pagination hook
Create a usePagination(data, defaultPageSize) hook in src/hooks/:
- Takes filtered+sorted data array and default page size
- Returns: paginatedData, currentPage, totalPages, pageSize,
  setPage, setPageSize, paginationInfo
- Reusable for Employees list in future

## Affected files
- src/pages/Students.jsx — add pagination controls, wire up usePagination
- src/hooks/usePagination.js (create new) — shared pagination hook
- src/components/Pagination.jsx (create new) — pagination UI component

## Acceptance criteria
1. Student list shows 25 students by default
2. Page size selector offers 10, 25, 50, 100 options
3. Changing page size resets to page 1
4. Page navigation buttons work correctly
5. "Showing X-Y of Z students" count is accurate
6. Search filters all students and resets to page 1
7. Sort applies across all students not just current page
8. With no filters: 80 students across correct number of pages
9. npm run lint passes with zero warnings

## Test strategy
- Default load: verify 25 students shown, correct page count
- Change page size to 10: verify 10 students, 8 pages
- Search "Emma": verify filtered count and page reset
- Sort by name: navigate to page 2, verify sort continues
- Change to 50 per page: verify 50 students shown

## Dependencies
None
