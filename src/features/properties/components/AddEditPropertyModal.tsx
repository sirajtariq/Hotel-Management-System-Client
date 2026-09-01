import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Phone, Mail, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Property, CreatePropertyInput } from '@/types/properties';
import { propertyService } from '../services/propertyService';

interface AddEditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  propertyToEdit?: Property | null;
}

export function AddEditPropertyModal({
  isOpen,
  onClose,
  onSuccess,
  propertyToEdit,
}: AddEditPropertyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    property_type: 'Hotel Branch',
    city: '',
    address: '',
    phone: '',
    email: '',
    monthly_rent: 0,
    status: 'ACTIVE',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (propertyToEdit) {
        setFormData({
          name: propertyToEdit.name || '',
          property_type: propertyToEdit.propertyType || propertyToEdit.type || 'Hotel Branch',
          city: propertyToEdit.city || '',
          address: propertyToEdit.address || '',
          phone: propertyToEdit.phone || '',
          email: propertyToEdit.email || '',
          monthly_rent: Number(propertyToEdit.monthly_rent || propertyToEdit.monthlyRent || 0),
          status: propertyToEdit.status ? String(propertyToEdit.status).toUpperCase() : 'ACTIVE',
        });
      } else {
        setFormData({
          name: '',
          property_type: 'Hotel Branch',
          city: '',
          address: '',
          phone: '',
          email: '',
          monthly_rent: 0,
          status: 'ACTIVE',
        });
      }
    }
  }, [isOpen, propertyToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Property name is required.');
      return;
    }
    if (!formData.city.trim()) {
      setError('City is required.');
      return;
    }
    if (!formData.address.trim()) {
      setError('Full address is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreatePropertyInput = {
        name: formData.name.trim(),
        property_type: formData.property_type,
        city: formData.city.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        monthly_rent: Number(formData.monthly_rent) || 0,
        status: formData.status,
      };

      if (propertyToEdit) {
        await propertyService.updateProperty(propertyToEdit.id, payload);
      } else {
        await propertyService.createProperty(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save property. Please check input values.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-indigo-900 flex items-center justify-center text-white shadow-xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {propertyToEdit ? 'Edit Property Branch' : 'Add New Property Branch'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {propertyToEdit ? 'Update branch address, rent & operational status' : 'Register a new hotel, villa, or branch location'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Property Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Property Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. F-7 Executive Villa"
                className="text-xs"
                required
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Property Type</label>
              <select
                value={formData.property_type}
                onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
              >
                <option value="Hotel Branch">Hotel Branch</option>
                <option value="Serviced Apartment">Serviced Apartment</option>
                <option value="Boutique Villa">Boutique Villa</option>
                <option value="Resort">Resort</option>
                <option value="Guesthouse">Guesthouse</option>
              </select>
            </div>

            {/* City */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">City *</label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Islamabad"
                className="text-xs"
                required
              />
            </div>

            {/* Monthly Rent / Lease Cost */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Monthly Rent / Lease Cost (PKR)</label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={formData.monthly_rent}
                onChange={(e) => setFormData({ ...formData, monthly_rent: parseFloat(e.target.value) || 0 })}
                placeholder="e.g. 250000"
                className="text-xs font-mono"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+92 300 1234567"
                className="text-xs font-mono"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="branch@hotel.com"
                className="text-xs"
              />
            </div>

            {/* Operational Status */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Operational Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
              >
                <option value="ACTIVE">ACTIVE — Operational & Accepting Bookings</option>
                <option value="MAINTENANCE">MAINTENANCE — Under Renovation / Closed</option>
                <option value="INACTIVE">INACTIVE — Suspended</option>
              </select>
            </div>

            {/* Full Address */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Address *</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address, sector/block, landmark..."
                rows={2}
                className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 resize-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="text-xs font-semibold bg-indigo-900 hover:bg-indigo-800 text-white">
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span>{propertyToEdit ? 'Update Property Branch' : 'Add Property Branch'}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
