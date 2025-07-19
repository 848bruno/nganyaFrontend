// src/components/DriversList.tsx
import { useState } from 'react';
import { useSort } from '@table-library/react-table-library/sort';
import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';
import { Edit, Trash2, Plus, Search, Star } from 'lucide-react';
import { useDrivers, useDeleteUser } from '@/useHooks'; // Import useDeleteUser as drivers are Users
import type { User, UserRole } from '@/lib/types'; // Import User and UserRole types
import EditDriverModal from '@/components/modalForm/EditDriverModal'; // Import the new modal
import Pagination from '@/components/Pagination';
import { DashboardSidebar } from '../dashboard-sidebar'; // Assuming sidebar is in the same folder or adjust path

export default function DriversList() {
  // State management
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDriver, setEditingDriver] = useState<User | null>(null); // Changed type to User
  const [creatingDriver, setCreatingDriver] = useState(false);

  // Fetch drivers (which are Users with role 'driver')
  const { data, isLoading, isError, error } = useDrivers(page, limit, searchTerm);
  const drivers = data?.data || []; // Access 'data' property from PaginatedResponse
  const totalItems = data?.total || 0;

  // Delete mutation (now uses useDeleteUser as drivers are Users)
  const deleteDriverMutation = useDeleteUser(); // Renamed to avoid conflict with local variable

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
  const tableData = { nodes: drivers };

  // Sort configuration
  const sort = useSort(
    tableData,
    {},
    {
      sortFns: {
        NAME: (array) => array.sort((a, b) => (a.firstName || '').localeCompare(b.firstName || '')),
        EMAIL: (array) => array.sort((a, b) => (a.email || '').localeCompare(b.email || '')),
        LICENSE_NUMBER: (array) => array.sort((a, b) => (a.driverLicenseNumber || '').localeCompare(b.driverLicenseNumber || '')),
        VEHICLE: (array) => array.sort((a, b) => (a.assignedVehicle?.model || '').localeCompare(b.assignedVehicle?.model || '')),
        RATING: (array) => array.sort((a, b) => (Number(a.averageRating) || 0) - (Number(b.averageRating) || 0)), // Explicitly convert to number
        CREATED: (array) => array.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
      },
    }
  );

  // Table columns
  const COLUMNS = [
    {
      label: 'Driver Name',
      renderCell: (driver: User) => `${driver.firstName || 'N/A'} ${driver.lastName || ''}`,
      sort: { sortKey: 'NAME' }
    },
    {
      label: 'Email',
      renderCell: (driver: User) => driver.email || 'N/A',
      sort: { sortKey: 'EMAIL' }
    },
    {
      label: 'License Number',
      renderCell: (driver: User) => <span className="font-mono text-xs">{driver.driverLicenseNumber || 'N/A'}</span>,
      sort: { sortKey: 'LICENSE_NUMBER' }
    },
    {
      label: 'Vehicle',
      renderCell: (driver: User) => driver.assignedVehicle ? `${driver.assignedVehicle.model} (${driver.assignedVehicle.licensePlate})` : 'N/A',
      sort: { sortKey: 'VEHICLE' }
    },
    {
      label: 'Rating',
      renderCell: (driver: User) => (
        <div className="flex items-center gap-1">
          {/* Explicitly convert to number before calling toFixed */}
          <span>{(Number(driver.averageRating) || 0).toFixed(1)}</span>
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
        </div>
      ),
      sort: { sortKey: 'RATING' }
    },
    {
      label: 'Created',
      renderCell: (driver: User) => new Date(driver.createdAt).toLocaleDateString(),
      sort: { sortKey: 'CREATED' }
    },
    {
      label: 'Actions',
      renderCell: (driver: User) => (
        <div className="flex gap-2">
          <button
            onClick={() => setEditingDriver(driver)}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
            title="Edit driver"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete driver ${driver.firstName || ''} ${driver.lastName || ''}?`)) {
                deleteDriverMutation.mutate(driver.id); // Use deleteDriverMutation
              }
            }}
            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs"
            disabled={deleteDriverMutation.isPending}
            title="Delete driver"
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar userType="admin" />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Drivers</h2>
              <p className="text-sm text-gray-600">
                Showing {startIndex} to {endIndex} of {totalItems} drivers
              </p>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search drivers..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1); // Reset to first page when searching
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={() => setCreatingDriver(true)}
              >
                <Plus size={18} />
                Add Driver
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
              <h3 className="font-medium">Error loading drivers</h3>
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
          {!isLoading && !isError && drivers.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-2">No drivers found</div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPage(1);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Data table */}
          {!isLoading && !isError && drivers.length > 0 && (
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
        </div>
      </div>

      {/* Modals */}
      {editingDriver && (
        <EditDriverModal
          driver={editingDriver}
          onClose={() => setEditingDriver(null)}
          onSave={() => {
            setEditingDriver(null);
            // Invalidate queries to refetch data after save (already handled by useMutation onSuccess)
          }}
        />
      )}

      {creatingDriver && (
        <EditDriverModal
          onClose={() => setCreatingDriver(false)}
          onSave={() => {
            setCreatingDriver(false);
            // Invalidate queries to refetch data after save (already handled by useMutation onSuccess)
          }}
        />
      )}
    </div>
  );
}
