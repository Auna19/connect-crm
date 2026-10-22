import { NextResponse } from 'next/server';

const ROLE_PERMISSIONS = {
  admin: {
    canManageIntegrations: true,
    canViewSecrets: true,
    canRunTests: true,
    canManageCustomers: true,
    canManageOrders: true,
    canManageTickets: true,
    canManageCalendar: true,
    canViewAuditLogs: true,
    canResetDatabase: true
  },
  qa: {
    canManageIntegrations: true,
    canViewSecrets: false, // masked only
    canRunTests: true,
    canManageCustomers: true,
    canManageOrders: true,
    canManageTickets: true,
    canManageCalendar: true,
    canViewAuditLogs: true,
    canResetDatabase: true
  },
  agent: {
    canManageIntegrations: false,
    canViewSecrets: false,
    canRunTests: false,
    canManageCustomers: true,
    canManageOrders: true,
    canManageTickets: true,
    canManageCalendar: true,
    canViewAuditLogs: false,
    canResetDatabase: false
  },
  auditor: {
    canManageIntegrations: false,
    canViewSecrets: false,
    canRunTests: false,
    canManageCustomers: false,
    canManageOrders: false,
    canManageTickets: false,
    canManageCalendar: false,
    canViewAuditLogs: true,
    canResetDatabase: false
  }
};

export async function GET(request) {
  const role = request.headers.get('x-user-role') || 'qa';
  const validRole = ROLE_PERMISSIONS[role] ? role : 'qa';

  const user = {
    id: `usr-${validRole}`,
    name: validRole === 'admin' ? 'Alex Rivera (Admin)' :
          validRole === 'qa' ? 'Taylor Swift (QA Lead)' :
          validRole === 'agent' ? 'Jordan Hayes (Support Agent)' : 'Morgan Reed (Compliance Auditor)',
    email: `${validRole}@connectcrm.internal`,
    role: validRole,
    permissions: ROLE_PERMISSIONS[validRole]
  };

  return NextResponse.json({
    success: true,
    user,
    availableRoles: [
      { id: 'qa', name: 'QA Engineer', description: 'Can execute tests, simulate failures, and manage mock data' },
      { id: 'admin', name: 'Administrator', description: 'Full access to integrations, secrets, and system configuration' },
      { id: 'agent', name: 'Support Agent', description: 'Access to customer CRM, order tracking, and tickets' },
      { id: 'auditor', name: 'Read-only Auditor', description: 'Restricted to audit trails and execution logs' }
    ],
    rolePermissionsMatrix: ROLE_PERMISSIONS
  });
}
