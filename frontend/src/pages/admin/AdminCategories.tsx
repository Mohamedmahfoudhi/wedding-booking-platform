import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Skeleton } from 'primereact/skeleton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { categoriesApi, uploadApi } from '../../api/client';
import { Category } from '../../types';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
}

const initialFormData: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  image: '',
};

export default function AdminCategories() {
  const toast = useRef<Toast>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data.data?.categories || []);
    } catch (error) {
      console.error('Failed to load categories', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData(initialFormData);
    setIsEdit(false);
    setSelectedCategory(null);
    setDialogVisible(true);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      image: category.image || '',
    });
    setIsEdit(true);
    setSelectedCategory(category);
    setDialogVisible(true);
  };

  const handleDelete = (category: Category) => {
    confirmDialog({
      message: `Are you sure you want to delete "${category.name}"? This will also affect all services in this category.`,
      header: 'Delete Category',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await categoriesApi.delete(category.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Category deleted successfully',
          });
          loadCategories();
        } catch (error: any) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to delete category',
          });
        }
      },
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Auto-generate slug from name
      if (field === 'name' && !isEdit) {
        newData.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
      }
      return newData;
    });
  };

  const handleImageUpload = async (event: FileUploadHandlerEvent) => {
    try {
      const response = await uploadApi.upload(event.files[0]);
      setFormData((prev) => ({
        ...prev,
        image: response.data.data?.url ?? response.data.url,
      }));
      toast.current?.show({
        severity: 'success',
        summary: 'Uploaded',
        detail: 'Image uploaded successfully',
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to upload image',
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Name and slug are required',
      });
      return;
    }

    setSaving(true);
    try {
      if (isEdit && selectedCategory) {
        await categoriesApi.update(selectedCategory.id, formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Updated',
          detail: 'Category updated successfully',
        });
      } else {
        await categoriesApi.create(formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Created',
          detail: 'Category created successfully',
        });
      }
      setDialogVisible(false);
      loadCategories();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to save category',
      });
    } finally {
      setSaving(false);
    }
  };

  const imageTemplate = (rowData: Category) => (
    <div
      className="w-3rem h-3rem border-round"
      style={{
        backgroundImage: `url(${rowData.image || '/placeholder-category.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );

  const actionsTemplate = (rowData: Category) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-text"
        onClick={() => handleEdit(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-text p-button-danger"
        onClick={() => handleDelete(rowData)}
      />
    </div>
  );

  const header = (
    <div className="flex justify-content-between align-items-center">
      <span>{categories.length} categories total</span>
      <Button
        label="Add Category"
        icon="pi pi-plus"
        onClick={handleAdd}
      />
    </div>
  );

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Categories</h2>
        <Card>
          <Skeleton height="400px" />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <h2 className="text-2xl font-bold mb-4">Categories</h2>

      <Card>
        <DataTable
          value={categories}
          responsiveLayout="scroll"
          header={header}
          emptyMessage="No categories found"
        >
          <Column header="Image" body={imageTemplate} style={{ width: '60px' }} />
          <Column field="name" header="Name" sortable />
          <Column field="slug" header="Slug" />
          <Column field="description" header="Description" />
          <Column
            field="serviceCount"
            header="Services"
            body={(row) => row.serviceCount || 0}
            sortable
          />
          <Column body={actionsTemplate} style={{ width: '100px' }} />
        </DataTable>
      </Card>

      {/* Category Form Dialog */}
      <Dialog
        header={isEdit ? 'Edit Category' : 'Add Category'}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: '500px' }}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setDialogVisible(false)}
            />
            <Button
              label={isEdit ? 'Update' : 'Create'}
              icon="pi pi-check"
              onClick={handleSave}
              loading={saving}
            />
          </div>
        }
      >
        <div className="flex flex-column gap-4">
          <div className="field">
            <label className="block font-medium mb-2">Name *</label>
            <InputText
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full"
              placeholder="Category name"
            />
          </div>

          <div className="field">
            <label className="block font-medium mb-2">Slug *</label>
            <InputText
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="w-full"
              placeholder="category-slug"
            />
            <small className="text-color-secondary">
              URL-friendly identifier (auto-generated from name)
            </small>
          </div>

          <div className="field">
            <label className="block font-medium mb-2">Description</label>
            <InputTextarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full"
              rows={3}
              placeholder="Category description"
            />
          </div>

          <div className="field">
            <label className="block font-medium mb-2">Icon (PrimeIcons class)</label>
            <InputText
              value={formData.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
              className="w-full"
              placeholder="e.g., pi pi-building"
            />
            {formData.icon && (
              <div className="mt-2 flex align-items-center gap-2">
                <i className={formData.icon} />
                <span className="text-sm text-color-secondary">Preview</span>
              </div>
            )}
          </div>

          <div className="field">
            <label className="block font-medium mb-2">Image</label>
            {formData.image && (
              <div className="mb-2">
                <img
                  src={formData.image}
                  alt="Category"
                  className="border-round"
                  style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'cover' }}
                />
              </div>
            )}
            <FileUpload
              mode="basic"
              accept="image/*"
              maxFileSize={2000000}
              customUpload
              uploadHandler={handleImageUpload}
              chooseLabel="Upload Image"
              auto
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
