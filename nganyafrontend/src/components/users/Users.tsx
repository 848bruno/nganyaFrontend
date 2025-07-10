import { useState } from 'react';
import { useSort } from '@table-library/react-table-library/sort';
import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { useUsers, useDeleteUser } from '@/useHooks';
import type { User } from '@/lib/types';
import EditUserModal from '@/components/modalForm/EditUserModal';
import Pagination from '@/components/Pagination';

export default function UsersList() {
  // State management
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);

  // Fetch users
  const { data, isLoading, isError, error } = useUsers(page, limit, roleFilter, searchTerm);
  const users = data?.items || [];
  const totalItems = data?.total || 0;

  // Delete mutation
  const deleteUser = useDeleteUser();

  // Table theme
  const theme = useTheme([
    getTheme(),
    {
      HeaderRow: 'bg-gray-100 text-gray-800 font-semibold',
      Row: 'even:bg-gray-50 hover:bg-gray-100 transition-colors',
      Cell: 'p-3 border-b border-gray-200',
    },
  ]);

  // Table data
  const tableData = { nodes: users };

  // Sort configuration
  const sort = useSort(
    tableData,
    {},
    {
      sortFns: {
        ID: (array) => array.sort((a, b) => a.id.localeCompare(b.id)),
        NAME: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
        EMAIL: (array) => array.sort((a, b) => a.email.localeCompare(b.email)),
        CREATED: (array) => array.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
      },
    }
  );

  // Table columns
  const COLUMNS = [
    { 
      label: 'ID', 
      renderCell: (user) => <span className="font-mono text-xs">{user.id}</span>,
      sort: { sortKey: 'ID' } 
    },
    { 
      label: 'Name', 
      renderCell: (user) => user.name,
      sort: { sortKey: 'NAME' } 
    },
    { 
      label: 'Email', 
      renderCell: (user) => <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">{user.email}</a>,
      sort: { sortKey: 'EMAIL' } 
    },
    { 
      label: 'Phone', 
      renderCell: (user) => user.phone || <span className="text-gray-400">N/A</span>
    },
    { 
      label: 'Role', 
      renderCell: (user) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.role === 'admin' ? 'bg-red-100 text-red-800' :
          user.role === 'driver' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {user.role}
        </span>
      )
    },
    {
      label: 'Created',
      renderCell: (user) => new Date(user.createdAt).toLocaleDateString(),
      sort: { sortKey: 'CREATED' }
    },
    {
      label: 'Actions',
      renderCell: (user) => (
        <div className="flex gap-2">
          <button
            onClick={() => setEditingUser(user)}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
            title="Edit user"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                deleteUser.mutate(user.id);
              }
            }}
            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs"
            disabled={deleteUser.isPending}
            title="Delete user"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  // Calculate pagination values
  const startIndex = Math.min((page - 1) * limit + 1, totalItems);
  const endIndex = Math.min(page * limit, totalItems);
  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Users</h2>
          <p className="text-sm text-gray-600">
            Showing {startIndex} to {endIndex} of {totalItems} users
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to first page when searching
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={roleFilter || ''}
            onChange={(e) => {
              setRoleFilter(e.target.value || undefined);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
          
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={() => setCreatingUser(true)}
          >
            <Plus size={18} />
            Add User
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="p-6 bg-red-50 text-red-700 rounded-lg">
          <h3 className="font-medium">Error loading users</h3>
          <p className="text-sm mt-1">{error.message || 'Please try again later'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && users.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-gray-400 mb-2">No users found</div>
          <button
            onClick={() => {
              setSearchTerm('');
              setRoleFilter(undefined);
              setPage(1);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Data table */}
      {!isLoading && !isError && users.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <CompactTable
              columns={COLUMNS}
              data={tableData}
              theme={theme}
              sort={sort}
              layout={{ fixedHeader: true }}
            />
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t">
            <Pagination
              currentPage={page}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
            />
          </div>
        </>
      )}

      {/* Modals */}
      {editingUser && (
        <EditUserModal 
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={() => {
            setEditingUser(null);
            // You might want to invalidate queries here
          }}
        />
      )}
      
      {creatingUser && (
        <EditUserModal 
          onClose={() => setCreatingUser(false)}
          onSave={() => {
            setCreatingUser(false);
            // Invalidate queries or refetch data
          }}
        />
      )}
    </div>
  );
}