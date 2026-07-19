import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { authApi } from '../../api/client';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useRef<Toast>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const passwordHeader = <div className="font-bold mb-3">Pick a new password</div>;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all fields',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Passwords do not match',
      });
      return;
    }

    if (password.length < 8) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Password must be at least 8 characters',
      });
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token!, password);
      setSuccess(true);
      toast.current?.show({
        severity: 'success',
        summary: 'Password Reset',
        detail: 'Your password has been reset successfully',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reset password';
      if (message.includes('expired') || message.includes('invalid')) {
        setTokenValid(false);
      }
      toast.current?.show({
        severity: 'error',
        summary: 'Reset Failed',
        detail: message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen surface-ground px-4">
        <Toast ref={toast} />
        <Card className="w-full max-w-25rem">
          <div className="text-center">
            <div className="w-4rem h-4rem border-circle bg-red-100 flex align-items-center justify-content-center mx-auto mb-4">
              <i className="pi pi-times text-2xl text-red-600" />
            </div>
            <h3 className="mb-3">Invalid or Expired Link</h3>
            <p className="text-color-secondary mb-4">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link to="/forgot-password">
              <Button
                label="Request New Link"
                icon="pi pi-refresh"
                className="mb-3"
              />
            </Link>
            <div className="mt-3">
              <Link to="/login" className="text-primary no-underline">
                <i className="pi pi-arrow-left mr-2" />
                Back to Login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen surface-ground px-4">
        <Toast ref={toast} />
        <Card className="w-full max-w-25rem">
          <div className="text-center">
            <div className="w-4rem h-4rem border-circle bg-green-100 flex align-items-center justify-content-center mx-auto mb-4">
              <i className="pi pi-check text-2xl text-green-600" />
            </div>
            <h3 className="mb-3">Password Reset Successful</h3>
            <p className="text-color-secondary mb-4">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <Button
              label="Go to Login"
              icon="pi pi-sign-in"
              onClick={() => navigate('/login')}
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-ground px-4">
      <Toast ref={toast} />

      <Card className="w-full max-w-25rem shadow-2">
        <div className="text-center mb-5">
          <Link to="/" className="no-underline">
            <div className="flex align-items-center justify-content-center gap-2 mb-3">
              <i className="pi pi-heart-fill text-primary text-3xl" />
              <span className="text-2xl font-bold text-primary">WeddingBook</span>
            </div>
          </Link>
          <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
          <p className="text-color-secondary">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field mb-4">
            <label htmlFor="password" className="block font-medium mb-2">
              New Password
            </label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
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
              Confirm New Password
            </label>
            <Password
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full"
              inputClassName="w-full"
              toggleMask
              feedback={false}
              style={{ width: '100%' }}
              inputStyle={{ width: '100%' }}
            />
          </div>

          <Button
            type="submit"
            label="Reset Password"
            icon="pi pi-lock"
            className="w-full mb-4"
            loading={loading}
          />

          <div className="text-center">
            <Link to="/login" className="text-primary no-underline">
              <i className="pi pi-arrow-left mr-2" />
              Back to Login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
