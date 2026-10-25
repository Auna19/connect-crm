import { NextResponse } from 'next/server';
import { createUser, logAuditEvent } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role, phone, department, title } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    try {
      const newUser = createUser({
        name,
        email,
        password,
        role: role || 'agent',
        phone,
        department,
        title
      });

      logAuditEvent({
        userId: newUser.id,
        action: 'USER_REGISTERED',
        entity: 'User',
        entityId: newUser.id,
        details: `New account created for ${newUser.name} (${newUser.email}) with role ${newUser.role}.`
      });

      // Strip password from returned payload
      const { password: _, ...safeUser } = newUser;

      return NextResponse.json({
        success: true,
        message: 'Registration successful! You may now log in.',
        user: safeUser
      });
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: 409 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process registration.' },
      { status: 500 }
    );
  }
}
