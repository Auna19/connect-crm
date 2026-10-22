import { NextResponse } from 'next/server';
import { getConnectorById, updateConnector, addAuditLog } from '@/lib/db';
import { maskSecret } from '@/lib/encryption';
import crypto from 'crypto';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const connector = getConnectorById(id);

    if (!connector) {
      return NextResponse.json({ success: false, error: 'Connector not found' }, { status: 404 });
    }

    // Generate new secret or use provided
    const newSecret = body.newSecret || `sec_rot_${crypto.randomBytes(16).toString('hex')}`;

    const updated = updateConnector(id, {
      secret: newSecret
    });

    addAuditLog(
      'CONNECTOR_SECRET_ROTATED',
      'Connector',
      id,
      `Secret rotated for connector "${connector.name}". Old secret revoked, new AES-256-GCM cipher stored.`
    );

    return NextResponse.json({
      success: true,
      connectorId: id,
      maskedSecret: maskSecret(updated.encryptedSecret),
      message: 'Secret successfully rotated and securely encrypted at rest.'
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
