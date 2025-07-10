import { createFileRoute } from '@tanstack/react-router'
import { usePagination } from '@table-library/react-table-library/pagination';
import { useSort } from '@table-library/react-table-library/sort';
import { CompactTable } from '@table-library/react-table-library/compact';
import { Edit, Trash2, Plus } from 'lucide-react';

import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/useHooks';
import { useMemo, useState } from 'react';
import { useTheme } from '@/components/theme-provider';

import type { User } from '@/lib/types';
import EditUserModal from '@/components/modalForm/EditUserModal';
import { DashboardSidebar } from '@/components/dashboard-sidebar';


function UsersList() {
  const { data: users = [], isLoading, error } = useUsers();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);

  const theme = useTheme();

  const filtered = useMemo(() => ({
    nodes: users.filter(u =>
      `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    )
  }), [users, search]);

  const pagination = usePagination(filtered, { state: { page: 0, size: 10 } });
  const sort = useSort(filtered, {}, {
    sortFns: {
      ID: arr => arr.sort((a,b)=>a.id.localeCompare(b.id)),
      NAME: arr => arr.sort((a,b)=>a.name.localeCompare(b.name)),
      EMAIL: arr => arr.sort((a,b)=>a.email.localeCompare(b.email)),
    }
  });

  const createM = useCreateUser();
  const updateM = useUpdateUser();
  const deleteM = useDeleteUser();

  const COLUMNS = [
    { label: 'ID', renderCell: (u: User) => u.id, sort: { sortKey: 'ID' } },
    { label: 'Name', renderCell: (u: User) => u.name },
    { label: 'Email', renderCell: (u: User) => u.email, sort: { sortKey: 'EMAIL' } },
    { label: 'Role', renderCell: (u: User) => u.role },
    {
      label: 'Actions',
      renderCell: (u: User) => (
        <div className="flex gap-2">
           <DashboardSidebar userType="admin" />
          <button onClick={() => setEditing(u)}><Edit /></button>
          <button onClick={() => deleteM.mutate(u.id)}><Trash2 /></button>
        </div>
      )
    }
  ];

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error: {String(error)}</div>;

  return (
    <div>
      <h1>Users</h1>
      <button onClick={() => setCreating(true)}><Plus /> New User</button>
       <DashboardSidebar userType="admin" />
      <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
      <CompactTable columns={COLUMNS} data={filtered} theme={theme} pagination={pagination} sort={sort} />
      <div>
        Page {pagination.state.page+1}/
        {pagination.state.getTotalPages(filtered.nodes)} | Showing {filtered.nodes.length}/{users.length}
        {pagination.state.getPages(filtered.nodes).map((_, i) => (
          <button key={i} onClick={() => pagination.fns.onSetPage(i)}>{i+1}</button>
        ))}
      </div>
      {creating && <CreateUserModal onClose={() => setCreating(false)} />}
      {editing && <EditUserModal user={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

export default UsersList