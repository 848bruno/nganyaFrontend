// src/components/modalForm/EditDriverModal.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateDriver, useUpdateDriver, useUsers, useVehicles, useCreateUser, useCreateVehicle } from '@/useHooks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VehicleType, VehicleStatus, type Driver } from '@/lib/types';
import { rideshareService } from '@/lib/dashboard-service';

interface EditDriverModalProps {
  driver?: Driver | null;
  onClose: () => void;
  onSave: () => void;
}

export default function EditDriverModal({ driver, onClose, onSave }: EditDriverModalProps) {
  const [formData, setFormData] = useState({
    userId: driver?.userId || '',
    licenseNumber: driver?.licenseNumber || '',
    vehicleId: driver?.vehicleId || '',
    rating: driver?.rating || 0,
  });

  const [createNewUser, setCreateNewUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [createNewVehicle, setCreateNewVehicle] = useState(false);
  const [newVehicleData, setNewVehicleData] = useState({
    licensePlate: '',
    model: '',
    year: 2023, // Default numerical value
    type: '' as VehicleType,
    status: VehicleStatus.Available,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!driver;

  const createDriverMutation = useCreateDriver();
  const updateDriverMutation = useUpdateDriver();
  const createUserMutation = useCreateUser();
  const createVehicleMutation = useCreateVehicle();

  const { data: usersData, isLoading: isLoadingUsers } = useUsers(1, 1000);
  const { data: vehiclesData, isLoading: isLoadingVehicles } = useVehicles(1, 1000);

  const availableUsers = usersData?.items || [];
  const availableVehicles = vehiclesData?.items || [];

  useEffect(() => {
    if (driver) {
      setFormData({
        userId: driver.userId,
        licenseNumber: driver.licenseNumber,
        vehicleId: driver.vehicleId || '',
        rating: driver.rating,
      });
      setCreateNewUser(false);
      setCreateNewVehicle(false); // Ensure this is false for editing existing driver
      setNewUserData({ firstName: '', lastName: '', email: '', phone: '' });
      setNewVehicleData({ licensePlate: '', model: '', year: 2023, type: '' as VehicleType, status: VehicleStatus.Available });
    } else {
      // For adding a new driver, clear all relevant states
      setFormData({ userId: '', licenseNumber: '', vehicleId: '', rating: 0 });
      setNewUserData({ firstName: '', lastName: '', email: '', phone: '' });
      setNewVehicleData({ licensePlate: '', model: '', year: 2023, type: '' as VehicleType, status: VehicleStatus.Available });
      setCreateNewUser(false); // Ensure this is false initially for new driver
      setCreateNewVehicle(false); // Ensure this is false initially for new driver
    }
    setErrors({});
  }, [driver]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: '' }));
    console.log(`[handleChange] formData updated: ${id} to "${value}"`);
  };

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const stateKey = id.replace('newUser_', ''); // Remove 'newUser_' prefix
    setNewUserData((prev) => ({ ...prev, [stateKey]: value })); // Update the correct property
    setErrors((prev) => ({ ...prev, [`newUser_${stateKey}`]: '' })); // Keep error key consistent if needed
    console.log(`[handleNewUserChange] newUserData updated: ${stateKey} to "${value}"`);
  };

  const handleNewVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const stateKey = id.replace('newVehicle_', ''); // Remove 'newVehicle_' prefix
    // Ensure 'year' is stored as a number
    const updatedValue = stateKey === 'year' ? Number(value) : value;
    setNewVehicleData((prev) => ({ ...prev, [stateKey]: updatedValue })); // Update the correct property
    setErrors((prev) => ({ ...prev, [`newVehicle_${stateKey}`]: '' })); // Keep error key consistent if needed
    console.log(`[handleNewVehicleChange] newVehicleData updated: ${stateKey} to "${updatedValue}"`);
  };

  const handleNewVehicleSelect = (key: keyof typeof newVehicleData, value: string) => {
    setNewVehicleData((prev) => ({ ...prev, [key]: value as VehicleType }));
    setErrors((prev) => ({ ...prev, [`newVehicle_${key}`]: '' }));
    console.log(`[handleNewVehicleSelect] newVehicleData select updated: ${key} to "${value}"`);
  };

  const handleSelectUser = (userId: string) => {
    setFormData((prev) => ({ ...prev, userId }));
    setErrors((prev) => ({ ...prev, userId: '' }));
    console.log(`[handleSelectUser] formData userId updated: ${userId}`);
  };

  const handleSelectVehicle = (vehicleId: string) => {
    setFormData((prev) => ({ ...prev, vehicleId: vehicleId === 'null_option' ? '' : vehicleId }));
    setErrors((prev) => ({ ...prev, vehicleId: '' }));
    console.log(`[handleSelectVehicle] formData vehicleId updated: ${vehicleId}`);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isEditing) {
      if (createNewUser) {
        if (!newUserData.firstName.trim()) newErrors.newUser_firstName = 'First name is required.';
        if (!newUserData.lastName.trim()) newErrors.newUser_lastName = 'Last name is required.';
        if (!newUserData.email.trim()) newErrors.newUser_email = 'Email is required.';
        if (!/\S+@\S+\.\S+/.test(newUserData.email)) newErrors.newUser_email = 'Invalid email format.';
        if (!newUserData.phone.trim() || !/^\d+$/.test(newUserData.phone)) newErrors.newUser_phone = 'Phone number is required and must contain digits.';
      } else {
        if (!formData.userId) newErrors.userId = 'User is required.';
      }

      if (createNewVehicle) {
        if (!newVehicleData.licensePlate.trim()) newErrors.newVehicle_licensePlate = 'License plate is required.';
        if (!newVehicleData.model.trim()) newErrors.newVehicle_model = 'Model is required.';
        const yearNum = Number(newVehicleData.year); // Ensure this is checked against the number value
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 5) newErrors.newVehicle_year = 'Valid year is required.';
        if (!newVehicleData.type) newErrors.newVehicle_type = 'Vehicle type is required.';
      }
    }

    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'Driver license number is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      console.log('Validation failed:', errors);
      return;
    }

    try {
      let finalUserId = formData.userId;
      let finalVehicleId = formData.vehicleId;

      if (createNewUser) {
        console.log('Attempting to create new user...');
        // ⭐ ADDED LOGS HERE ⭐
        console.log(`[Validation Check] Checking for existing user with email: "${newUserData.email}"`);
        const existingUsers = await rideshareService.getUsers({ email: newUserData.email, limit: 1 });
        console.log('[Validation Check] API response for existing users:', existingUsers);
        // ⭐ END ADDED LOGS ⭐

        if (existingUsers.items.length > 0) {
          setErrors((prev) => ({ ...prev, newUser_email: 'User with this email already exists.' }));
          return;
        }
        const createdUser = await createUserMutation.mutateAsync({
          ...newUserData,
          role: 'driver',
        });
        finalUserId = createdUser.id;
        console.log('New user created:', createdUser);
      }

      if (createNewVehicle) {
        console.log('Attempting to create new vehicle...');
        const createdVehicle = await createVehicleMutation.mutateAsync({
          ...newVehicleData,
          year: Number(newVehicleData.year), // Ensure year is a number for the API call
          status: newVehicleData.status,
        });
        finalVehicleId = createdVehicle.id;
        console.log('New vehicle created:', createdVehicle);
      }

      if (isEditing) {
        console.log('Attempting to update driver...');
        await updateDriverMutation.mutateAsync({
          id: driver!.id,
          data: {
            licenseNumber: formData.licenseNumber,
            vehicleId: finalVehicleId || null,
            rating: formData.rating,
          },
        });
        console.log('Driver updated successfully.');
      } else {
        await createDriverMutation.mutateAsync({
          userId: finalUserId,
          licenseNumber: formData.licenseNumber,
          vehicleId: finalVehicleId || null,
        });
        console.log('New driver created successfully.');
      }
      onSave();
    } catch (err) {
      console.error('Failed to save driver:', err);
      const errorMessage = (err as any)?.response?.data?.message || (err as Error).message || 'An unknown error occurred.';
      setErrors((prev) => ({ ...prev, form: `Failed to save driver: ${errorMessage}` }));
    }
  };

  const isSubmitting = createDriverMutation.isPending || updateDriverMutation.isPending || createUserMutation.isPending || createVehicleMutation.isPending;

  console.log('--- Render Cycle ---');
  console.log(`isSubmitting: ${isSubmitting}`, {
    createDriver: createDriverMutation.isPending,
    updateDriver: updateDriverMutation.isPending,
    createUser: createUserMutation.isPending,
    createVehicle: createVehicleMutation.isPending,
  });
  console.log(`createNewUser checked: ${createNewUser}`);
  console.log(`createNewVehicle checked: ${createNewVehicle}`);
  console.log('New User Data State (after re-render):', newUserData);
  console.log('New Vehicle Data State (after re-render):', newVehicleData);


  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">{isEditing ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">

          {/* User Selection/Creation */}
          {!isEditing && (
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createNewUser"
                  checked={createNewUser}
                  onCheckedChange={(checked) => {
                    setCreateNewUser(!!checked);
                    if (checked) {
                      setFormData(prev => ({ ...prev, userId: '' }));
                    }
                    setNewUserData({ firstName: '', lastName: '', email: '', phone: '' });
                    setErrors({});
                    console.log(`[Checkbox Change] Create New User: ${!!checked}`);
                  }}
                  disabled={isSubmitting}
                />
                <Label htmlFor="createNewUser" className="text-base font-medium">Create New User for this Driver</Label>
              </div>

              {createNewUser ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newUser_firstName">First Name</Label>
                    <Input id="newUser_firstName" value={newUserData.firstName} onChange={handleNewUserChange} disabled={isSubmitting} />
                    {errors.newUser_firstName && <p className="text-red-500 text-xs mt-1">{errors.newUser_firstName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="newUser_lastName">Last Name</Label>
                    <Input id="newUser_lastName" value={newUserData.lastName} onChange={handleNewUserChange} disabled={isSubmitting} />
                    {errors.newUser_lastName && <p className="text-red-500 text-xs mt-1">{errors.newUser_lastName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="newUser_email">Email</Label>
                    <Input id="newUser_email" type="email" value={newUserData.email} onChange={handleNewUserChange} disabled={isSubmitting} />
                    {errors.newUser_email && <p className="text-red-500 text-xs mt-1">{errors.newUser_email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="newUser_phone">Phone</Label>
                    <Input id="newUser_phone" type="tel" value={newUserData.phone} onChange={handleNewUserChange} disabled={isSubmitting} />
                    {errors.newUser_phone && <p className="text-red-500 text-xs mt-1">{errors.newUser_phone}</p>}
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="userId">User</Label>
                  <Select onValueChange={handleSelectUser} value={formData.userId} disabled={isLoadingUsers || isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an existing user" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.length === 0 ? (
                        <SelectItem value="no-users-available" disabled>No existing users available</SelectItem>
                      ) : (
                        availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.userId && <p className="text-red-500 text-xs mt-1">{errors.userId}</p>}
                </div>
              )}
            </section>
          )}

          <hr className="my-4 col-span-full" />

          {/* Driver specific fields */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Driver Details</h3>
            <div className="grid gap-2">
              <Label htmlFor="licenseNumber">Driver License No.</Label>
              <Input id="licenseNumber" value={formData.licenseNumber} onChange={handleChange} disabled={isSubmitting} />
              {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber}</p>}
            </div>
          </section>

          <hr className="my-4 col-span-full" />

          {/* Vehicle Selection/Creation */}
          {!isEditing && (
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createNewVehicle"
                  checked={createNewVehicle}
                  onCheckedChange={(checked) => {
                    setCreateNewVehicle(!!checked);
                    if (checked) {
                      setFormData(prev => ({ ...prev, vehicleId: '' }));
                    }
                    setNewVehicleData({ licensePlate: '', model: '', year: 2023, type: '' as VehicleType, status: VehicleStatus.Available });
                    setErrors({});
                    console.log(`[Checkbox Change] Create New Vehicle: ${!!checked}`);
                  }}
                  disabled={isSubmitting}
                />
                <Label htmlFor="createNewVehicle" className="text-base font-medium">Create New Vehicle for this Driver</Label>
              </div>

              {createNewVehicle ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newVehicle_licensePlate">License Plate</Label>
                    <Input id="newVehicle_licensePlate" value={newVehicleData.licensePlate} onChange={handleNewVehicleChange} disabled={isSubmitting} />
                    {errors.newVehicle_licensePlate && <p className="text-red-500 text-xs mt-1">{errors.newVehicle_licensePlate}</p>}
                  </div>
                  <div>
                    <Label htmlFor="newVehicle_model">Model</Label>
                    <Input id="newVehicle_model" value={newVehicleData.model} onChange={handleNewVehicleChange} disabled={isSubmitting} />
                    {errors.newVehicle_model && <p className="text-red-500 text-xs mt-1">{errors.newVehicle_model}</p>}
                  </div>
                  <div>
                    <Label htmlFor="newVehicle_year">Year</Label>
                    <Input id="newVehicle_year" type="number" value={newVehicleData.year} onChange={handleNewVehicleChange} disabled={isSubmitting} />
                    {errors.newVehicle_year && <p className="text-red-500 text-xs mt-1">{errors.newVehicle_year}</p>}
                  </div>
                  <div>
                    <Label htmlFor="newVehicle_type">Type</Label>
                    <Select onValueChange={(value) => handleNewVehicleSelect('type', value)} value={newVehicleData.type} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(VehicleType).map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.newVehicle_type && <p className="text-red-500 text-xs mt-1">{errors.newVehicle_type}</p>}
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="vehicleId">Vehicle</Label>
                  <Select onValueChange={handleSelectVehicle} value={formData.vehicleId || 'null_option'} disabled={isLoadingVehicles || isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an existing vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null_option">None</SelectItem>
                      {availableVehicles.length === 0 ? (
                        <SelectItem value="no-vehicles-available" disabled>No existing vehicles available</SelectItem>
                      ) : (
                        availableVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.model} ({vehicle.licensePlate})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </section>
          )}

          {isEditing && (
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Rating</h3>
              <div className="grid gap-2">
                <Label htmlFor="rating">Rating</Label>
                <Input id="rating" type="number" value={formData.rating} onChange={handleChange} min="0" max="5" step="0.1" disabled={isSubmitting} />
              </div>
            </section>
          )}

          {errors.form && <p className="text-red-500 text-sm text-center col-span-full mt-4">{errors.form}</p>}
          
          <DialogFooter className="mt-6 flex justify-end gap-2 col-span-full">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditing ? 'Save changes' : 'Add Driver')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}