import { neon } from '@neondatabase/serverless';

function getConnectionString() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.STORAGE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.NEON_DATABASE_URL ||
    ''
  );
}

export function isNeonEnabled() {
  return Boolean(getConnectionString());
}

let cachedSql = null;
let tablesInitialized = false;

export function getNeonSql() {
  const conn = getConnectionString();
  if (!conn) return null;
  if (!cachedSql) {
    cachedSql = neon(conn);
  }
  return cachedSql;
}

export async function ensureNeonTables() {
  const sql = getNeonSql();
  if (!sql || tablesInitialized) return;

  try {
    // 1. Users table
    await sql`
      CREATE TABLE IF NOT EXISTS crm_users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'agent',
        phone TEXT DEFAULT '+1 (555) 000-0000',
        department TEXT DEFAULT 'Operations',
        title TEXT DEFAULT 'Platform Operator',
        status TEXT DEFAULT 'active',
        avatar TEXT DEFAULT 'US',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Password resets table
    await sql`
      CREATE TABLE IF NOT EXISTS crm_password_resets (
        email TEXT PRIMARY KEY,
        otp TEXT NOT NULL,
        expires_at BIGINT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Document / Collection store for CRM data
    await sql`
      CREATE TABLE IF NOT EXISTS crm_store (
        key TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Check if initial seed users are populated
    const existing = await sql`SELECT COUNT(*)::int as count FROM crm_users;`;
    if (existing[0]?.count === 0) {
      await sql`
        INSERT INTO crm_users (id, name, email, password, role, phone, department, title, status, avatar)
        VALUES 
          ('usr-admin', 'Alex Rivera', 'admin@connectcrm.internal', 'Password123!', 'admin', '+1 (555) 901-2345', 'Platform Engineering', 'Lead Solutions Architect', 'active', 'AR'),
          ('usr-qa', 'Taylor Swift', 'qa@connectcrm.internal', 'Password123!', 'qa', '+1 (555) 901-6789', 'Quality Assurance', 'QA Lead Engineer', 'active', 'TS'),
          ('usr-agent', 'Jordan Hayes', 'agent@connectcrm.internal', 'Password123!', 'agent', '+1 (555) 901-4433', 'Customer Operations', 'Senior Support Specialist', 'active', 'JH'),
          ('usr-auditor', 'Morgan Reed', 'auditor@connectcrm.internal', 'Password123!', 'auditor', '+1 (555) 901-8822', 'Compliance & Security', 'Security Auditor', 'active', 'MR')
        ON CONFLICT (email) DO NOTHING;
      `;
    }

    tablesInitialized = true;
  } catch (err) {
    console.error('Error initializing Neon tables:', err);
  }
}

// User Methods for Neon
export async function neonGetUsers() {
  await ensureNeonTables();
  const sql = getNeonSql();
  const rows = await sql`SELECT * FROM crm_users ORDER BY created_at ASC;`;
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    password: r.password,
    role: r.role,
    phone: r.phone,
    department: r.department,
    title: r.title,
    status: r.status,
    avatar: r.avatar,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));
}

export async function neonGetUserByEmail(email) {
  if (!email) return null;
  await ensureNeonTables();
  const sql = getNeonSql();
  const normalized = email.toLowerCase().trim();
  const rows = await sql`
    SELECT * FROM crm_users 
    WHERE LOWER(email) = ${normalized}
    LIMIT 1;
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    password: r.password,
    role: r.role,
    phone: r.phone,
    department: r.department,
    title: r.title,
    status: r.status,
    avatar: r.avatar,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

export async function neonGetUserById(id) {
  if (!id) return null;
  await ensureNeonTables();
  const sql = getNeonSql();
  const rows = await sql`
    SELECT * FROM crm_users 
    WHERE id = ${id}
    LIMIT 1;
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    password: r.password,
    role: r.role,
    phone: r.phone,
    department: r.department,
    title: r.title,
    status: r.status,
    avatar: r.avatar,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

export async function neonCreateUser(userData) {
  await ensureNeonTables();
  const sql = getNeonSql();
  const normalizedEmail = (userData.email || '').toLowerCase().trim();

  const existing = await neonGetUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('User with this email already exists.');
  }

  const initials = (userData.name || 'User')
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const id = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const role = userData.role || 'agent';
  const phone = userData.phone || '+1 (555) 000-0000';
  const department = userData.department || 'Operations';
  const title = userData.title || 'Platform Operator';

  await sql`
    INSERT INTO crm_users (id, name, email, password, role, phone, department, title, status, avatar)
    VALUES (
      ${id},
      ${userData.name || 'New Member'},
      ${normalizedEmail},
      ${userData.password || 'Password123!'},
      ${role},
      ${phone},
      ${department},
      ${title},
      'active',
      ${initials || 'US'}
    );
  `;

  return {
    id,
    name: userData.name || 'New Member',
    email: normalizedEmail,
    role,
    phone,
    department,
    title,
    status: 'active',
    avatar: initials || 'US',
    createdAt: new Date().toISOString()
  };
}

export async function neonUpdateUser(id, updates) {
  await ensureNeonTables();
  const sql = getNeonSql();
  const current = await neonGetUserById(id);
  if (!current) return null;

  const name = updates.name !== undefined ? updates.name : current.name;
  const phone = updates.phone !== undefined ? updates.phone : current.phone;
  const department = updates.department !== undefined ? updates.department : current.department;
  const title = updates.title !== undefined ? updates.title : current.title;
  const password = updates.password !== undefined ? updates.password : current.password;
  const role = updates.role !== undefined ? updates.role : current.role;

  await sql`
    UPDATE crm_users
    SET 
      name = ${name},
      phone = ${phone},
      department = ${department},
      title = ${title},
      password = ${password},
      role = ${role},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id};
  `;

  return {
    ...current,
    name,
    phone,
    department,
    title,
    password,
    role,
    updatedAt: new Date().toISOString()
  };
}

export async function neonCreatePasswordReset(email) {
  await ensureNeonTables();
  const sql = getNeonSql();
  const normalizedEmail = (email || '').toLowerCase().trim();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  await sql`
    INSERT INTO crm_password_resets (email, otp, expires_at)
    VALUES (${normalizedEmail}, ${otp}, ${expiresAt})
    ON CONFLICT (email)
    DO UPDATE SET otp = ${otp}, expires_at = ${expiresAt}, created_at = CURRENT_TIMESTAMP;
  `;

  return { otp, expiresAt };
}

export async function neonVerifyAndResetPassword(email, otp, newPassword) {
  await ensureNeonTables();
  const sql = getNeonSql();
  const normalizedEmail = (email || '').toLowerCase().trim();

  const rows = await sql`
    SELECT * FROM crm_password_resets
    WHERE email = ${normalizedEmail} AND otp = ${otp.trim()} AND expires_at > ${Date.now()}
    LIMIT 1;
  `;

  if (rows.length === 0) {
    return { success: false, error: 'Invalid or expired OTP code.' };
  }

  const user = await neonGetUserByEmail(normalizedEmail);
  if (!user) {
    return { success: false, error: 'User not found, please sign up.' };
  }

  await sql`
    UPDATE crm_users
    SET password = ${newPassword}, updated_at = CURRENT_TIMESTAMP
    WHERE LOWER(email) = ${normalizedEmail};
  `;

  await sql`
    DELETE FROM crm_password_resets
    WHERE email = ${normalizedEmail};
  `;

  return { success: true, user: { ...user, password: newPassword } };
}

// Key-Value JSON store for CRM dataset in Neon
export async function neonLoadStore(key = 'main_db') {
  await ensureNeonTables();
  const sql = getNeonSql();
  const rows = await sql`
    SELECT data FROM crm_store WHERE key = ${key} LIMIT 1;
  `;
  if (rows.length === 0) return null;
  return rows[0].data;
}

export async function neonSaveStore(key = 'main_db', data) {
  await ensureNeonTables();
  const sql = getNeonSql();
  await sql`
    INSERT INTO crm_store (key, data, updated_at)
    VALUES (${key}, ${JSON.stringify(data)}, CURRENT_TIMESTAMP)
    ON CONFLICT (key)
    DO UPDATE SET data = ${JSON.stringify(data)}, updated_at = CURRENT_TIMESTAMP;
  `;
  return true;
}
