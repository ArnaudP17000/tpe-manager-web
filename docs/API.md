# API Documentation

TPE Manager REST API documentation.

## Base URL

- Development: `http://localhost:8000`
- Through Nginx: `http://localhost/api`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Get Token

```http
POST /api/auth/login
Content-Type: multipart/form-data

username=admin&password=admin123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Use Token

Include the token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### TPE Management

#### List All TPE
```http
GET /api/tpe/?page=1&page_size=10&search=&tpe_model=&connection_type=
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (integer, default: 1): Page number
- `page_size` (integer, default: 10): Items per page
- `search` (string, optional): Search by service name or ShopID
- `tpe_model` (string, optional): Filter by model (Ingenico Desk 5000 | Ingenico Move 5000)
- `connection_type` (string, optional): Filter by connection (ethernet | 4g5g)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "service_name": "Service A",
      "shop_id": "SHOP-12345678",
      "regisseur_prenom": "John",
      "regisseur_nom": "Doe",
      "regisseur_telephone": "0123456789",
      "regisseurs_suppleants": "Jane Doe",
      "merchant_cards": [
        {
          "numero": "1234567890",
          "numero_serie_tpe": "ABC123"
        }
      ],
      "tpe_model": "Ingenico Desk 5000",
      "number_of_tpe": 2,
      "connection_ethernet": true,
      "connection_4g5g": false,
      "network_ip_address": "192.168.1.100",
      "network_mask": "255.255.255.0",
      "network_gateway": "192.168.1.1",
      "backoffice_active": true,
      "backoffice_email": "backoffice@example.com",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ],
  "total": 100,
  "page": 1,
  "page_size": 10,
  "total_pages": 10
}
```

#### Get TPE by ID
```http
GET /api/tpe/{id}
Authorization: Bearer {token}
```

#### Create TPE
```http
POST /api/tpe/
Authorization: Bearer {token}
Content-Type: application/json

{
  "service_name": "Service A",
  "shop_id": "SHOP-12345678",
  "regisseur_prenom": "John",
  "regisseur_nom": "Doe",
  "regisseur_telephone": "0123456789",
  "merchant_cards": [
    {
      "numero": "1234567890",
      "numero_serie_tpe": "ABC123"
    }
  ],
  "tpe_model": "Ingenico Desk 5000",
  "number_of_tpe": 2,
  "connection_ethernet": true,
  "network_ip_address": "192.168.1.100",
  "network_mask": "255.255.255.0",
  "network_gateway": "192.168.1.1",
  "backoffice_active": true,
  "backoffice_email": "backoffice@example.com"
}
```

#### Update TPE
```http
PUT /api/tpe/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "service_name": "Updated Service Name"
}
```

#### Delete TPE
```http
DELETE /api/tpe/{id}
Authorization: Bearer {token}
```

#### Get Statistics
```http
GET /api/tpe/stats/summary
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total": 100,
  "desk_count": 60,
  "move_count": 40,
  "ethernet_count": 70,
  "mobile_count": 50,
  "backoffice_active_count": 80
}
```

#### Export to Excel
```http
GET /api/tpe/export/excel
Authorization: Bearer {token}
```

Returns an Excel file (.xlsx) with all TPE data.

### User Management (Admin Only)

#### List Users
```http
GET /api/users/
Authorization: Bearer {token}
```

#### Create User
```http
POST /api/users/
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword",
  "role": "user"
}
```

#### Update User
```http
PUT /api/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newemail@example.com",
  "role": "admin"
}
```

#### Delete User
```http
DELETE /api/users/{id}
Authorization: Bearer {token}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Interactive Documentation

Visit http://localhost:8000/docs for interactive Swagger UI documentation where you can:
- View all endpoints
- Test API calls
- See request/response schemas
- Authorize with JWT token

## Rate Limiting

Currently, there are no rate limits, but it's recommended to implement rate limiting in production.

## Versioning

Current API version: v1

All endpoints are prefixed with `/api/`.
