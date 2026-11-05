// Deprecated: Migrated to Supabase in lib/supabase.js
// Re-exporting aliases for full backward compatibility
export {
  isSupabaseEnabled as isNeonEnabled,
  getPostgresSql as getNeonSql,
  ensureSupabaseTables as ensureNeonTables,
  supabaseGetUsers as neonGetUsers,
  supabaseGetUserByEmail as neonGetUserByEmail,
  supabaseGetUserById as neonGetUserById,
  supabaseCreateUser as neonCreateUser,
  supabaseUpdateUser as neonUpdateUser,
  supabaseCreatePasswordReset as neonCreatePasswordReset,
  supabaseVerifyAndResetPassword as neonVerifyAndResetPassword,
  supabaseLoadStore as neonLoadStore,
  supabaseSaveStore as neonSaveStore
} from './supabase.js';
