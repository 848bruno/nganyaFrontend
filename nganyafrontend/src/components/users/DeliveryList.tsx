// src/app/dashboard/deliveries/page.tsx (or src/components/DeliveryList.tsx)

import { useState } from 'react';
import { useSort } from '@table-library/react-table-library/sort';
import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';
import { Edit, Trash2, Plus, Search, MapPin } from 'lucide-react'; // Added MapPin for locations
import { useDeliveries } from '@/useHooks'; // Ensure correct import path
import  { type Delivery, DeliveryStatus } from '@/lib/types'; // Import Delivery and DeliveryStatus
import Pagination from '@/components/Pagination'; // Assuming this component exists
import { DashboardSidebar } from '@/components/dashboard-sidebar'; // Adjust path if necessary
import { format } from 'date-fns'; // For date formatting

export default function DeliveryList() {
  // State management for pagination and filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | ''>('');

  // No edit/create modals implemented yet, but placeholders included
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [creatingDelivery, setCreatingDelivery] = useState(false);

  // Fetch deliveries using our custom hook
  const { data, isLoading, isError, error } = useDeliveries({
    page,
    limit,
    q: searchTerm || undefined,
    status: statusFilter || undefined,
  });
  const deliveries = data?.items || [];
  const totalItems = data?.total || 0;

  // Placeholder for delete mutation (implement useDeleteDelivery hook similarly to useDeleteDriver)
  // const deleteDelivery = useDeleteDelivery();

  // Table theme from @table-library
  const theme = useTheme([
    getTheme(),
    {
      HeaderRow: 'bg-gray-100 text-gray-800 font-semibold',
      Row: 'even:bg-gray-50 hover:bg-gray-100 transition-colors',
      Cell: 'p-3 border-b border-gray-200',
    },
  ]);

  // Table data for @table-library
  const tableData = { nodes: deliveries };

  // Sort configuration for @table-library
  const sort = useSort(
    tableData,
    {},
    {
      sortFns: {
        ITEM_TYPE: (array) => array.sort((a, b) => a.itemType.localeCompare(b.itemType)),
        STATUS: (array) => array.sort((a, b) => a.status.localeCompare(b.status)),
        COST: (array) => array.sort((a, b) => a.cost - b.cost),
        CUSTOMER_EMAIL: (array) => array.sort((a, b) => (a.user?.email || '').localeCompare(b.user?.email || '')),
        DRIVER_NAME: (array) => array.sort((a, b) => {
          const driverA = `${a.driver?.user?.firstName || ''} ${a.driver?.user?.lastName || ''}`;
          const driverB = `${b.driver?.user?.firstName || ''} ${b.driver?.user?.lastName || ''}`;
          return driverA.localeCompare(driverB);
        }),
        VEHICLE_PLATE: (array) => array.sort((a, b) => (a.vehicle?.licensePlate || '').localeCompare(b.vehicle?.licensePlate || '')),
        CREATED_AT: (array) => array.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
      },
    }
  );

  // Table columns for @table-library
  const COLUMNS = [
    {
      label: 'ID',
      renderCell: (delivery: Delivery) => <span className="font-mono text-xs text-gray-600">{delivery.id.substring(0, 8)}...</span>,
    },
    {
      label: 'Item Type',
      renderCell: (delivery: Delivery) => delivery.itemType,
      sort: { sortKey: 'ITEM_TYPE' },
    },
    {
      label: 'Status',
      renderCell: (delivery: Delivery) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
          ${delivery.status === DeliveryStatus.Delivered ? 'bg-green-100 text-green-800' : ''}
          ${delivery.status === DeliveryStatus.Pending ? 'bg-yellow-100 text-yellow-800' : ''}
          ${delivery.status === DeliveryStatus.PickedUp ? 'bg-blue-100 text-blue-800' : ''}
          ${delivery.status === DeliveryStatus.InTransit ? 'bg-purple-100 text-purple-800' : ''}
          ${delivery.status === DeliveryStatus.Cancelled ? 'bg-red-100 text-red-800' : ''}
        `}>
          {delivery.status.replace(/_/g, ' ')}
        </span>
      ),
      sort: { sortKey: 'STATUS' },
    },
    {
      label: 'Cost',
      renderCell: (delivery: Delivery) => `Ksh ${delivery.cost.toFixed(2)}`,
      sort: { sortKey: 'COST' },
    },
    {
      label: 'Customer Email',
      renderCell: (delivery: Delivery) => delivery.user?.email || 'N/A',
      sort: { sortKey: 'CUSTOMER_EMAIL' },
    },
    {
      label: 'Driver',
      renderCell: (delivery: Delivery) => delivery.driver?.user ? `${delivery.driver.user.firstName} ${delivery.driver.user.lastName}` : 'Unassigned',
      sort: { sortKey: 'DRIVER_NAME' },
    },
    {
      label: 'Vehicle',
      renderCell: (delivery: Delivery) => delivery.vehicle ? `${delivery.vehicle.model} (${delivery.vehicle.licensePlate})` : 'N/A',
      sort: { sortKey: 'VEHICLE_PLATE' },
    },
    {
      label: 'Pick-Up',
      renderCell: (delivery: Delivery) => (
        <div className="flex items-center gap-1 text-sm text-gray-700">
          <MapPin size={14} className="text-gray-500" />
          <span>{delivery.pickUpLocation.lat}, {delivery.pickUpLocation.lng}</span>
        </div>
      ),
    },
    {
      label: 'Drop-Off',
      renderCell: (delivery: Delivery) => (
        <div className="flex items-center gap-1 text-sm text-gray-700">
          <MapPin size={14} className="text-gray-500" />
          <span>{delivery.dropOffLocation.lat}, {delivery.dropOffLocation.lng}</span>
        </div>
      ),
    },
    {
      label: 'Created At',
      renderCell: (delivery: Delivery) => format(new Date(delivery.createdAt), 'MMM dd, yyyy HH:mm'),
      sort: { sortKey: 'CREATED_AT' },
    },
    {
      label: 'Actions',
      renderCell: (delivery: Delivery) => (
        <div className="flex gap-2">
          <button
            onClick={() => setEditingDelivery(delivery)} // Implement EditDeliveryModal later
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
            title="Edit delivery"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete delivery ${delivery.id}?`)) {
                // deleteDelivery.mutate(delivery.id); // Uncomment and implement useDeleteDelivery hook
                alert("Delete functionality coming soon!");
              }
            }}
            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs"
            // disabled={deleteDelivery.isPending} // Uncomment if using mutation
            title="Delete delivery"
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
      {/* Assuming DashboardSidebar exists and its path is correct */}
      <DashboardSidebar userType="admin" />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Deliveries 📦</h2>
              <p className="text-sm text-gray-600">
                Showing {startIndex} to {endIndex} of {totalItems} deliveries
              </p>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search item type, customer email, driver name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1); // Reset to first page when searching
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as DeliveryStatus | '');
                  setPage(1); // Reset to first page when filtering
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
              >
                <option value="">All Statuses</option>
                {Object.values(DeliveryStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>

              <button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
                onClick={() => setCreatingDelivery(true)} // Implement AddDeliveryModal later
              >
                <Plus size={18} />
                Add Delivery
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
              <h3 className="font-medium">Error loading deliveries</h3>
              <p className="text-sm mt-1">{error?.message || 'Please try again later'}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && deliveries.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-2">No deliveries found</div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setPage(1);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Data table */}
          {!isLoading && !isError && deliveries.length > 0 && (
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
                {/* Ensure your Pagination component matches the props here */}
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

      {/* Modals for editing/creating (placeholders, you'll need to create these) */}
      {editingDelivery && (
        // <EditDeliveryModal
        //   delivery={editingDelivery}
        //   onClose={() => setEditingDelivery(null)}
        //   onSave={() => {
        //     setEditingDelivery(null);
        //     // Invalidate queries or refetch deliveries if needed after save
        //   }}
        // />
        <p className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white z-50">
          Edit Delivery Modal Placeholder for ID: {editingDelivery.id}
          <button onClick={() => setEditingDelivery(null)} className="ml-4 px-2 py-1 bg-white text-black rounded">Close</button>
        </p>
      )}

      {creatingDelivery && (
        // <CreateDeliveryModal
        //   onClose={() => setCreatingDelivery(false)}
        //   onSave={() => {
        //     setCreatingDelivery(false);
        //     // Invalidate queries or refetch deliveries if needed after save
        //   }}
        // />
        <p className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white z-50">
          Create Delivery Modal Placeholder
          <button onClick={() => setCreatingDelivery(false)} className="ml-4 px-2 py-1 bg-white text-black rounded">Close</button>
        </p>
      )}
    </div>
  );
}