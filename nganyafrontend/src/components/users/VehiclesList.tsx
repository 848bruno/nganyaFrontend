// src/components/VehiclesList.tsx
import { useState } from 'react';
import { useSort } from '@table-library/react-table-library/sort';
import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { useVehicles, useDeleteVehicle } from '@/useHooks';
import  { VehicleType, VehicleStatus, type Vehicle } from '@/lib/types'; // Import VehicleType and VehicleStatus
import EditVehicleModal from '@/components/modalForm/EditVehicleModal'; // Import the new modal
import Pagination from '@/components/Pagination';
import { DashboardSidebar } from '../dashboard-sidebar'; // Assuming sidebar is in the same folder or adjust path

export default function VehiclesList() {
  // State management
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<VehicleType | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | undefined>(undefined);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [creatingVehicle, setCreatingVehicle] = useState(false);

  // Fetch vehicles
  const { data, isLoading, isError, error } = useVehicles(page, limit, typeFilter, statusFilter, searchTerm);
  const vehicles = data?.items || [];
  const totalItems = data?.total || 0;

  // Delete mutation
  const deleteVehicle = useDeleteVehicle();

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
  const tableData = { nodes: vehicles };

  // Sort configuration
  const sort = useSort(
    tableData,
    {},
    {
      sortFns: {
        LICENSE_PLATE: (array) => array.sort((a, b) => a.licensePlate.localeCompare(b.licensePlate)),
        MODEL: (array) => array.sort((a, b) => a.model.localeCompare(b.model)),
        YEAR: (array) => array.sort((a, b) => a.year - b.year),
        TYPE: (array) => array.sort((a, b) => a.type.localeCompare(b.type)),
        STATUS: (array) => array.sort((a, b) => a.status.localeCompare(b.status)),
        CREATED: (array) => array.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
      },
    }
  );

  // Table columns
  const COLUMNS = [
    { 
      label: 'License Plate', 
      renderCell: (vehicle:any) => <span className="font-mono text-xs">{vehicle.licensePlate}</span>,
      sort: { sortKey: 'LICENSE_PLATE' } 
    },
    { 
      label: 'Model', 
      renderCell: (vehicle:any) => vehicle.model,
      sort: { sortKey: 'MODEL' } 
    },
    { 
      label: 'Year', 
      renderCell: (vehicle:any) => vehicle.year,
      sort: { sortKey: 'YEAR' } 
    },
    { 
      label: 'Type', 
      renderCell: (vehicle:any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          vehicle.type === VehicleType.Luxury ? 'bg-yellow-100 text-yellow-800' :
          vehicle.type === VehicleType.SUV ? 'bg-purple-100 text-purple-800' :
          'bg-indigo-100 text-indigo-800'
        }`}>
          {vehicle.type}
        </span>
      ),
      sort: { sortKey: 'TYPE' } 
    },
    { 
      label: 'Status', 
      renderCell: (vehicle:any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          vehicle.status === VehicleStatus.Available ? 'bg-green-100 text-green-800' :
          vehicle.status === VehicleStatus.InUse ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {vehicle.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </span>
      ),
      sort: { sortKey: 'STATUS' } 
    },
    {
      label: 'Created',
      renderCell: (vehicle:any) => new Date(vehicle.createdAt).toLocaleDateString(),
      sort: { sortKey: 'CREATED' }
    },
    {
      label: 'Actions',
      renderCell: (vehicle:any) => (
        <div className="flex gap-2">
          <button
            onClick={() => setEditingVehicle(vehicle)}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
            title="Edit vehicle"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete vehicle ${vehicle.licensePlate} (${vehicle.model})?`)) {
                deleteVehicle.mutate(vehicle.id);
              }
            }}
            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs"
            disabled={deleteVehicle.isPending}
            title="Delete vehicle"
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
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar userType="admin" />
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Vehicles</h2>
              <p className="text-sm text-gray-600">
                Showing {startIndex} to {endIndex} of {totalItems} vehicles
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1); // Reset to first page when searching
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={typeFilter || ''}
                onChange={(e) => {
                  setTypeFilter(e.target.value as VehicleType || undefined);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                {Object.values(VehicleType).map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter || ''}
                onChange={(e) => {
                  setStatusFilter(e.target.value as VehicleStatus || undefined);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {Object.values(VehicleStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
              
              <button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={() => setCreatingVehicle(true)}
              >
                <Plus size={18} />
                Add Vehicle
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
              <h3 className="font-medium">Error loading vehicles</h3>
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
          {!isLoading && !isError && vehicles.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-2">No vehicles found</div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter(undefined);
                  setStatusFilter(undefined);
                  setPage(1);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Data table */}
          {!isLoading && !isError && vehicles.length > 0 && (
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
      {editingVehicle && (
        <EditVehicleModal 
          vehicle={editingVehicle}
          onClose={() => setEditingVehicle(null)}
          onSave={() => {
            setEditingVehicle(null);
            // Invalidate queries to refetch data after save
            // Example: queryClient.invalidateQueries({ queryKey: ['vehicles'] });
          }}
        />
      )}
      
      {creatingVehicle && (
        <EditVehicleModal 
          onClose={() => setCreatingVehicle(false)}
          onSave={() => {
            setCreatingVehicle(false);
            // Invalidate queries to refetch data after save
            // Example: queryClient.invalidateQueries({ queryKey: ['vehicles'] });
          }}
        />
      )}
    </div>
  );
}