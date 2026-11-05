import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

function getSupabaseUrl() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!url) return '';
  try {
    new URL(url);
    return url;
  } catch {
    return '';
  }
}

function getSupabaseKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ''
  );
}

function getPostgresUrl() {
  return (
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.STORAGE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    ''
  );
}

export function isSupabaseEnabled() {
  const hasClient = Boolean(getSupabaseUrl() && getSupabaseKey());
  const hasPg = Boolean(getPostgresUrl());
  return hasClient || hasPg;
}

let cachedSupabase = null;
let cachedSql = null;
let tablesInitialized = false;

export function getSupabaseClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  if (!url || !key) return null;

  if (!cachedSupabase) {
    cachedSupabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  return cachedSupabase;
}

export function getPostgresSql() {
  const conn = getPostgresUrl();
  if (!conn) return null;

  if (!cachedSql) {
    // prepare: false is required for Supabase transaction pooler (port 6543)
    cachedSql = postgres(conn, {
      prepare: false,
      idle_timeout: 20,
      max_lifetime: 60 * 30
    });
  }
  return cachedSql;
}

const SEED_USERS = [
  {
    id: 'usr-admin',
    name: 'Alex Rivera',
    email: 'admin@connectcrm.internal',
    password: 'Password123!',
    role: 'admin',
    phone: '+1 (555) 901-2345',
    department: 'Platform Engineering',
    title: 'Lead Solutions Architect',
    status: 'active',
    avatar: 'AR'
  },
  {
    id: 'usr-qa',
    name: 'Taylor Swift',
    email: 'qa@connectcrm.internal',
    password: 'Password123!',
    role: 'qa',
    phone: '+1 (555) 901-6789',
    department: 'Quality Assurance',
    title: 'QA Lead Engineer',
    status: 'active',
    avatar: 'TS'
  },
  {
    id: 'usr-agent',
    name: 'Jordan Hayes',
    email: 'agent@connectcrm.internal',
    password: 'Password123!',
    role: 'agent',
    phone: '+1 (555) 901-4433',
    department: 'Customer Operations',
    title: 'Senior Support Specialist',
    status: 'active',
    avatar: 'JH'
  },
  {
    id: 'usr-auditor',
    name: 'Morgan Reed',
    email: 'auditor@connectcrm.internal',
    password: 'Password123!',
    role: 'auditor',
    phone: '+1 (555) 901-8822',
    department: 'Compliance & Security',
    title: 'Security Auditor',
    status: 'active',
    avatar: 'MR'
  }
];

function mapUserRow(r) {
  if (!r) return null;
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
    createdAt: r.created_at || r.createdAt,
    updatedAt: r.updated_at || r.updatedAt
  };
}

async function seedSupabaseUsersClient(supabase) {
  try {
    for (const user of SEED_USERS) {
      await supabase.from('crm_users').upsert(user, { onConflict: 'email' });
    }
  } catch (err) {
    console.error('[Supabase] Error seeding initial users:', err.message);
  }
}

export async function ensureSupabaseTables() {
  if (tablesInitialized) return;

  const sql = getPostgresSql();
  if (sql) {
    try {
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

      await sql`
        CREATE TABLE IF NOT EXISTS crm_password_resets (
          email TEXT PRIMARY KEY,
          otp TEXT NOT NULL,
          expires_at BIGINT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS crm_store (
          key TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;

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
      return;
    } catch (err) {
      console.error('[Supabase SQL] Error initializing tables via direct Postgres:', err.message);
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('crm_users').select('id').limit(1);
      if (error) {
        if (error.code === '42P01' || error.message?.includes('relation "crm_users" does not exist') || error.code === 'PGRST204') {
          console.warn('[Supabase] Warning: Tables not yet created. Please run supabase-schema.sql in your Supabase SQL Editor.');
        } else {
          console.error('[Supabase] Connection error:', error.message);
        }
      } else if (!data || data.length === 0) {
        await seedSupabaseUsersClient(supabase);
      }
      tablesInitialized = true;
    } catch (e) {
      console.warn('[Supabase] Could not verify tables:', e.message);
    }
  }
}

// User Methods for Supabase
export async function supabaseGetUsers() {
  await ensureSupabaseTables();
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('crm_users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Supabase] Error fetching users:', error.message);
      const sql = getPostgresSql();
      if (sql) return await sqlGetUsers(sql);
      return [];
    }
    if (!data || data.length === 0) {
      await seedSupabaseUsersClient(supabase);
      const { data: refetched } = await supabase
        .from('crm_users')
        .select('*')
        .order('created_at', { ascending: true });
      return (refetched || SEED_USERS).map(mapUserRow);
    }
    return data.map(mapUserRow);
  }

  const sql = getPostgresSql();
  if (sql) {
    return await sqlGetUsers(sql);
  }
  return [];
}

async function sqlGetUsers(sql) {
  const rows = await sql`SELECT * FROM crm_users ORDER BY created_at ASC;`;
  return rows.map(mapUserRow);
}

export async function supabaseGetUserByEmail(email) {
  if (!email) return null;
  await ensureSupabaseTables();
  const normalized = email.toLowerCase().trim();

  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('crm_users')
      .select('*')
      .ilike('email', normalized)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[Supabase] Error getting user by email:', error.message);
      const sql = getPostgresSql();
      if (sql) return await sqlGetUserByEmail(sql, normalized);
      return null;
    }
    return mapUserRow(data);
  }

  const sql = getPostgresSql();
  if (sql) {
    return await sqlGetUserByEmail(sql, normalized);
  }
  return null;
}

async function sqlGetUserByEmail(sql, normalized) {
  const rows = await sql`
    SELECT * FROM crm_users 
    WHERE LOWER(email) = ${normalized}
    LIMIT 1;
  `;
  if (rows.length === 0) return null;
  return mapUserRow(rows[0]);
}

export async function supabaseGetUserById(id) {
  if (!id) return null;
  await ensureSupabaseTables();

  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('crm_users')
      .select('*')
      .eq('id', id)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[Supabase] Error getting user by id:', error.message);
      const sql = getPostgresSql();
      if (sql) return await sqlGetUserById(sql, id);
      return null;
    }
    return mapUserRow(data);
  }

  const sql = getPostgresSql();
  if (sql) {
    return await sqlGetUserById(sql, id);
  }
  return null;
}

async function sqlGetUserById(sql, id) {
  const rows = await sql`
    SELECT * FROM crm_users 
    WHERE id = ${id}
    LIMIT 1;
  `;
  if (rows.length === 0) return null;
  return mapUserRow(rows[0]);
}

export async function supabaseCreateUser(userData) {
  await ensureSupabaseTables();
  const normalizedEmail = (userData.email || '').toLowerCase().trim();

  const existing = await supabaseGetUserByEmail(normalizedEmail);
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
  const now = new Date().toISOString();

  const userPayload = {
    id,
    name: userData.name || 'New Member',
    email: normalizedEmail,
    password: userData.password || 'Password123!',
    role,
    phone,
    department,
    title,
    status: 'active',
    avatar: initials || 'US',
    created_at: now,
    updated_at: now
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase
      .from('crm_users')
      .insert(userPayload);

    if (error) {
      console.error('[Supabase] Error creating user:', error.message);
      const sql = getPostgresSql();
      if (sql) {
        await sqlCreateUser(sql, userPayload);
      } else {
        throw new Error(error.message);
      }
    }
  } else {
    const sql = getPostgresSql();
    if (sql) {
      await sqlCreateUser(sql, userPayload);
    } else {
      throw new Error('Supabase is not configured.');
    }
  }

  return {
    id,
    name: userPayload.name,
    email: normalizedEmail,
    role,
    phone,
    department,
    title,
    status: 'active',
    avatar: initials || 'US',
    createdAt: now
  };
}

async function sqlCreateUser(sql, u) {
  await sql`
    INSERT INTO crm_users (id, name, email, password, role, phone, department, title, status, avatar)
    VALUES (
      ${u.id},
      ${u.name},
      ${u.email},
      ${u.password},
      ${u.role},
      ${u.phone},
      ${u.department},
      ${u.title},
      'active',
      ${u.avatar}
    );
  `;
}

export async function supabaseUpdateUser(id, updates) {
  await ensureSupabaseTables();
  const current = await supabaseGetUserById(id);
  if (!current) return null;

  const patch = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.phone !== undefined) patch.phone = updates.phone;
  if (updates.department !== undefined) patch.department = updates.department;
  if (updates.title !== undefined) patch.title = updates.title;
  if (updates.password !== undefined) patch.password = updates.password;
  if (updates.role !== undefined) patch.role = updates.role;
  patch.updated_at = new Date().toISOString();

  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase
      .from('crm_users')
      .update(patch)
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error updating user:', error.message);
      const sql = getPostgresSql();
      if (sql) await sqlUpdateUser(sql, id, patch);
      else throw new Error(error.message);
    }
  } else {
    const sql = getPostgresSql();
    if (sql) await sqlUpdateUser(sql, id, patch);
  }

  return {
    ...current,
    ...updates,
    updatedAt: patch.updated_at
  };
}

async function sqlUpdateUser(sql, id, patch) {
  const current = await sqlGetUserById(sql, id);
  if (!current) return null;

  const name = patch.name !== undefined ? patch.name : current.name;
  const phone = patch.phone !== undefined ? patch.phone : current.phone;
  const department = patch.department !== undefined ? patch.department : current.department;
  const title = patch.title !== undefined ? patch.title : current.title;
  const password = patch.password !== undefined ? patch.password : current.password;
  const role = patch.role !== undefined ? patch.role : current.role;

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
}

export async function supabaseCreatePasswordReset(email) {
  await ensureSupabaseTables();
  const normalizedEmail = (email || '').toLowerCase().trim();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase
      .from('crm_password_resets')
      .upsert(
        {
          email: normalizedEmail,
          otp,
          expires_at: expiresAt,
          created_at: new Date().toISOString()
        },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('[Supabase] Error creating password reset:', error.message);
      const sql = getPostgresSql();
      if (sql) await sqlCreatePasswordReset(sql, normalizedEmail, otp, expiresAt);
      else throw new Error(error.message);
    }
  } else {
    const sql = getPostgresSql();
    if (sql) await sqlCreatePasswordReset(sql, normalizedEmail, otp, expiresAt);
  }

  return { otp, expiresAt };
}

async function sqlCreatePasswordReset(sql, normalizedEmail, otp, expiresAt) {
  await sql`
    INSERT INTO crm_password_resets (email, otp, expires_at)
    VALUES (${normalizedEmail}, ${otp}, ${expiresAt})
    ON CONFLICT (email)
    DO UPDATE SET otp = ${otp}, expires_at = ${expiresAt}, created_at = CURRENT_TIMESTAMP;
  `;
}

export async function supabaseVerifyAndResetPassword(email, otp, newPassword) {
  await ensureSupabaseTables();
  const normalizedEmail = (email || '').toLowerCase().trim();
  const cleanOtp = (otp || '').trim();

  let record = null;
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('crm_password_resets')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('otp', cleanOtp)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[Supabase] Error verifying reset OTP:', error.message);
      const sql = getPostgresSql();
      if (sql) record = await sqlGetResetRecord(sql, normalizedEmail, cleanOtp);
    } else {
      record = data;
    }
  } else {
    const sql = getPostgresSql();
    if (sql) record = await sqlGetResetRecord(sql, normalizedEmail, cleanOtp);
  }

  if (!record || Number(record.expires_at) <= Date.now()) {
    return { success: false, error: 'Invalid or expired OTP code.' };
  }

  const user = await supabaseGetUserByEmail(normalizedEmail);
  if (!user) {
    return { success: false, error: 'User not found, please sign up.' };
  }

  if (supabase) {
    await supabase
      .from('crm_users')
      .update({ password: newPassword, updated_at: new Date().toISOString() })
      .ilike('email', normalizedEmail);

    await supabase
      .from('crm_password_resets')
      .delete()
      .eq('email', normalizedEmail);
  } else {
    const sql = getPostgresSql();
    if (sql) {
      await sql`
        UPDATE crm_users
        SET password = ${newPassword}, updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(email) = ${normalizedEmail};
      `;
      await sql`
        DELETE FROM crm_password_resets
        WHERE email = ${normalizedEmail};
      `;
    }
  }

  return { success: true, user: { ...user, password: newPassword } };
}

async function sqlGetResetRecord(sql, normalizedEmail, cleanOtp) {
  const rows = await sql`
    SELECT * FROM crm_password_resets
    WHERE email = ${normalizedEmail} AND otp = ${cleanOtp} AND expires_at > ${Date.now()}
    LIMIT 1;
  `;
  return rows.length > 0 ? rows[0] : null;
}

// Key-Value JSON store for CRM dataset in Supabase
export async function supabaseLoadStore(key = 'main_db') {
  await ensureSupabaseTables();
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('crm_store')
      .select('data')
      .eq('key', key)
      .limit(1)
      .maybeSingle();

    if (error) {
      const sql = getPostgresSql();
      if (sql) return await sqlLoadStore(sql, key);
      return null;
    }
    return data?.data || null;
  }

  const sql = getPostgresSql();
  if (sql) {
    return await sqlLoadStore(sql, key);
  }
  return null;
}

async function sqlLoadStore(sql, key) {
  const rows = await sql`
    SELECT data FROM crm_store WHERE key = ${key} LIMIT 1;
  `;
  if (rows.length === 0) return null;
  return rows[0].data;
}

export async function supabaseSaveStore(key = 'main_db', data) {
  await ensureSupabaseTables();
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase
      .from('crm_store')
      .upsert(
        {
          key,
          data,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      );

    if (!error) return true;
    const sql = getPostgresSql();
    if (sql) return await sqlSaveStore(sql, key, data);
    return false;
  }

  const sql = getPostgresSql();
  if (sql) {
    return await sqlSaveStore(sql, key, data);
  }
  return false;
}

async function sqlSaveStore(sql, key, data) {
  await sql`
    INSERT INTO crm_store (key, data, updated_at)
    VALUES (${key}, ${JSON.stringify(data)}, CURRENT_TIMESTAMP)
    ON CONFLICT (key)
    DO UPDATE SET data = ${JSON.stringify(data)}, updated_at = CURRENT_TIMESTAMP;
  `;
  return true;
}

