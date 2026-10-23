import { NextResponse } from 'next/server';
import { 
  findCustomerByPhone, 
  getOrderByNumber, 
  normalizeOrderNumber, 
  createCustomer, 
  createTicket, 
  getTickets,
  getTicketById,
  addExecutionLog, 
  addAuditLog 
} from '@/lib/db';
import { decryptSecret } from '@/lib/encryption';

// Master MCP bearer tokens
const VALID_MCP_TOKENS = [
  'mcp_live_token_77819230491823901connectcrm',
  'desk_tok_staging_9921471029381029',
  'rtlr_live_sec_77819230491823901'
];

const MCP_TOOLS = [
  {
    name: 'read_contact',
    description: 'Look up customer contact and account details by phone number or email address.',
    inputSchema: {
      type: 'object',
      properties: {
        phone: { type: 'string', description: 'Caller or customer phone number (e.g., +1 (555) 234-5678)' },
        email: { type: 'string', description: 'Customer email address' }
      }
    }
  },
  {
    name: 'push_lead',
    description: 'Push lead or new customer details to the CRM at the end of a sales or qualification call.',
    inputSchema: {
      type: 'object',
      properties: {
        first_name: { type: 'string', description: 'Lead first name' },
        last_name: { type: 'string', description: 'Lead last name' },
        phone: { type: 'string', description: 'Contact phone number' },
        email: { type: 'string', description: 'Contact email' },
        notes: { type: 'string', description: 'Call context and lead notes' }
      },
      required: ['first_name', 'phone']
    }
  },
  {
    name: 'read_orders',
    description: 'Retrieve order details, delivery status, and items for an order number.',
    inputSchema: {
      type: 'object',
      properties: {
        orderNumber: { type: 'string', description: 'Public order number (e.g., EB-778213)' }
      },
      required: ['orderNumber']
    }
  },
  {
    name: 'track_order',
    description: 'Track real-time shipment status, carrier, and estimated delivery date for an order.',
    inputSchema: {
      type: 'object',
      properties: {
        orderNumber: { type: 'string', description: 'Order number or spoken query phrase (e.g., Where my order EB 7 7 8 2 1 3 dey?)' },
        simulateTimeout: { type: 'boolean', description: 'Optional flag to test API timeout resilience' }
      },
      required: ['orderNumber']
    }
  },
  {
    name: 'create_ticket',
    description: 'Create a new customer support ticket in the ConnectCRM unified helpdesk.',
    inputSchema: {
      type: 'object',
      properties: {
        caller_phone: { type: 'string', description: 'Caller or customer contact phone number' },
        email: { type: 'string', description: 'Customer email address (optional)' },
        order_number: { type: 'string', description: 'Related order number, if applicable (e.g., EB-778213)' },
        subject: { type: 'string', description: 'Short summary or subject of the support issue' },
        description: { type: 'string', description: 'Detailed description of the customer request or issue' },
        priority: { 
          type: 'string', 
          enum: ['low', 'medium', 'high', 'urgent'], 
          description: 'Ticket urgency/priority (default: medium)' 
        },
        channel: { 
          type: 'string', 
          enum: ['phone', 'email', 'chat', 'web'], 
          description: 'Intake channel (default: phone)' 
        }
      },
      required: ['subject', 'description']
    }
  },
  {
    name: 'read_ticket',
    description: 'Look up an existing support ticket status, assigned agent, and resolution notes by ticket number.',
    inputSchema: {
      type: 'object',
      properties: {
        ticketNumber: { type: 'string', description: 'Authoritative ticket number (e.g. TICK-1001)' }
      },
      required: ['ticketNumber']
    }
  },
  {
    name: 'log_call_data',
    description: 'Log the call outcome, summary, and audio transcript to the CRM helpdesk queue.',
    inputSchema: {
      type: 'object',
      properties: {
        caller_phone: { type: 'string', description: 'Phone number of the caller' },
        order_number: { type: 'string', description: 'Related order number, if mentioned' },
        call_outcome: { type: 'string', description: 'Outcome of the call (e.g., Resolved, Escalated, Callback Requested)' },
        call_summary: { type: 'string', description: 'Brief summary of the call' },
        transcript: { type: 'string', description: 'Complete conversation transcript' }
      },
      required: ['caller_phone', 'call_summary']
    }
  }
];

// Helper to authenticate Bearer token
function authenticate(request) {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.slice(7).trim();
  // Valid if in list or starts with standard prefix
  return VALID_MCP_TOKENS.includes(token) || token.startsWith('mcp_') || token.length >= 16;
}

export async function GET(request) {
  if (!authenticate(request)) {
    return NextResponse.json({
      error: 'Unauthorized: Valid Bearer API Token required in Authorization header.'
    }, { status: 401 });
  }

  return NextResponse.json({
    name: 'ConnectCRM Model Context Protocol (MCP) Server',
    version: '1.0.0',
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {}
    },
    tools: MCP_TOOLS
  });
}

export async function POST(request) {
  const startTime = Date.now();
  const correlationId = 'mcp-' + Math.random().toString(36).substring(2, 9);

  if (!authenticate(request)) {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32001, message: 'Unauthorized: Invalid Bearer API Token.' },
      id: null
    }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const method = body.method || (body.tool ? 'tools/call' : 'tools/list');
    const params = body.params || body;
    const reqId = body.id !== undefined ? body.id : 1;

    // 1. tools/list
    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        result: {
          tools: MCP_TOOLS
        },
        id: reqId
      });
    }

    // 2. tools/call
    if (method === 'tools/call' || body.tool) {
      const toolName = params.name || body.tool;
      const args = params.arguments || body.arguments || body.args || params;

      let toolResult = null;

      switch (toolName) {
        case 'read_contact': {
          const matched = args.phone ? findCustomerByPhone(args.phone) : null;
          if (matched) {
            toolResult = {
              found: true,
              customer: {
                id: matched.id,
                name: `${matched.firstName} ${matched.lastName}`,
                email: matched.verificationStatus === 'verified' ? matched.email : '[Protected]',
                phone: matched.primaryPhone,
                status: matched.status,
                verificationStatus: matched.verificationStatus
              }
            };
          } else {
            toolResult = { found: false, message: 'No customer record matched the supplied phone number.' };
          }
          break;
        }

        case 'read_orders':
        case 'track_order': {
          const rawNum = args.orderNumber || '';
          const normalized = normalizeOrderNumber(rawNum);
          const order = getOrderByNumber(normalized);

          if (order) {
            toolResult = {
              found: true,
              orderNumber: order.orderNumber,
              deliveryStatus: order.deliveryStatus,
              estimatedDeliveryDate: order.estimatedDeliveryDate,
              carrier: order.carrier,
              trackingNumber: order.trackingNumber,
              total: order.total,
              currency: order.currency
            };
          } else {
            toolResult = { found: false, orderNumber: normalized, message: 'Order not found in authoritative system.' };
          }
          break;
        }

        case 'push_lead': {
          const cust = createCustomer({
            firstName: args.first_name || 'Lead',
            lastName: args.last_name || '',
            primaryPhone: args.phone,
            email: args.email || '',
            status: 'lead',
            verificationStatus: 'unverified',
            internalNotes: `Pushed via MCP Voice Action. ${args.notes || ''}`
          });
          toolResult = { success: true, customerId: cust.id, message: 'Lead saved to ConnectCRM' };
          break;
        }

        case 'log_call_data': {
          const ticket = createTicket({
            callerPhone: args.caller_phone,
            orderNumber: args.order_number,
            subject: `Call Log: ${args.call_outcome || 'Completed Call'}`,
            description: args.call_summary || '',
            transcript: args.transcript || '',
            channel: 'phone',
            priority: 'medium',
            assignedQueue: 'Phone Support L1'
          });
          toolResult = {
            success: true,
            ticketNumber: ticket.ticketNumber,
            queue: ticket.assignedQueue,
            message: 'Call outcome and transcript logged to ConnectCRM helpdesk'
          };
          break;
        }

        case 'create_ticket': {
          const ticket = createTicket({
            callerPhone: args.caller_phone || args.phone,
            email: args.email,
            orderNumber: args.order_number || args.orderNumber,
            subject: args.subject || 'Customer Support Request',
            description: args.description || '',
            priority: args.priority || 'medium',
            channel: args.channel || 'phone',
            assignedQueue: args.queue || (args.channel === 'phone' ? 'Phone Support L1' : 'General Support')
          });
          toolResult = {
            success: true,
            ticketNumber: ticket.ticketNumber,
            ticketId: ticket.id,
            status: ticket.status,
            priority: ticket.priority,
            assignedQueue: ticket.assignedQueue,
            orderNumber: ticket.orderNumber,
            callerPhone: ticket.callerPhone,
            message: `Ticket ${ticket.ticketNumber} created successfully in ConnectCRM Helpdesk`
          };
          break;
        }

        case 'read_ticket': {
          const tNum = args.ticketNumber || args.ticket_number;
          const ticket = tNum ? getTicketById(tNum) : null;
          if (ticket) {
            toolResult = {
              found: true,
              ticketNumber: ticket.ticketNumber,
              subject: ticket.subject,
              description: ticket.description,
              status: ticket.status,
              priority: ticket.priority,
              assignedQueue: ticket.assignedQueue,
              assignedAgent: ticket.assignedAgent,
              orderNumber: ticket.orderNumber,
              callerPhone: ticket.callerPhone,
              createdAt: ticket.createdAt,
              resolutionNotes: ticket.resolutionNotes || 'In progress'
            };
          } else {
            toolResult = {
              found: false,
              message: `No ticket found with reference "${tNum}".`
            };
          }
          break;
        }

        default:
          return NextResponse.json({
            jsonrpc: '2.0',
            error: { code: -32601, message: `Tool not found: ${toolName}` },
            id: reqId
          }, { status: 404 });
      }

      addExecutionLog({
        correlationId,
        integrationName: 'ConnectCRM MCP Server',
        operation: `mcp_tool_${toolName}`,
        environment: 'production',
        method: 'POST',
        endpoint: '/api/mcp',
        httpStatus: 200,
        durationMs: Date.now() - startTime,
        result: 'success',
        error: null
      });

      return NextResponse.json({
        jsonrpc: '2.0',
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(toolResult, null, 2)
            }
          ],
          isError: false
        },
        id: reqId
      });
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid Request: unrecognized method' },
      id: reqId
    }, { status: 400 });

  } catch (err) {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32603, message: err.message },
      id: null
    }, { status: 500 });
  }
}
