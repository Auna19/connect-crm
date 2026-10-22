import { NextResponse } from 'next/server';
import { getConnectors, addExecutionLog } from '@/lib/db';
import { decryptSecret, redactSecrets } from '@/lib/encryption';

export async function POST(request) {
  const startTime = Date.now();
  const correlationId = 'exp-' + Math.random().toString(36).substring(2, 9);

  try {
    const body = await request.json();
    const { method = 'GET', endpoint = '/api/stats', headers = {}, body: reqBody, connectorId } = body;

    // Resolve connector credentials if connector specified
    const finalHeaders = { ...headers };
    let connectorName = 'API Explorer Direct';

    if (connectorId) {
      const connector = getConnectors().find(c => c.id === connectorId);
      if (connector) {
        connectorName = connector.name;
        if (connector.encryptedSecret && connector.secretHeaderName) {
          try {
            const secret = decryptSecret(connector.encryptedSecret);
            if (connector.authType === 'bearer') {
              finalHeaders[connector.secretHeaderName] = `Bearer ${secret}`;
            } else {
              finalHeaders[connector.secretHeaderName] = secret;
            }
          } catch (e) {
            console.error('Decryption failed for explorer request:', e);
          }
        }
      }
    }

    // Determine internal routing or external dispatch
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${protocol}://${host}${endpoint}`;

    let status = 200;
    let resData = null;
    let durationMs = 0;

    try {
      const fetchOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...finalHeaders
        }
      };
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && reqBody) {
        fetchOptions.body = typeof reqBody === 'string' ? reqBody : JSON.stringify(reqBody);
      }

      const res = await fetch(fullUrl, fetchOptions);
      status = res.status;
      durationMs = Date.now() - startTime;
      const text = await res.text();
      try {
        resData = JSON.parse(text);
      } catch {
        resData = { rawResponse: text };
      }
    } catch (fetchError) {
      status = 500;
      durationMs = Date.now() - startTime;
      resData = { error: fetchError.message };
    }

    // Build copyable cURL with redacted placeholders
    const safeHeaders = redactSecrets(finalHeaders);
    let curlHeaders = Object.entries(safeHeaders)
      .map(([k, v]) => `-H "${k}: ${v}"`)
      .join(' ');
    let curl = `curl -X ${method} "${fullUrl}" ${curlHeaders}`;
    if (reqBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
      const bodyStr = typeof reqBody === 'string' ? reqBody : JSON.stringify(reqBody);
      curl += ` -d '${bodyStr}'`;
    }

    addExecutionLog({
      correlationId,
      integrationName: connectorName,
      operation: 'api_explorer_request',
      environment: 'development',
      method,
      endpoint,
      httpStatus: status,
      durationMs,
      result: status < 400 ? 'success' : 'error',
      error: status >= 400 ? (resData?.error || `HTTP ${status}`) : null
    });

    return NextResponse.json({
      success: status < 400,
      status,
      durationMs,
      correlationId,
      curl,
      sanitizedHeaders: safeHeaders,
      response: resData
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
