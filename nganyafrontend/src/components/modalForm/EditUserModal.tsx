import type { User } from '@/lib/types';
import { useUpdateUser, useCreateUser } from '@/useHooks'; // Assuming you have useCreateUser hook
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';


interface EditUserModalProps {
  user?: User; // Make user prop optional
  onClose: () => void;
  onSave: () => void; // Add onSave to trigger data refetch/invalidation in parent
}

export default function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'customer',
    phone: '',
    // Add password to formData state
    password: '', 
  });

  // Determine if we are editing an existing user or creating a new one
  const isEditing = !!user;

  const updateUser = useUpdateUser();
  const createUser = useCreateUser(); // Use a separate hook for creating users

  // Set initial form data when the modal opens or user prop changes
  useEffect(() => {
    if (isEditing && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'customer',
        phone: user.phone || '',
        password: '', // Password should not be pre-filled when editing
      });
    } else {
      // Reset form for creating a new user, including password
      setFormData({
        name: '',
        email: '',
        role: 'customer',
        phone: '',
        password: '', // Ensure password field is clear for new user
      });
    }
  }, [user, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && user) {
      // Logic for updating an existing user
      // IMPORTANT: Do NOT send password field when updating, unless you have a specific "change password" flow
      const { password, ...dataToUpdate } = formData; // Exclude password from data sent for update
      updateUser.mutate(
        { id: user.id, data: dataToUpdate },
        {
          onSuccess: () => {
            onClose();
            onSave(); // Call onSave to notify parent component
          },
        }
      );
    } else {
      // Logic for creating a new user
      createUser.mutate(
        formData, // Send all formData, including password, for creation
        {
          onSuccess: () => {
            onClose();
            onSave(); // Call onSave to notify parent component
          },
        }
      );
    }
  };

  const isSaving = isEditing ? updateUser.isPending : createUser.isPending;
  const modalTitle = isEditing ? 'Edit User' : 'Add New User';

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
      <div className="relative bg-white rounded p-6 w-full max-w-md z-50">
        <Dialog.Title className="text-lg font-bold mb-4">{modalTitle}</Dialog.Title>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              className="w-full border border-gray-300 px-3 py-2 rounded"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              className="w-full border border-gray-300 px-3 py-2 rounded"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password field - Only show for new user creation */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password" // Use type="password" for security
                name="password"
                className="w-full border border-gray-300 px-3 py-2 rounded"
                value={formData.password}
                onChange={handleChange}
                required // Password should be required for new users
                autoComplete="new-password" // Helps browsers with autofill
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              name="role"
              className="w-full border border-gray-300 px-3 py-2 rounded"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="customer">Customer</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input
              type="text"
              name="phone"
              className="w-full border border-gray-300 px-3 py-2 rounded"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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