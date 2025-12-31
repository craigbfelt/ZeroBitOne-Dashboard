# API Documentation

## Ticket Ingestion Webhook

### Endpoint

```
POST /api/ingest/tickets/[tenant]
```

### Description

Create tickets for a specific tenant via webhook. The tenant is specified in the URL path, and the ticket data is sent in the request body.

### URL Parameters

| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| tenant    | string | Yes      | The tenant name (e.g., "oricol-es", "soca5")  |

### Request Body

| Field        | Type   | Required | Description                                           |
|--------------|--------|----------|-------------------------------------------------------|
| title        | string | Yes      | The ticket title                                      |
| description  | string | No       | Detailed description of the ticket                    |
| status       | string | No       | Ticket status (default: "open")                       |
| priority     | string | No       | Priority level (default: "medium")                    |
| app_id       | UUID   | No       | ID of the associated app                              |
| external_id  | string | No       | External system identifier                            |
| metadata     | object | No       | Additional metadata as JSON object (default: {})      |

### Request Example

```bash
curl -X POST https://your-domain.vercel.app/api/ingest/tickets/oricol-es \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bug: Login not working",
    "description": "Users cannot log in with their email credentials",
    "status": "open",
    "priority": "high",
    "external_id": "JIRA-1234",
    "metadata": {
      "source": "jira",
      "reporter": "john.doe@example.com",
      "tags": ["bug", "authentication"]
    }
  }'
```

### Success Response

**Status Code:** `201 Created`

```json
{
  "message": "Ticket created successfully",
  "ticket": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "tenant_id": "11111111-1111-1111-1111-111111111111",
    "title": "Bug: Login not working",
    "description": "Users cannot log in with their email credentials",
    "status": "open",
    "priority": "high",
    "app_id": null,
    "assigned_to": null,
    "created_by": null,
    "external_id": "JIRA-1234",
    "metadata": {
      "source": "jira",
      "reporter": "john.doe@example.com",
      "tags": ["bug", "authentication"]
    },
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Required Fields

```json
{
  "error": "Missing required field: title is required"
}
```

#### 404 Not Found - Tenant Not Found

```json
{
  "error": "Tenant 'invalid-tenant' not found"
}
```

#### 500 Internal Server Error

```json
{
  "error": "Failed to create ticket",
  "details": "Database error message"
}
```

### Testing the Endpoint

You can test the endpoint documentation by making a GET request:

```bash
curl https://your-domain.vercel.app/api/ingest/tickets/oricol-es
```

**Response:**

```json
{
  "message": "Ticket ingestion endpoint active for tenant: oricol-es",
  "usage": "POST to this endpoint with ticket data in JSON format",
  "endpoint": "/api/ingest/tickets/oricol-es",
  "required_fields": ["title"],
  "optional_fields": ["description", "status", "priority", "app_id", "external_id", "metadata"],
  "example": {
    "title": "Bug: Login not working",
    "description": "Users cannot log in with their credentials",
    "status": "open",
    "priority": "high",
    "external_id": "JIRA-123",
    "metadata": {
      "source": "external-system"
    }
  }
}
```

## Integration Examples

### JavaScript/Node.js

```javascript
async function createTicket(tenant, ticketData) {
  const response = await fetch(`https://your-domain.vercel.app/api/ingest/tickets/${tenant}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ticketData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Usage
const ticket = await createTicket('oricol-es', {
  title: 'New feature request',
  description: 'Add dark mode support',
  priority: 'low',
  metadata: { requested_by: 'user@example.com' }
});
```

### Python

```python
import requests

def create_ticket(tenant, ticket_data):
    url = f"https://your-domain.vercel.app/api/ingest/tickets/{tenant}"
    headers = {"Content-Type": "application/json"}
    
    response = requests.post(url, json=ticket_data, headers=headers)
    response.raise_for_status()
    
    return response.json()

# Usage
ticket = create_ticket('oricol-es', {
    'title': 'New feature request',
    'description': 'Add dark mode support',
    'priority': 'low',
    'metadata': {'requested_by': 'user@example.com'}
})
```

### cURL

```bash
# Create a simple ticket
curl -X POST https://your-domain.vercel.app/api/ingest/tickets/soca5 \
  -H "Content-Type: application/json" \
  -d '{"title": "Quick bug fix needed"}'

# Create a detailed ticket
curl -X POST https://your-domain.vercel.app/api/ingest/tickets/soca5 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Performance issue on dashboard",
    "description": "Dashboard loads slowly for users with large datasets",
    "status": "open",
    "priority": "high",
    "external_id": "SUP-789",
    "metadata": {
      "affected_users": 15,
      "avg_load_time": "8.5s"
    }
  }'
```

## Rate Limiting

Currently, there are no rate limits on the webhook endpoint. For production use, consider:

1. Implementing rate limiting middleware
2. Adding API key authentication
3. Setting up webhook signature verification
4. Monitoring usage via Vercel Analytics

## Security Considerations

1. **Authentication**: The current endpoint doesn't require authentication. For production:
   - Add API key authentication
   - Implement webhook signature verification
   - Use IP whitelisting if applicable

2. **Validation**: All input is validated:
   - Required fields are checked
   - Tenant existence is verified
   - Invalid data returns appropriate errors

3. **RLS Bypass**: The endpoint uses the Supabase client which respects RLS policies. Ensure your RLS policies are correctly configured.

## Available Tenants

From the seed data:

- `oricol-es` - Oricol ES (standard tenant)
- `soca5` - Soca5 (standard tenant)  
- `personal` - Personal (personal tenant)

## Support

For questions or issues with the API:
- Check the main README.md
- Review the SETUP.md guide
- Examine the source code in `app/api/ingest/tickets/[tenant]/route.ts`
