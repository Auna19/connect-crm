import { NextResponse } from 'next/server';
import { getConnectors, createConnector, addAuditLog } from '@/lib/db';
import { maskSecret } from '@/lib/encryption';

export async function GET() {
  try {
    const connectors = getConnectors();
    // Return with masked secrets — never expose plaintext or raw ciphertext to frontend!
    const sanitized = connectors.map(c => ({
      ...c,
      hasSecret: Boolean(c.encryptedSecret),
      maskedSecret: maskSecret(c.encryptedSecret),
      encryptedSecret: undefined // Strip encrypted secret from response
    }));

    return NextResponse.json({ success: true, connectors: sanitized });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.webhookUrl) {
      return NextResponse.json({ success: false, error: 'Name and Webhook URL are required' }, { status: 400 });
    }

    const conn = createConnector(body);

    addAuditLog(
      'CONNECTOR_CREATED',
      'Connector',
      conn.id,
      `Connector "${conn.name}" created with authType=${conn.authType}, header=${conn.secretHeaderName}`
    );

    return NextResponse.json({
      success: true,
      connector: {
        ...conn,
        hasSecret: Boolean(conn.encryptedSecret),
        maskedSecret: maskSecret(conn.encryptedSecret),
        encryptedSecret: undefined
      }
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
