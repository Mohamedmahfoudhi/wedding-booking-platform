import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Skeleton } from 'primereact/skeleton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { adminApi } from '../../api/client';
import { User, UserRole } from '../../types';

const roleOptions = [
  { label: 'All Roles', value: '' },
  { label: 'Client', value: 'client' },
  { label: 'Provider', value: 'provider' },
  { label: 'Admin', value: 'admin' },
];

export default function AdminUsers() {
  const toast = useRef<Toast>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows] = useState(10);

  useEffect(() => {
    loadUsers();
  }, [first, roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers(
        first / rows + 1,
        rows,
        roleFilter && roleFilter !== '' ? roleFilter : undefined,
        globalFilter && globalFilter !== '' ? globalFilter : undefined
      );
      setUsers(response.data.data.users || []);
      setTotalRecords(response.data.data.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFirst(0);
    loadUsers();
  };

  const handleToggleStatus = (user: User) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    confirmDialog({
      message: `Are you sure you want to ${action} this user?`,
      header: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await adminApi.updateUser(user.id, { isActive: !user.isActive });
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: `User ${action}d successfully`,
          });
          loadUsers();
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to ${action} user`,
          });
        }
      },
    });
  };

  const handleDeleteUser = (user: User) => {
    confirmDialog({
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      header: 'Delete User',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await adminApi.deleteUser(user.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Deleted',
            detail: 'User deleted successfully',
          });
          loadUsers();
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete user',
          });
        }
      },
    });
  };

  const getRoleSeverity = (role: string) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'provider':
        return 'warning';
      default:
        return 'info';
    }
  };

  const nameTemplate = (rowData: User) => (
    <div className="flex align-items-center gap-2">
      <div className="w-2rem h-2rem border-circle bg-primary flex align-items-center justify-content-center text-white text-sm">
        {rowData.firstName?.charAt(0) || 'U'}
      </div>
      <div>
        <p className="m-0 font-medium">
          {rowData.firstName} {rowData.lastName}
        </p>
        <p className="m-0 text-xs text-color-secondary">{rowData.email}</p>
      </div>
    </div>
  );

  const statusTemplate = (rowData: User) => (
    <Tag
      value={rowData.isActive ? 'Active' : 'Inactive'}
      severity={rowData.isActive ? 'success' : 'danger'}
    />
  );

  const actionsTemplate = (rowData: User) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-text"
        onClick={() => {
          setSelectedUser(rowData);
          setDetailsVisible(true);
        }}
      />
      <Button
        icon={rowData.isActive ? 'pi pi-lock' : 'pi pi-unlock'}
        className={`p-button-rounded p-button-text ${rowData.isActive ? 'p-button-warning' : 'p-button-success'}`}
        onClick={() => handleToggleStatus(rowData)}
        tooltip={rowData.isActive ? 'Deactivate' : 'Activate'}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-text p-button-danger"
        onClick={() => handleDeleteUser(rowData)}
      />
    </div>
  );

  const header = (
    <div className="flex flex-column md:flex-row gap-3 justify-content-between">
      <div className="flex gap-2">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search users..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </span>
        <Dropdown
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.value)}
          options={roleOptions}
          placeholder="Filter by role"
        />
        <Button icon="pi pi-search" onClick={handleSearch} />
      </div>
      <span className="text-color-secondary">{totalRecords} users total</span>
    </div>
  );

  if (loading && users.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Users</h2>
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

      <h2 className="text-2xl font-bold mb-4">Users</h2>

      <Card>
        <DataTable
          value={users}
          responsiveLayout="scroll"
          paginator
          lazy
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPage={(e) => setFirst(e.first)}
          loading={loading}
          header={header}
          emptyMessage="No users found"
        >
          <Column header="User" body={nameTemplate} />
          <Column field="phone" header="Phone" />
          <Column
            field="role"
            header="Role"
            body={(row) => <Tag value={row.role} severity={getRoleSeverity(row.role)} />}
          />
          <Column field="isActive" header="Status" body={statusTemplate} />
          <Column
            field="createdAt"
            header="Joined"
            body={(row) => new Date(row.createdAt).toLocaleDateString()}
            sortable
          />
          <Column body={actionsTemplate} style={{ width: '150px' }} />
        </DataTable>
      </Card>

      {/* User Details Dialog */}
      <Dialog
        header="User Details"
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        style={{ width: '500px' }}
      >
        {selectedUser && (
          <div className="flex flex-column gap-4">
            <div className="text-center">
              <div className="w-5rem h-5rem border-circle bg-primary flex align-items-center justify-content-center mx-auto mb-3">
                <span className="text-3xl text-white font-bold">
                  {selectedUser.firstName?.charAt(0) || 'U'}
                </span>
              </div>
              <h3 className="m-0">
                {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <p className="text-color-secondary">{selectedUser.email}</p>
            </div>

            <div className="grid">
              <div className="col-6">
                <p className="text-color-secondary text-sm mb-1">Role</p>
                <Tag value={selectedUser.role} severity={getRoleSeverity(selectedUser.role)} />
              </div>
              <div className="col-6">
                <p className="text-color-secondary text-sm mb-1">Status</p>
                <Tag
                  value={selectedUser.isActive ? 'Active' : 'Inactive'}
                  severity={selectedUser.isActive ? 'success' : 'danger'}
                />
              </div>
              <div className="col-6">
                <p className="text-color-secondary text-sm mb-1">Phone</p>
                <p className="m-0 font-medium">{selectedUser.phone || '-'}</p>
              </div>
              <div className="col-6">
                <p className="text-color-secondary text-sm mb-1">Joined</p>
                <p className="m-0 font-medium">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="col-6">
                <p className="text-color-secondary text-sm mb-1">Email Verified</p>
                <p className="m-0 font-medium">
                  {selectedUser.emailVerified ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
