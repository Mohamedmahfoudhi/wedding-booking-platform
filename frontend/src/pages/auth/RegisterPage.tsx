import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { register } from '../../store/slices/authSlice';
import { UserRole } from '../../types';

const roleOptions = [
  { label: 'I want to book services (Client)', value: UserRole.CLIENT },
  { label: 'I want to offer services (Provider)', value: UserRole.PROVIDER },
];

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useRef<Toast>(null);

  const { loading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: searchParams.get('role') === 'provider' ? UserRole.PROVIDER : UserRole.CLIENT,
    // Provider fields
    businessName: '',
    businessDescription: '',
    termsAccepted: false,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === UserRole.PROVIDER) {
        navigate('/provider');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Registration Failed',
        detail: error,
        life: 5000,
      });
    }
  }, [error]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields',
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Passwords do not match',
      });
      return false;
    }

    if (formData.password.length < 8) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Password must be at least 8 characters',
      });
      return false;
    }

    if (formData.role === UserRole.PROVIDER && !formData.businessName) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Business name is required for providers',
      });
      return false;
    }

    if (!formData.termsAccepted) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please accept the terms and conditions',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const registerData: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
    };

    if (formData.role === UserRole.PROVIDER) {
      registerData.businessName = formData.businessName;
      registerData.businessDescription = formData.businessDescription;
    }

    dispatch(register(registerData));
  };

  const passwordHeader = <div className="font-bold mb-3">Pick a password</div>;
  const passwordFooter = (
    <>
      <Divider />
      <p className="mt-2 text-sm">Requirements:</p>
      <ul className="pl-2 ml-2 mt-0 line-height-3 text-sm">
        <li>At least one lowercase</li>
        <li>At least one uppercase</li>
        <li>At least one numeric</li>
        <li>Minimum 8 characters</li>
      </ul>
    </>
  );

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-ground px-4 py-6">
      <Toast ref={toast} />

      <Card className="w-full max-w-30rem shadow-2">
        <div className="text-center mb-5">
          <Link to="/" className="no-underline">
            <div className="flex align-items-center justify-content-center gap-2 mb-3">
              <i className="pi pi-heart-fill text-primary text-3xl" />
              <span className="text-2xl font-bold text-primary">WeddingBook</span>
            </div>
          </Link>
          <h2 className="text-2xl font-bold mb-2">Create an Account</h2>
          <p className="text-color-secondary">Join our wedding marketplace</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Account Type */}
          <div className="field mb-4">
            <label className="block font-medium mb-2">I want to...</label>
            <Dropdown
              value={formData.role}
              onChange={(e) => handleChange('role', e.value)}
              options={roleOptions}
              className="w-full"
            />
          </div>

          <Divider />

          {/* Basic Info */}
          <div className="grid">
            <div className="col-12 md:col-6">
              <div className="field mb-4">
                <label htmlFor="firstName" className="block font-medium mb-2">
                  First Name *
                </label>
                <InputText
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="First name"
                  className="w-full"
                />
              </div>
            </div>
            <div className="col-12 md:col-6">
              <div className="field mb-4">
                <label htmlFor="lastName" className="block font-medium mb-2">
                  Last Name *
                </label>
                <InputText
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Last name"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="field mb-4">
            <label htmlFor="email" className="block font-medium mb-2">
              Email *
            </label>
            <InputText
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter your email"
              className="w-full"
            />
          </div>

          <div className="field mb-4">
            <label htmlFor="phone" className="block font-medium mb-2">
              Phone Number
            </label>
            <InputText
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+216 XX XXX XXX"
              className="w-full"
            />
          </div>

          {/* Provider-specific fields */}
          {formData.role === UserRole.PROVIDER && (
            <>
              <Divider />
              <h4 className="mt-0 mb-4">Business Information</h4>

              <div className="field mb-4">
                <label htmlFor="businessName" className="block font-medium mb-2">
                  Business Name *
                </label>
                <InputText
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  placeholder="Your business name"
                  className="w-full"
                />
              </div>

              <div className="field mb-4">
                <label htmlFor="businessDescription" className="block font-medium mb-2">
                  Business Description
                </label>
                <InputTextarea
                  id="businessDescription"
                  value={formData.businessDescription}
                  onChange={(e) => handleChange('businessDescription', e.target.value)}
                  placeholder="Tell customers about your services..."
                  rows={3}
                  className="w-full"
                />
              </div>
            </>
          )}

          <Divider />

          {/* Password */}
          <div className="field mb-4">
            <label htmlFor="password" className="block font-medium mb-2">
              Password *
            </label>
            <Password
              id="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Create a password"
              className="w-full"
              inputClassName="w-full"
              toggleMask
              header={passwordHeader}
              footer={passwordFooter}
              style={{ width: '100%' }}
              inputStyle={{ width: '100%' }}
            />
          </div>

          <div className="field mb-4">
            <label htmlFor="confirmPassword" className="block font-medium mb-2">
              Confirm Password *
            </label>
            <Password
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="Confirm your password"
              className="w-full"
              inputClassName="w-full"
              toggleMask
              feedback={false}
              style={{ width: '100%' }}
              inputStyle={{ width: '100%' }}
            />
          </div>

          {/* Terms */}
          <div className="flex align-items-center mb-4">
            <Checkbox
              inputId="terms"
              checked={formData.termsAccepted}
              onChange={(e) => handleChange('termsAccepted', e.checked)}
            />
            <label htmlFor="terms" className="ml-2 text-sm">
              I agree to the{' '}
              <Link to="/terms" className="text-primary">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            label="Create Account"
            icon="pi pi-user-plus"
            className="w-full mb-4"
            loading={loading}
          />
        </form>

        <div className="text-center">
          <span className="text-color-secondary">Already have an account? </span>
          <Link to="/login" className="text-primary font-medium no-underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
