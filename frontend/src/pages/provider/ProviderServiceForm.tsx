import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
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
  images: { id?: string; url: string; publicId?: string }[];
  packages: ServicePackage[];
}

const REQUIRED = <span className="services-form-required">*</span>;

export default function ProviderServiceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);
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
      fileUploadRef.current?.clear();
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
        images: formData.images.map((img) => ({
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

  const completion = useMemo(() => {
    const checks = [
      !!formData.name,
      !!formData.description,
      !!formData.categoryId,
      !!formData.location,
      formData.basePrice > 0,
      formData.images.length > 0,
    ];
    const done = checks.filter(Boolean).length;
    return { done, total: checks.length, percent: Math.round((done / checks.length) * 100) };
  }, [formData]);

  if (loading) {
    return (
      <div>
        <Skeleton width="240px" height="2rem" className="mb-4" />
        <div className="grid">
          <div className="col-12 lg:col-8">
            <Skeleton height="600px" borderRadius="12px" />
          </div>
          <div className="col-12 lg:col-4">
            <Skeleton height="400px" borderRadius="12px" />
          </div>
        </div>
      </div>
    );
  }

  const sectionHeader = (icon: string, title: string, subtitle?: string) => (
    <div className="services-form-section-head">
      <div className="services-form-section-icon">
        <i className={icon} />
      </div>
      <div>
        <h3 className="services-form-section-title">{title}</h3>
        {subtitle && <p className="services-form-section-subtitle">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="services-form-page">
      <Toast ref={toast} />

      <div className="services-form-header">
        <div>
          <button
            type="button"
            className="services-form-back"
            onClick={() => navigate('/provider/services')}
          >
            <i className="pi pi-arrow-left" />
            <span>Back to services</span>
          </button>
          <h2 className="services-form-title">
            {isEdit ? 'Edit Service' : 'Create New Service'}
          </h2>
          <p className="services-form-subtitle">
            {isEdit
              ? 'Update your listing details, media, and packages.'
              : 'Fill in the details below to publish a new service to the marketplace.'}
          </p>
        </div>

        <div className="services-form-progress">
          <div className="services-form-progress-label">
            <span>Completion</span>
            <strong>{completion.percent}%</strong>
          </div>
          <div className="services-form-progress-bar">
            <div
              className="services-form-progress-fill"
              style={{ width: `${completion.percent}%` }}
            />
          </div>
          <span className="services-form-progress-note">
            {completion.done} of {completion.total} required fields complete
          </span>
        </div>
      </div>

      <div className="grid">
        <div className="col-12 lg:col-8">
          {/* Basic Information */}
          <div className="services-form-card">
            {sectionHeader('pi pi-info-circle', 'Basic Information', 'Introduce your service to customers.')}

            <div className="field">
              <label htmlFor="name" className="services-form-label">
                Service Name {REQUIRED}
              </label>
              <InputText
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Premium Wedding Photography Package"
                className="w-full"
              />
              <small className="services-form-help">
                Give your service a clear, memorable name.
              </small>
            </div>

            <div className="field">
              <label htmlFor="description" className="services-form-label">
                Description {REQUIRED}
              </label>
              <InputTextarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe what makes your service unique — what's included, your experience, and why couples should book with you..."
                rows={6}
                className="w-full"
                autoResize
              />
              <small className="services-form-help">
                {formData.description.length} characters — aim for at least 100.
              </small>
            </div>

            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="field">
                  <label htmlFor="category" className="services-form-label">
                    Category {REQUIRED}
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
                <div className="field">
                  <label htmlFor="location" className="services-form-label">
                    Location {REQUIRED}
                  </label>
                  <Dropdown
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.value)}
                    options={locations}
                    placeholder="Select city"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="services-form-card">
            {sectionHeader('pi pi-tag', 'Pricing', 'Set the base price for your service.')}
            <div className="field">
              <label htmlFor="basePrice" className="services-form-label">
                Base Price (TND) {REQUIRED}
              </label>
              <InputNumber
                id="basePrice"
                value={formData.basePrice}
                onValueChange={(e) => handleChange('basePrice', e.value)}
                mode="currency"
                currency="TND"
                locale="fr-TN"
                className="w-full"
                placeholder="0"
              />
              <small className="services-form-help">
                Customers will see this as your starting price. Add packages below for upgrade options.
              </small>
            </div>
          </div>

          {/* Images */}
          <div className="services-form-card">
            {sectionHeader('pi pi-image', 'Photos', 'Upload high-quality images that showcase your work.')}

            {formData.images.length > 0 && (
              <div className="services-form-gallery">
                {formData.images.map((image, index) => (
                  <div key={index} className="services-form-thumb">
                    <img src={image.url} alt={`Service ${index + 1}`} />
                    {index === 0 && <span className="services-form-thumb-badge">Cover</span>}
                    <button
                      type="button"
                      className="services-form-thumb-remove"
                      onClick={() => handleRemoveImage(index)}
                      aria-label="Remove image"
                    >
                      <i className="pi pi-times" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="services-form-dropzone">
              <i className="pi pi-cloud-upload services-form-dropzone-icon" />
              <p className="services-form-dropzone-title">Upload photos</p>
              <p className="services-form-dropzone-help">
                PNG or JPG • Max 5 MB per image • Recommended 1200×800px
              </p>
              <FileUpload
                ref={fileUploadRef}
                mode="basic"
                accept="image/*"
                multiple
                maxFileSize={5000000}
                customUpload
                uploadHandler={handleImageUpload}
                chooseLabel="Choose files"
                auto
                className="services-form-dropzone-button"
              />
            </div>
          </div>

          {/* Packages */}
          <div className="services-form-card">
            <div className="services-form-section-head services-form-section-head--split">
              <div className="flex align-items-center gap-3">
                <div className="services-form-section-icon">
                  <i className="pi pi-box" />
                </div>
                <div>
                  <h3 className="services-form-section-title">Add-on Packages</h3>
                  <p className="services-form-section-subtitle">
                    Optional upgrades customers can choose at checkout.
                  </p>
                </div>
              </div>
              <Button
                label="Add Package"
                icon="pi pi-plus"
                className="p-button-outlined p-button-sm"
                onClick={handleAddPackage}
              />
            </div>

            {formData.packages.length === 0 ? (
              <div className="services-form-empty">
                <i className="pi pi-box" />
                <p>No packages added yet.</p>
                <span>Give customers upgrade options like premium editing or extra hours.</span>
              </div>
            ) : (
              <div className="services-form-packages">
                {formData.packages.map((pkg, index) => (
                  <div key={pkg.id || index} className="services-form-package">
                    <div className="services-form-package-head">
                      <span className="services-form-package-num">Package {index + 1}</span>
                      <button
                        type="button"
                        className="services-form-package-remove"
                        onClick={() => handleRemovePackage(index)}
                        aria-label="Remove package"
                      >
                        <i className="pi pi-trash" />
                      </button>
                    </div>
                    <div className="grid">
                      <div className="col-12 md:col-7">
                        <div className="field">
                          <label className="services-form-label">Package Name</label>
                          <InputText
                            value={pkg.name}
                            onChange={(e) => handleUpdatePackage(index, 'name', e.target.value)}
                            placeholder="e.g., Premium Package"
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="col-12 md:col-5">
                        <div className="field">
                          <label className="services-form-label">Price (TND)</label>
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
                          <label className="services-form-label">Description</label>
                          <InputTextarea
                            value={pkg.description}
                            onChange={(e) => handleUpdatePackage(index, 'description', e.target.value)}
                            placeholder="What's included in this package?"
                            rows={2}
                            className="w-full"
                            autoResize
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="col-12 lg:col-4">
          <div className="services-form-preview">
            <div className="services-form-preview-header">
              <i className="pi pi-eye" />
              <span>Live preview</span>
            </div>

            <div className="services-form-preview-card">
              <div
                className="services-form-preview-image"
                style={{
                  backgroundImage: formData.images[0]?.url
                    ? `url(${formData.images[0].url})`
                    : undefined,
                }}
              >
                {!formData.images[0] && (
                  <div className="services-form-preview-image-empty">
                    <i className="pi pi-image" />
                    <span>Image goes here</span>
                  </div>
                )}
              </div>
              <div className="services-form-preview-body">
                {formData.categoryId && (
                  <span className="services-form-preview-chip">
                    {categories.find((c) => c.id === formData.categoryId)?.name}
                  </span>
                )}
                <h4>{formData.name || 'Your service name'}</h4>
                {formData.location && (
                  <div className="services-form-preview-location">
                    <i className="pi pi-map-marker" />
                    <span>{formData.location}</span>
                  </div>
                )}
                <p className="services-form-preview-desc">
                  {formData.description || 'A short description of your service will appear here.'}
                </p>
                <div className="services-form-preview-price">
                  <span>Starting at</span>
                  <strong>
                    {formData.basePrice > 0 ? `${formData.basePrice.toLocaleString()} TND` : '—'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="services-form-preview-actions">
              <Button
                label={isEdit ? 'Update Service' : 'Publish Service'}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
