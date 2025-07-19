// src/components/modalForm/EditDriverModal.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateUser, useUpdateUser, useUsers, useVehicles, useCreateVehicle } from '@/useHooks'; // useUpdateUser instead of useUpdateDriver
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VehicleType, VehicleStatus, type User, UserRole } from '@/lib/types'; // Import User, UserRole, remove Driver
import { rideshareService } from '@/lib/dashboard-service';

interface EditDriverModalProps {
  driver?: User | null; // Changed type to User
  onClose: () => void;
  onSave: () => void;
}

export default function EditDriverModal({ driver, onClose, onSave }: EditDriverModalProps) {
  // State for driver-specific fields (from User entity)
  const [driverFormData, setDriverFormData] = useState({
    licenseNumber: driver?.driverLicenseNumber || '',
    vehicleId: driver?.assignedVehicleId || '',
    rating: driver?.averageRating || 0,
  });

  // State for user-specific fields (from User entity) when editing or creating a new user for a driver
  const [userFormData, setUserFormData] = useState({
    firstName: driver?.firstName || '',
    lastName: driver?.lastName || '',
    email: driver?.email || '',
    phone: driver?.phone || '',
  });

  const [createNewUser, setCreateNewUser] = useState(false);
  const [createNewVehicle, setCreateNewVehicle] = useState(false);
  const [newVehicleData, setNewVehicleData] = useState({
    licensePlate: '',
    model: '',
    year: new Date().getFullYear(), // Default numerical value
    type: '' as VehicleType,
    status: VehicleStatus.Available,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!driver;

  const createUserMutation = useCreateUser();
  const updateDriverMutation = useUpdateUser(); // This is actually updateUser
  const createVehicleMutation = useCreateVehicle();

  const { data: usersData, isLoading: isLoadingUsers } = useUsers(1, 1000, UserRole.Customer); // Only fetch customers for new driver assignment
  const { data: vehiclesData, isLoading: isLoadingVehicles } = useVehicles(1, 1000);

  const availableUsers = usersData?.data || []; // Access 'data' from PaginatedResponse
  const availableVehicles = vehiclesData?.data || []; // Access 'data' from PaginatedResponse

  useEffect(() => {
    if (driver) {
      // When editing an existing driver
      setDriverFormData({
        licenseNumber: driver.driverLicenseNumber || '',
        vehicleId: driver.assignedVehicleId || '',
        rating: driver.averageRating || 0,
      });
      setUserFormData({
        firstName: driver.firstName || '',
        lastName: driver.lastName || '',
        email: driver.email || '',
        phone: driver.phone || '',
      });
      setCreateNewUser(false); // Cannot create new user when editing existing
      setCreateNewVehicle(false); // Cannot create new vehicle when editing existing driver's association
    } else {
      // When adding a new driver, clear all relevant states
      setDriverFormData({ licenseNumber: '', vehicleId: '', rating: 0 });
      setUserFormData({ firstName: '', lastName: '', email: '', phone: '' });
      setCreateNewUser(false); // Default to selecting existing user for new driver
      setCreateNewVehicle(false); // Default to selecting existing vehicle for new driver
    }
    setNewVehicleData({ licensePlate: '', model: '', year: new Date().getFullYear(), type: '' as VehicleType, status: VehicleStatus.Available });
    setErrors({});
  }, [driver]);

  const handleDriverChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setDriverFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUserFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const handleNewVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const updatedValue = id === 'newVehicle_year' ? Number(value) : value;
    setNewVehicleData((prev) => ({ ...prev, [id.replace('newVehicle_', '')]: updatedValue }));
    setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const handleNewVehicleSelect = (key: keyof typeof newVehicleData, value: string) => {
    setNewVehicleData((prev) => ({ ...prev, [key]: value as VehicleType }));
    setErrors((prev) => ({ ...prev, [`newVehicle_${key}`]: '' }));
  };

  const handleSelectUser = (userId: string) => {
    setDriverFormData((prev) => ({ ...prev, userId }));
    setErrors((prev) => ({ ...prev, userId: '' }));
  };

  const handleSelectVehicle = (vehicleId: string) => {
    setDriverFormData((prev) => ({ ...prev, vehicleId: vehicleId === 'null_option' ? '' : vehicleId }));
    setErrors((prev) => ({ ...prev, vehicleId: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isEditing) {
      // Validation for existing driver (User) details
      if (!userFormData.firstName.trim()) newErrors.firstName = 'First name is required.';
      if (!userFormData.lastName.trim()) newErrors.lastName = 'Last name is required.';
      if (!userFormData.email.trim()) newErrors.email = 'Email is required.';
      if (!/\S+@\S+\.\S+/.test(userFormData.email)) newErrors.email = 'Invalid email format.';
      if (!userFormData.phone.trim() || !/^\d+$/.test(userFormData.phone)) newErrors.phone = 'Phone number is required and must contain digits.';
    } else { // Adding new driver
      if (createNewUser) {
        if (!userFormData.firstName.trim()) newErrors.firstName = 'First name is required.';
        if (!userFormData.lastName.trim()) newErrors.lastName = 'Last name is required.';
        if (!userFormData.email.trim()) newErrors.email = 'Email is required.';
        if (!/\S+@\S+\.\S+/.test(userFormData.email)) newErrors.email = 'Invalid email format.';
        if (!userFormData.phone.trim() || !/^\d+$/.test(userFormData.phone)) newErrors.phone = 'Phone number is required and must contain digits.';
      } else {
        if (!driverFormData.userId) newErrors.userId = 'User is required.';
      }

      if (createNewVehicle) {
        if (!newVehicleData.licensePlate.trim()) newErrors.newVehicle_licensePlate = 'License plate is required.';
        if (!newVehicleData.model.trim()) newErrors.newVehicle_model = 'Model is required.';
        const yearNum = Number(newVehicleData.year);
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 5) newErrors.newVehicle_year = 'Valid year is required.';
        if (!newVehicleData.type) newErrors.newVehicle_type = 'Vehicle type is required.';
      }
    }

    if (!driverFormData.licenseNumber.trim()) newErrors.licenseNumber = 'Driver license number is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      let finalUserId = driver?.id; // For editing, use the existing driver's ID
      let finalVehicleId = driverFormData.vehicleId;

      if (!isEditing && createNewUser) {
        const existingUsers = await rideshareService.getUsers({ q: userFormData.email, limit: 1, role: UserRole.Driver });
        if (existingUsers.data.length > 0) {
          setErrors((prev) => ({ ...prev, email: 'User with this email already exists as a driver.' }));
          return;
        }
        const createdUser = await createUserMutation.mutateAsync({
          firstName: userFormData.firstName,
          lastName: userFormData.lastName,
          email: userFormData.email,
          phone: userFormData.phone,
          role: UserRole.Driver,
          driverLicenseNumber: driverFormData.licenseNumber, // Pass license number here for new driver
        });
        finalUserId = createdUser.id;
      } else if (!isEditing && !createNewUser) {
        finalUserId = driverFormData.userId;
        const selectedUser = availableUsers.find(u => u.id === finalUserId);
        if (!selectedUser) {
          setErrors((prev) => ({ ...prev, userId: 'Selected user not found.' }));
          return;
        }
        // If selected user is not already a driver, update their role and driver-specific info
        if (selectedUser.role !== UserRole.Driver) {
          await updateDriverMutation.mutateAsync({
            id: finalUserId,
            data: {
              role: UserRole.Driver,
              driverLicenseNumber: driverFormData.licenseNumber,
              assignedVehicleId: finalVehicleId || null,
              averageRating: Number(driverFormData.rating),
            }
          });
        } else {
            // If the selected user is already a driver, just update their driver-specific info
            await updateDriverMutation.mutateAsync({
                id: finalUserId,
                data: {
                    driverLicenseNumber: driverFormData.licenseNumber,
                    assignedVehicleId: finalVehicleId || null,
                    averageRating: Number(driverFormData.rating),
                }
            });
        }
      }

      if (!isEditing && createNewVehicle) {
        const createdVehicle = await createVehicleMutation.mutateAsync({
          ...newVehicleData,
          year: Number(newVehicleData.year),
          status: newVehicleData.status,
        });
        finalVehicleId = createdVehicle.id;
      }

      if (isEditing) {
        // Update existing driver (User entity)
        await updateDriverMutation.mutateAsync({
          id: driver!.id,
          data: {
            firstName: userFormData.firstName,
            lastName: userFormData.lastName,
            email: userFormData.email,
            phone: userFormData.phone,
            driverLicenseNumber: driverFormData.licenseNumber,
            assignedVehicleId: finalVehicleId || null,
            averageRating: Number(driverFormData.rating),
          },
        });
      } else {
        // For new driver, if a new user was created, assign vehicle if applicable
        if (createNewUser && finalUserId && finalVehicleId) {
            await rideshareService.assignVehicleToDriver(finalUserId, finalVehicleId);
        }
      }
      onSave();
    } catch (err) {
      console.error('Failed to save driver:', err);
      const errorMessage = (err as any)?.response?.data?.message || (err as Error).message || 'An unknown error occurred.';
      setErrors((prev) => ({ ...prev, form: `Failed to save driver: ${errorMessage}` }));
    }
  };

  const isSubmitting = createUserMutation.isPending || updateDriverMutation.isPending || createVehicleMutation.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">{isEditing ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">

          {/* User Details Section (for both editing and creating new user) */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">{isEditing ? 'User Details' : 'User Selection/Creation'}</h3>
            {isEditing || createNewUser ? (
              // Display and allow editing of existing user's details OR input for new user
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={userFormData.firstName} onChange={handleUserChange} disabled={isSubmitting} />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={userFormData.lastName} onChange={handleUserChange} disabled={isSubmitting} />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={userFormData.email} onChange={handleUserChange} disabled={isSubmitting} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" value={userFormData.phone} onChange={handleUserChange} disabled={isSubmitting} />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
            ) : (
              // Existing logic for new driver: select existing user
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="createNewUser"
                    checked={createNewUser}
                    onCheckedChange={(checked) => {
                      setCreateNewUser(!!checked);
                      if (checked) {
                        setDriverFormData(prev => ({ ...prev, userId: '' })); // Clear userId if creating new
                        setUserFormData({ firstName: '', lastName: '', email: '', phone: '' }); // Clear new user data
                      } else {
                        // If unchecking, reset new user data and errors
                        setUserFormData({ firstName: '', lastName: '', email: '', phone: '' });
                      }
                      setErrors({});
                    }}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="createNewUser" className="text-base font-medium">Create New User for this Driver</Label>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="userId">User</Label>
                  <Select onValueChange={handleSelectUser} value={driverFormData.userId} disabled={isLoadingUsers || isSubmitting}>
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
              </>
            )}
          </section>

          <hr className="my-4 col-span-full" />

          {/* Driver specific fields */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Driver Details</h3>
            <div className="grid gap-2">
              <Label htmlFor="licenseNumber">Driver License No.</Label>
              <Input id="licenseNumber" value={driverFormData.licenseNumber} onChange={handleDriverChange} disabled={isSubmitting} />
              {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber}</p>}
            </div>
          </section>

          <hr className="my-4 col-span-full" />

          {/* Vehicle Selection/Creation (only for adding new driver) or Vehicle Assignment (for editing) */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Vehicle Details</h3>
            {!isEditing ? (
              // Logic for creating new driver: select existing vehicle or create new
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="createNewVehicle"
                    checked={createNewVehicle}
                    onCheckedChange={(checked) => {
                      setCreateNewVehicle(!!checked);
                      if (checked) {
                        setDriverFormData(prev => ({ ...prev, vehicleId: '' }));
                      }
                      setNewVehicleData({ licensePlate: '', model: '', year: new Date().getFullYear(), type: '' as VehicleType, status: VehicleStatus.Available });
                      setErrors({});
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
                    <Select onValueChange={handleSelectVehicle} value={driverFormData.vehicleId || 'null_option'} disabled={isLoadingVehicles || isSubmitting}>
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
                    {errors.vehicleId && <p className="text-red-500 text-xs mt-1">{errors.vehicleId}</p>}
                  </div>
                )}
              </>
            ) : (
              // For editing existing driver: only allow selecting/unassigning existing vehicle
              <div className="grid gap-2">
                <Label htmlFor="vehicleId">Vehicle</Label>
                <Select onValueChange={handleSelectVehicle} value={driverFormData.vehicleId || 'null_option'} disabled={isLoadingVehicles || isSubmitting}>
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
                {errors.vehicleId && <p className="text-red-500 text-xs mt-1">{errors.vehicleId}</p>}
              </div>
            )}
          </section>

          {/* Rating field (only for editing existing driver) */}
          {isEditing && (
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Rating</h3>
              <div className="grid gap-2">
                <Label htmlFor="rating">Rating</Label>
                <Input id="rating" type="number" value={driverFormData.rating} onChange={handleDriverChange} min="0" max="5" step="0.1" disabled={isSubmitting} />
                {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
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
