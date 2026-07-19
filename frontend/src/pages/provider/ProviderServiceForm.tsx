import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { Skeleton } from 'primereact/skeleton';
import { providerServicesApi, categoriesApi, uploadApi } from '../../api/client';
import { Category, ServicePackage } from '../../types';

const locations = [
  { label: 'Tunis', value: 'Tunis' },
  { label: 'Sousse', value: 'Sousse' },
  { label: 'Sfax', value: 'Sfax' },
  { label: 'Monastir', value: 'Monastir' },
  { label: 'Bizerte', value: 'Bizerte' },
  { label: 'Nabeul', value: 'Nabeul' },
  { label: 'Hammamet', value: 'Hammamet' },
  { label: 'Djerba', value: 'Djerba' },
];

interface FormData {
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  location: string;
  images: { id?: string; url: string }[];
  packages: ServicePackage[];
}

export default function ProviderServiceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    categoryId: '',
    basePrice: 0,
    location: '',
    images: [],
    packages: [],
  });

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadService();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data.data.categories || []);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const loadService = async () => {
    try {
      const response = await providerServicesApi.getById(id!);
      const service = response.data.data.service;
      setFormData({
        name: service.name || '',
        description: service.description || '',
        categoryId: service.category?.id || '',
        basePrice: service.basePrice || 0,
        location: service.location || '',
        images: service.images || [],
        packages: service.packages || [],
      });
    } catch (error) {
      console.error('Failed to load service', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load service',
      });
      navigate('/provider/services');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: FileUploadHandlerEvent) => {
    const files = event.files;
    try {
      const uploadPromises = files.map((file) => uploadApi.upload(file));
      const responses = await Promise.all(uploadPromises);
      const newImages = responses.map((res) => ({
        url: res.data.data?.url ?? res.data.url,
        publicId: res.data.data?.publicId ?? res.data.publicId,
      }));
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
      toast.current?.show({
        severity: 'success',
        summary: 'Uploaded',
        detail: 'Images uploaded successfully',
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to upload images',
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddPackage = () => {
    setFormData((prev) => ({
      ...prev,
      packages: [
        ...prev.packages,
        { id: `temp-${Date.now()}`, name: '', description: '', price: 0 } as ServicePackage,
      ],
    }));
  };

  const handleUpdatePackage = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg, i) =>
        i === index ? { ...pkg, [field]: value } : pkg
      ),
    }));
  };

  const handleRemovePackage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.description || !formData.categoryId || !formData.basePrice || !formData.location) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields',
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        images: formData.images.map((img: { url: string; publicId?: string }) => ({
          url: img.url,
          ...(img.publicId ? { publicId: img.publicId } : {}),
        })),
        packages: formData.packages
          .filter((pkg) => pkg.name && pkg.price > 0)
          .map((pkg) => ({
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
          })),
      };

      if (isEdit) {
        await providerServicesApi.update(id!, payload);
        toast.current?.show({
          severity: 'success',
          summary: 'Updated',
          detail: 'Service updated successfully',
        });
      } else {
        await providerServicesApi.create(payload);
        toast.current?.show({
          severity: 'success',
          summary: 'Created',
          detail: 'Service created successfully',
        });
      }

      navigate('/provider/services');
    } catch (error: any) {
      console.error('Service creation error:', error.response?.data || error);
      const message = error.response?.data?.message
        || error.response?.data?.data?.message
        || 'Failed to save service';
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Skeleton width="200px" height="2rem" className="mb-4" />
        <Card>
          <Skeleton height="400px" />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-4">
        <h2 className="text-2xl font-bold m-0">
          {isEdit ? 'Edit Service' : 'Create New Service'}
        </h2>
        <Button
          label="Back to Services"
          icon="pi pi-arrow-left"
          className="p-button-text"
          onClick={() => navigate('/provider/services')}
        />
      </div>

      <div className="grid">
        <div className="col-12 lg:col-8">
          <Card>
            <h3 className="mt-0 mb-4">Basic Information</h3>

            <div className="field mb-4">
              <label htmlFor="name" className="block font-medium mb-2">
                Service Name *
              </label>
              <InputText
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter service name"
                className="w-full"
              />
            </div>

            <div className="field mb-4">
              <label htmlFor="description" className="block font-medium mb-2">
                Description *
              </label>
              <InputTextarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your service..."
                rows={5}
                className="w-full"
              />
            </div>

            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="field mb-4">
                  <label htmlFor="category" className="block font-medium mb-2">
                    Category *
                  </label>
                  <Dropdown
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => handleChange('categoryId', e.value)}
                    options={categories.map((c) => ({ label: c.name, value: c.id }))}
                    placeholder="Select category"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="col-12 md:col-6">
                <div className="field mb-4">
                  <label htmlFor="location" className="block font-medium mb-2">
                    Location *
                  </label>
                  <Dropdown
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.value)}
                    options={locations}
                    placeholder="Select location"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="field mb-4">
              <label htmlFor="basePrice" className="block font-medium mb-2">
                Base Price (TND) *
              </label>
              <InputNumber
                id="basePrice"
                value={formData.basePrice}
                onValueChange={(e) => handleChange('basePrice', e.value)}
                mode="currency"
                currency="TND"
                locale="fr-TN"
                className="w-full"
              />
            </div>

            <Divider />

            <h3 className="mb-4">Images</h3>
            <div className="mb-4">
              {formData.images.length > 0 && (
                <div className="flex gap-3 flex-wrap mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.url}
                        alt={`Service ${index + 1}`}
                        className="border-round"
                        style={{ width: '120px', height: '80px', objectFit: 'cover' }}
                      />
                      <Button
                        icon="pi pi-times"
                        className="p-button-rounded p-button-danger p-button-sm absolute"
                        style={{ top: '-8px', right: '-8px' }}
                        onClick={() => handleRemoveImage(index)}
                      />
                    </div>
                  ))}
                </div>
              )}
              <FileUpload
                mode="basic"
                accept="image/*"
                multiple
                maxFileSize={5000000}
                customUpload
                uploadHandler={handleImageUpload}
                chooseLabel="Upload Images"
                auto
              />
              <small className="text-color-secondary block mt-2">
                Max 5MB per image. Recommended: 1200x800px
              </small>
            </div>

            <Divider />

            <div className="flex justify-content-between align-items-center mb-4">
              <h3 className="m-0">Add-on Packages</h3>
              <Button
                label="Add Package"
                icon="pi pi-plus"
                className="p-button-outlined"
                onClick={handleAddPackage}
              />
            </div>

            {formData.packages.map((pkg, index) => (
              <Card key={pkg.id || index} className="mb-3 surface-ground">
                <div className="flex justify-content-between align-items-start mb-3">
                  <span className="font-medium">Package {index + 1}</span>
                  <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-text p-button-danger"
                    onClick={() => handleRemovePackage(index)}
                  />
                </div>
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <div className="field mb-3">
                      <label className="block font-medium mb-2">Package Name</label>
                      <InputText
                        value={pkg.name}
                        onChange={(e) => handleUpdatePackage(index, 'name', e.target.value)}
                        placeholder="e.g., Premium Package"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="col-12 md:col-6">
                    <div className="field mb-3">
                      <label className="block font-medium mb-2">Price (TND)</label>
                      <InputNumber
                        value={pkg.price}
                        onValueChange={(e) => handleUpdatePackage(index, 'price', e.value)}
                        mode="currency"
                        currency="TND"
                        locale="fr-TN"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="field">
                      <label className="block font-medium mb-2">Description</label>
                      <InputTextarea
                        value={pkg.description}
                        onChange={(e) => handleUpdatePackage(index, 'description', e.target.value)}
                        placeholder="What's included in this package?"
                        rows={2}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {formData.packages.length === 0 && (
              <p className="text-color-secondary text-center py-4">
                No packages added yet. Add packages for optional add-ons.
              </p>
            )}
          </Card>
        </div>

        <div className="col-12 lg:col-4">
          <Card className="sticky" style={{ top: '80px' }}>
            <h3 className="mt-0 mb-4">Preview</h3>
            <div
              className="border-round mb-3"
              style={{
                backgroundImage: `url(${formData.images[0]?.url || '/placeholder-service.jpg'})`,
                height: '150px',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <h4 className="mb-2">{formData.name || 'Service Name'}</h4>
            <p className="text-color-secondary text-sm mb-3 line-clamp-3">
              {formData.description || 'Service description will appear here...'}
            </p>
            <p className="font-bold text-primary text-xl mb-4">
              {formData.basePrice || 0} TND
            </p>

            <Divider />

            <Button
              label={isEdit ? 'Update Service' : 'Create Service'}
              icon="pi pi-check"
              className="w-full"
              onClick={handleSubmit}
              loading={saving}
            />
            <Button
              label="Cancel"
              className="w-full p-button-outlined mt-2"
              onClick={() => navigate('/provider/services')}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
