---
title: API Design
category: api
tags: [rest, graphql, endpoints, versioning]
version: 1.0.0
---

REST and GraphQL API design principles and best practices.
Use when designing new APIs, reviewing endpoint structures, or
implementing API versioning. Covers HTTP methods, status codes,
pagination, and error handling.

## REST Principles

### HTTP Methods
| Method | Usage | Idempotent |
|--------|-------|------------|
| GET | Retrieve resource | Yes |
| POST | Create resource | No |
| PUT | Replace resource | Yes |
| PATCH | Partial update | Yes |
| DELETE | Remove resource | Yes |

### URL Structure
```
# Good
GET    /users              # List users
GET    /users/123          # Get user 123
POST   /users              # Create user
PUT    /users/123          # Replace user 123
PATCH  /users/123          # Update user 123
DELETE /users/123          # Delete user 123

# Nested resources
GET    /users/123/orders   # User's orders
POST   /users/123/orders   # Create order for user

# Bad
GET    /getUsers
POST   /createUser
GET    /users/delete/123
```

## Status Codes

### Success (2xx)
- `200 OK` - General success
- `201 Created` - Resource created
- `204 No Content` - Success, no body (DELETE)

### Client Errors (4xx)
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource conflict
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limited

### Server Errors (5xx)
- `500 Internal Server Error` - Generic server error
- `502 Bad Gateway` - Upstream error
- `503 Service Unavailable` - Temporarily down

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ],
    "requestId": "abc-123-xyz"
  }
}
```

## Pagination

### Offset-based
```
GET /users?offset=20&limit=10
```

### Cursor-based (preferred for large datasets)
```
GET /users?cursor=eyJpZCI6MTAwfQ&limit=10
```

### Response
```json
{
  "data": [...],
  "pagination": {
    "total": 1000,
    "limit": 10,
    "offset": 20,
    "nextCursor": "eyJpZCI6MTEwfQ"
  }
}
```

## Versioning Strategies

### URL Path (recommended)
```
/api/v1/users
/api/v2/users
```

### Header
```
Accept: application/vnd.api+json; version=1
```

### Query Parameter
```
/api/users?version=1
```

## GraphQL Considerations

### When to Use
- Complex relationships between entities
- Clients need flexible queries
- Mobile apps with bandwidth concerns
- Rapid frontend iteration

### When REST is Better
- Simple CRUD operations
- File uploads/downloads
- Caching requirements
- Public APIs with clear contracts
