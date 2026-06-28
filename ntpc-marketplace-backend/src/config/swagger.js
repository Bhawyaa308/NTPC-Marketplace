const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NTPC Marketplace API',
      version: '1.0.0',
      description: 'RESTful API for NTPC Marketplace with JWT authentication',
      contact: {
        name: 'API Support',
        email: 'support@ntpcmarketplace.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.ntpcmarketplace.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        // Error Schemas
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Bad Request',
            },
            message: {
              type: 'string',
              example: 'Invalid input data',
            },
          },
        },
        NotFound: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Not Found',
            },
            message: {
              type: 'string',
              example: 'The requested resource does not exist',
            },
          },
        },
        Unauthorized: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Unauthorized',
            },
          },
        },

        // Auth Schemas
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'full_name'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'SecurePassword123!',
            },
            full_name: {
              type: 'string',
              example: 'John Doe',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'SecurePassword123!',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'User registered successfully',
            },
            data: {
              type: 'object',
              properties: {
                user_id: {
                  type: 'integer',
                  example: 1,
                },
                email: {
                  type: 'string',
                  example: 'user@example.com',
                },
                full_name: {
                  type: 'string',
                  example: 'John Doe',
                },
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            user_id: {
              type: 'integer',
              example: 1,
            },
            email: {
              type: 'string',
              example: 'user@example.com',
            },
            full_name: {
              type: 'string',
              example: 'John Doe',
            },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN', 'SUPER_ADMIN'],
              example: 'USER',
            },
            is_active: {
              type: 'boolean',
              example: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-01T10:00:00Z',
            },
          },
        },

        // Listing Schemas
        CreateListingRequest: {
          type: 'object',
          required: ['title', 'description', 'price', 'category_id', 'condition'],
          properties: {
            title: {
              type: 'string',
              example: 'iPhone 13 Pro',
            },
            description: {
              type: 'string',
              example: 'Excellent condition, barely used',
            },
            price: {
              type: 'number',
              example: 899.99,
            },
            category_id: {
              type: 'integer',
              example: 1,
            },
            condition: {
              type: 'string',
              enum: ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'],
              example: 'LIKE_NEW',
            },
            quantity: {
              type: 'integer',
              example: 1,
            },
          },
        },
        Listing: {
          type: 'object',
          properties: {
            listing_id: {
              type: 'integer',
              example: 1,
            },
            user_id: {
              type: 'integer',
              example: 1,
            },
            title: {
              type: 'string',
              example: 'iPhone 13 Pro',
            },
            description: {
              type: 'string',
              example: 'Excellent condition, barely used',
            },
            price: {
              type: 'number',
              example: 899.99,
            },
            category_id: {
              type: 'integer',
              example: 1,
            },
            condition: {
              type: 'string',
              example: 'LIKE_NEW',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'SOLD', 'EXPIRED'],
              example: 'ACTIVE',
            },
            quantity: {
              type: 'integer',
              example: 1,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-01T10:00:00Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-01T10:00:00Z',
            },
          },
        },

        // Search Schemas
        SearchSuggestion: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['CATEGORY', 'LISTING'],
              example: 'CATEGORY',
            },
            text: {
              type: 'string',
              example: 'Electronics',
            },
            category_id: {
              type: 'integer',
              example: 1,
            },
          },
        },
        SearchResult: {
          type: 'object',
          properties: {
            listing_id: {
              type: 'integer',
              example: 1,
            },
            title: {
              type: 'string',
              example: 'iPhone 13 Pro',
            },
            description: {
              type: 'string',
              example: 'Excellent condition, barely used',
            },
            price: {
              type: 'number',
              example: 899.99,
            },
            condition: {
              type: 'string',
              example: 'LIKE_NEW',
            },
            category_id: {
              type: 'integer',
              example: 1,
            },
          },
        },

        // Wishlist Schemas
        WishlistItem: {
          type: 'object',
          properties: {
            wishlist_id: {
              type: 'integer',
              example: 1,
            },
            user_id: {
              type: 'integer',
              example: 1,
            },
            listing_id: {
              type: 'integer',
              example: 1,
            },
            listing: {
              $ref: '#/components/schemas/Listing',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-01T10:00:00Z',
            },
          },
        },

        // Reservation Schemas
        CreateReservationRequest: {
          type: 'object',
          required: ['listing_id', 'duration_days'],
          properties: {
            listing_id: {
              type: 'integer',
              example: 1,
            },
            duration_days: {
              type: 'integer',
              example: 7,
            },
          },
        },
        Reservation: {
          type: 'object',
          properties: {
            reservation_id: {
              type: 'integer',
              example: 1,
            },
            listing_id: {
              type: 'integer',
              example: 1,
            },
            buyer_id: {
              type: 'integer',
              example: 2,
            },
            seller_id: {
              type: 'integer',
              example: 1,
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
              example: 'PENDING',
            },
            start_date: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-05T10:00:00Z',
            },
            end_date: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-12T10:00:00Z',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-01T10:00:00Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-01T10:00:00Z',
            },
          },
        },

        // Order Schemas
        CreateOrderRequest: {
          type: 'object',
          required: ['reservation_id', 'delivery_address'],
          properties: {
            reservation_id: {
              type: 'integer',
              example: 1,
            },
            delivery_address: {
              type: 'string',
              example: '123 Main St, City, State 12345',
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            order_id: {
              type: 'integer',
              example: 1,
            },
            reservation_id: {
              type: 'integer',
              example: 1,
            },
            buyer_id: {
              type: 'integer',
              example: 2,
            },
            seller_id: {
              type: 'integer',
              example: 1,
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'],
              example: 'PENDING',
            },
            total_price: {
              type: 'number',
              example: 899.99,
            },
            delivery_address: {
              type: 'string',
              example: '123 Main St, City, State 12345',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-01T10:00:00Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-01T10:00:00Z',
            },
          },
        },

        // Payment Schemas
        SimulatePaymentRequest: {
          type: 'object',
          required: ['payment_method'],
          properties: {
            payment_method: {
              type: 'string',
              example: 'CREDIT_CARD',
            },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            payment_id: {
              type: 'integer',
              example: 1,
            },
            order_id: {
              type: 'integer',
              example: 1,
            },
            buyer_id: {
              type: 'integer',
              example: 2,
            },
            amount: {
              type: 'number',
              example: 899.99,
            },
            payment_method: {
              type: 'string',
              example: 'CREDIT_CARD',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'SUCCESS', 'FAILED'],
              example: 'SUCCESS',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-01T10:00:00Z',
            },
          },
        },

        // Chat Schemas
        CreateChatRoomRequest: {
          type: 'object',
          required: ['listing_id', 'other_user_id'],
          properties: {
            listing_id: {
              type: 'integer',
              example: 1,
            },
            other_user_id: {
              type: 'integer',
              example: 2,
            },
          },
        },
        ChatRoom: {
          type: 'object',
          properties: {
            room_id: {
              type: 'integer',
              example: 1,
            },
            listing_id: {
              type: 'integer',
              example: 1,
            },
            buyer_id: {
              type: 'integer',
              example: 2,
            },
            seller_id: {
              type: 'integer',
              example: 1,
            },
            last_message_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-01T10:00:00Z',
            },
            is_active: {
              type: 'boolean',
              example: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-01T10:00:00Z',
            },
          },
        },
        SendMessageRequest: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string',
              example: 'Hi, are you still selling this?',
            },
          },
        },
        Message: {
          type: 'object',
          properties: {
            message_id: {
              type: 'integer',
              example: 1,
            },
            room_id: {
              type: 'integer',
              example: 1,
            },
            sender_id: {
              type: 'integer',
              example: 1,
            },
            message: {
              type: 'string',
              example: 'Hi, are you still selling this?',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-01T10:00:00Z',
            },
          },
        },

        // Notification Schemas
        Notification: {
          type: 'object',
          properties: {
            notification_id: {
              type: 'integer',
              example: 1,
            },
            user_id: {
              type: 'integer',
              example: 1,
            },
            title: {
              type: 'string',
              example: 'New Reservation',
            },
            message: {
              type: 'string',
              example: 'A buyer has reserved your listing: iPhone 13 Pro',
            },
            type: {
              type: 'string',
              enum: [
                'RESERVATION',
                'RESERVATION_APPROVED',
                'RESERVATION_REJECTED',
                'ORDER',
                'PAYMENT_SUCCESS',
                'CHAT_MESSAGE',
                'REPORT_RESOLVED',
                'REPORT_REJECTED',
              ],
              example: 'RESERVATION',
            },
            related_entity_type: {
              type: 'string',
              example: 'RESERVATION',
            },
            related_entity_id: {
              type: 'integer',
              example: 1,
            },
            is_read: {
              type: 'boolean',
              example: false,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-01T10:00:00Z',
            },
          },
        },

        // Admin Schemas
        ListingReport: {
          type: 'object',
          properties: {
            report_id: {
              type: 'integer',
              example: 1,
            },
            listing_id: {
              type: 'integer',
              example: 1,
            },
            reported_by: {
              type: 'integer',
              example: 2,
            },
            reviewed_by: {
              type: 'integer',
              example: 3,
            },
            reason: {
              type: 'string',
              example: 'Inappropriate content',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'RESOLVED', 'REJECTED'],
              example: 'PENDING',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-01T10:00:00Z',
            },
            resolved_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-02T10:00:00Z',
            },
          },
        },
        UserWithStatus: {
          type: 'object',
          properties: {
            user_id: {
              type: 'integer',
              example: 1,
            },
            email: {
              type: 'string',
              example: 'user@example.com',
            },
            full_name: {
              type: 'string',
              example: 'John Doe',
            },
            is_active: {
              type: 'boolean',
              example: true,
            },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN', 'SUPER_ADMIN'],
              example: 'USER',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-01T10:00:00Z',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec, swaggerUi };
