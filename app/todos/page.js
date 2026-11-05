import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function TodosPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: users } = await supabase.from('crm_users').select('id, name, email, role');
  const { data: todos } = await supabase.from('todos').select('*');

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6 font-sans">
      <h1 className="text-2xl font-bold">Supabase SSR Connection Test</h1>
      <p className="text-sm text-gray-600">
        Loaded dynamically on the server via <code>@/utils/supabase/server</code>.
      </p>

      <section>
        <h2 className="text-lg font-semibold mb-2">Connected Supabase Users:</h2>
        <ul className="space-y-2">
          {users?.map((user) => (
            <li key={user.id} className="p-3 bg-white border border-gray-200 rounded shadow-sm flex justify-between items-center">
              <div>
                <span className="font-medium text-gray-900">{user.name}</span>
                <span className="text-xs text-gray-400 ml-2">({user.role})</span>
              </div>
              <span className="text-sm text-gray-500">{user.email}</span>
            </li>
          ))}
        </ul>
      </section>

      {todos && todos.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Todos Table:</h2>
          <ul className="list-disc pl-5">
            {todos.map((todo) => (
              <li key={todo.id}>{todo.name}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

