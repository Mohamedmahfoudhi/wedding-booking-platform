import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';
import { Skeleton } from 'primereact/skeleton';
import { Tag } from 'primereact/tag';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { providersApi, usersApi, uploadApi, providerStripeApi } from '../../api/client';
import { loadUser } from '../../store/slices/authSlice';

interface ProfileData {
  businessName: string;
  description: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  logo: string;
}

interface AccountData {
  firstName: string;
  lastName: string;
  email: string;
}

export default function ProviderSettings() {
  const toast = useRef<Toast>(null);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<'connected' | 'pending' | 'not_connected'>('not_connected');
  const [stripeLoading, setStripeLoading] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    businessName: '',
    description: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    logo: '',
  });

  const [accountData, setAccountData] = useState<AccountData>({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [profileRes, stripeRes] = await Promise.all([
        providersApi.getProfile(),
        providerStripeApi
          .getStatus()
          .catch(() => ({ data: { data: { status: 'not_connected' } } }) as any),
      ]);

      const profile = profileRes.data.data?.profile || profileRes.data.data || {};
      setProfileData({
        businessName: profile.businessName || '',
        description: profile.description || '',
        phone: profile.phone || '',
        website: profile.website || '',
        address: profile.address || '',
        city: profile.city || '',
        logo: profile.logo || '',
      });

      setAccountData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
      });

      setStripeStatus(stripeRes.data.data?.status || 'not_connected');
    } catch (error) {
      console.error('Failed to load settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAccountChange = (field: string, value: string) => {
    setAccountData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (event: FileUploadHandlerEvent) => {
    try {
      const response = await uploadApi.upload(event.files[0]);
      setProfileData((prev) => ({
        ...prev,
        logo: response.data.data?.url ?? response.data.url,
      }));
      toast.current?.show({
        severity: 'success',
        summary: 'Uploaded',
        detail: 'Logo uploaded successfully',
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to upload logo',
      });
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await providersApi.updateProfile({ ...profileData });
      toast.current?.show({
        severity: 'success',
        summary: 'Saved',
        detail: 'Profile updated successfully',
      });
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to save profile',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAccount = async () => {
    setSaving(true);
    try {
      await usersApi.updateProfile({ ...accountData });
      dispatch(loadUser());
      toast.current?.show({
        severity: 'success',
        summary: 'Saved',
        detail: 'Account updated successfully',
      });
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to save account',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Passwords do not match',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Password must be at least 8 characters',
      });
      return;
    }

    setSaving(true);
    try {
      await usersApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Password changed successfully',
      });
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to change password',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConnectStripe = async () => {
    setStripeLoading(true);
    try {
      const response = await providerStripeApi.startOnboarding();
      const url =
        response.data.data?.url || response.data.url;
      if (url) window.location.href = url;
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to connect Stripe',
      });
      setStripeLoading(false);
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

      <h2 className="text-2xl font-bold mb-4">Settings</h2>

      <TabView>
        <TabPanel header="Business Profile">
          <Card>
            <div className="grid">
              <div className="col-12 md:col-4 text-center">
                <div className="mb-4">
                  {profileData.logo ? (
                    <img
                      src={profileData.logo}
                      alt="Business Logo"
                      className="border-circle"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="w-10rem h-10rem border-circle bg-primary flex align-items-center justify-content-center mx-auto"
                    >
                      <span className="text-5xl text-white font-bold">
                        {profileData.businessName?.charAt(0) || 'B'}
                      </span>
                    </div>
                  )}
                </div>
                <FileUpload
                  mode="basic"
                  accept="image/*"
                  maxFileSize={2000000}
                  customUpload
                  uploadHandler={handleLogoUpload}
                  chooseLabel="Upload Logo"
                  auto
                />
              </div>

              <div className="col-12 md:col-8">
                <div className="field mb-4">
                  <label className="block font-medium mb-2">Business Name</label>
                  <InputText
                    value={profileData.businessName}
                    onChange={(e) => handleProfileChange('businessName', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="field mb-4">
                  <label className="block font-medium mb-2">Description</label>
                  <InputTextarea
                    value={profileData.description}
                    onChange={(e) => handleProfileChange('description', e.target.value)}
                    rows={4}
                    className="w-full"
                  />
                </div>

                <div className="grid">
                  <div className="col-12 md:col-6">
                    <div className="field mb-4">
                      <label className="block font-medium mb-2">Phone</label>
                      <InputText
                        value={profileData.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="col-12 md:col-6">
                    <div className="field mb-4">
                      <label className="block font-medium mb-2">Website</label>
                      <InputText
                        value={profileData.website}
                        onChange={(e) => handleProfileChange('website', e.target.value)}
                        className="w-full"
                        placeholder="https://"
                      />
                    </div>
                  </div>
                </div>

                <div className="field mb-4">
                  <label className="block font-medium mb-2">Address</label>
                  <InputText
                    value={profileData.address}
                    onChange={(e) => handleProfileChange('address', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="field mb-4">
                  <label className="block font-medium mb-2">City</label>
                  <InputText
                    value={profileData.city}
                    onChange={(e) => handleProfileChange('city', e.target.value)}
                    className="w-full"
                  />
                </div>

                <Button
                  label="Save Profile"
                  icon="pi pi-check"
                  onClick={handleSaveProfile}
                  loading={saving}
                />
              </div>
            </div>
          </Card>
        </TabPanel>

        <TabPanel header="Account">
          <Card>
            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="field mb-4">
                  <label className="block font-medium mb-2">First Name</label>
                  <InputText
                    value={accountData.firstName}
                    onChange={(e) => handleAccountChange('firstName', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="col-12 md:col-6">
                <div className="field mb-4">
                  <label className="block font-medium mb-2">Last Name</label>
                  <InputText
                    value={accountData.lastName}
                    onChange={(e) => handleAccountChange('lastName', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="field mb-4">
              <label className="block font-medium mb-2">Email</label>
              <InputText
                value={accountData.email}
                onChange={(e) => handleAccountChange('email', e.target.value)}
                className="w-full"
                type="email"
              />
            </div>

            <Button
              label="Save Account"
              icon="pi pi-check"
              onClick={handleSaveAccount}
              loading={saving}
            />

            <Divider />

            <h3>Change Password</h3>
            <div className="grid">
              <div className="col-12 md:col-4">
                <div className="field mb-4">
                  <label className="block font-medium mb-2">Current Password</label>
                  <Password
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full"
                    inputClassName="w-full"
                    toggleMask
                    feedback={false}
                  />
                </div>
              </div>
              <div className="col-12 md:col-4">
                <div className="field mb-4">
                  <label className="block font-medium mb-2">New Password</label>
                  <Password
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full"
                    inputClassName="w-full"
                    toggleMask
                  />
                </div>
              </div>
              <div className="col-12 md:col-4">
                <div className="field mb-4">
                  <label className="block font-medium mb-2">Confirm Password</label>
                  <Password
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full"
                    inputClassName="w-full"
                    toggleMask
                    feedback={false}
                  />
                </div>
              </div>
            </div>
            <Button
              label="Change Password"
              icon="pi pi-lock"
              onClick={handleChangePassword}
              loading={saving}
              disabled={!passwordData.currentPassword || !passwordData.newPassword}
            />
          </Card>
        </TabPanel>

        <TabPanel header="Payments">
          <Card>
            <h3 className="mt-0 mb-4">Stripe Connect</h3>
            <p className="text-color-secondary mb-4">
              Connect your Stripe account to receive payments from customers.
            </p>

            <div className="surface-ground p-4 border-round mb-4">
              <div className="flex align-items-center justify-content-between">
                <div className="flex align-items-center gap-3">
                  <i className="pi pi-credit-card text-2xl text-color-secondary" />
                  <div>
                    <p className="font-medium m-0">Stripe Account</p>
                    <p className="text-sm text-color-secondary m-0">
                      {stripeStatus === 'connected'
                        ? 'Your account is connected'
                        : stripeStatus === 'pending'
                        ? 'Verification in progress'
                        : 'Not connected'}
                    </p>
                  </div>
                </div>
                <Tag
                  value={stripeStatus === 'connected' ? 'Connected' : stripeStatus === 'pending' ? 'Pending' : 'Not Connected'}
                  severity={stripeStatus === 'connected' ? 'success' : stripeStatus === 'pending' ? 'warning' : 'danger'}
                />
              </div>
            </div>

            {stripeStatus !== 'connected' && (
              <Button
                label={stripeStatus === 'pending' ? 'Complete Setup' : 'Connect Stripe'}
                icon="pi pi-external-link"
                onClick={handleConnectStripe}
                loading={stripeLoading}
              />
            )}

            {stripeStatus === 'connected' && (
              <Button
                label="Open Stripe Dashboard"
                icon="pi pi-external-link"
                className="p-button-outlined"
                onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
              />
            )}
          </Card>
        </TabPanel>
      </TabView>
    </div>
  );
}
