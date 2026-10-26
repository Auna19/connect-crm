import { NextResponse } from 'next/server';
import { getUserById, getUserByEmail, updateUser, logAuditEvent } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    let user = null;
    if (id) {
      user = await getUserById(id);
    } else if (email) {
      user = await getUserByEmail(email);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    const { password: _, ...safeUser } = user;
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile.' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, phone, department, title, currentPassword, newPassword } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required.' },
        { status: 400 }
      );
    }

    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (department) updates.department = department;
    if (title) updates.title = title;

    if (newPassword) {
      if (currentPassword && user.password !== currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect.' },
          { status: 400 }
        );
      }
      updates.password = newPassword;
    }

    const updated = await updateUser(id, updates);

    logAuditEvent({
      userId: user.id,
      action: 'USER_PROFILE_UPDATED',
      entity: 'UserProfile',
      entityId: user.id,
      details: `Profile updated for ${user.email}.`
    });

    const { password: _, ...safeUser } = updated;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: safeUser
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update profile.' },
      { status: 500 }
    );
  }
}
