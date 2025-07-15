// src/components/modalForm/EditVehicleModal.tsx
import  {  VehicleType, VehicleStatus, type Vehicle } from '@/lib/types';
import { useUpdateVehicle, useCreateVehicle } from '@/useHooks';
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';

interface EditVehicleModalProps {
  vehicle?: Vehicle; // Optional for adding a new vehicle
  onClose: () => void;
  onSave: () => void;
}

export default function EditVehicleModal({ vehicle, onClose, onSave }: EditVehicleModalProps) {
  const [formData, setFormData] = useState({
    licensePlate: '',
    type: VehicleType.Sedan as VehicleType, // Default to Sedan
    status: VehicleStatus.Available as VehicleStatus, // Default to Available
    model: '',
    year: '', // Keep as string for input, convert to number on submit
  });

  const isEditing = !!vehicle;

  const updateVehicle = useUpdateVehicle();
  const createVehicle = useCreateVehicle();

  useEffect(() => {
    if (isEditing && vehicle) {
      setFormData({
        licensePlate: vehicle.licensePlate || '',
        type: vehicle.type || VehicleType.Sedan,
        status: vehicle.status || VehicleStatus.Available,
        model: vehicle.model || '',
        year: String(vehicle.year) || '', // Convert number to string for input
      });
    } else {
      // Reset form for creating a new vehicle
      setFormData({
        licensePlate: '',
        type: VehicleType.Sedan,
        status: VehicleStatus.Available,
        model: '',
        year: '',
      });
    }
  }, [vehicle, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSend = {
      ...formData,
      year: parseInt(formData.year), // Convert year back to number
    };

    if (isEditing && vehicle) {
      updateVehicle.mutate(
        { id: vehicle.id, data: dataToSend },
        {
          onSuccess: () => {
            onClose();
            onSave();
          },
        }
      );
    } else {
      createVehicle.mutate(
        dataToSend,
        {
          onSuccess: () => {
            onClose();
            onSave();
          },
        }
      );
    }
  };

  const isSaving = isEditing ? updateVehicle.isPending : createVehicle.isPending;
  const modalTitle = isEditing ? 'Edit Vehicle' : 'Add New Vehicle';

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50">
        <Dialog.Title className="text-xl font-bold mb-4">{modalTitle}</Dialog.Title>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">License Plate</label>
            <input
              type="text"
              name="licensePlate"
              id="licensePlate"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={formData.licensePlate}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
            <input
              type="text"
              name="model"
              id="model"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={formData.model}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
            <input
              type="number" // Use type="number" for year
              name="year"
              id="year"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={formData.year}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Vehicle Type</label>
            <select
              name="type"
              id="type"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={formData.type}
              onChange={handleChange}
              required
            >
              {Object.values(VehicleType).map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)} {/* Capitalize for display */}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              id="status"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={formData.status}
              onChange={handleChange}
              required
            >
              {Object.values(VehicleStatus).map((status) => (
                <option key={status} value={status}>
                  {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} {/* Format 'in_use' to 'In Use' */}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}