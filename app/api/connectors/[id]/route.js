import { NextResponse } from 'next/server';
import { getConnectorById, updateConnector, deleteConnector, addAuditLog } from '@/lib/db';
import { maskSecret } from '@/lib/encryption';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const conn = getConnectorById(id);
    if (!conn) {
      return NextResponse.json({ success: false, error: 'Connector not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      connector: {
        ...conn,
        hasSecret: Boolean(conn.encryptedSecret),
        maskedSecret: maskSecret(conn.encryptedSecret),
        encryptedSecret: undefined
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = updateConnector(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Connector not found' }, { status: 404 });
    }

    addAuditLog(
      'CONNECTOR_UPDATED',
      'Connector',
      id,
      `Connector "${updated.name}" updated. Fields modified: ${Object.keys(body).join(', ')}`
    );

    return NextResponse.json({
      success: true,
      connector: {
        ...updated,
        hasSecret: Boolean(updated.encryptedSecret),
        maskedSecret: maskSecret(updated.encryptedSecret),
        encryptedSecret: undefined
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const success = deleteConnector(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Connector not found' }, { status: 404 });
    }

    addAuditLog('CONNECTOR_DELETED', 'Connector', id, `Connector ${id} was deleted`);
    return NextResponse.json({ success: true, message: 'Connector deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
