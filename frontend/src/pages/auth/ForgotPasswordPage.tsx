import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { authApi } from '../../api/client';

export default function ForgotPasswordPage() {
  const toast = useRef<Toast>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please enter your email address',
      });
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.current?.show({
        severity: 'success',
        summary: 'Email Sent',
        detail: 'Check your inbox for password reset instructions',
      });
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Request Failed',
        detail: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-ground px-4">
      <Toast ref={toast} />

      <Card className="w-full max-w-25rem">
        <div className="text-center mb-5">
          <Link to="/" className="no-underline">
            <div className="flex align-items-center justify-content-center gap-2 mb-3">
              <i className="pi pi-heart-fill text-primary text-3xl" />
              <span className="text-2xl font-bold text-primary">WeddingBook</span>
            </div>
          </Link>
          <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
          <p className="text-color-secondary">
            Enter your email and we'll send you instructions to reset your password
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-4rem h-4rem border-circle bg-green-100 flex align-items-center justify-content-center mx-auto mb-4">
              <i className="pi pi-check text-2xl text-green-600" />
            </div>
            <h3 className="mb-3">Check Your Email</h3>
            <p className="text-color-secondary mb-4">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <p className="text-sm text-color-secondary mb-4">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                className="p-link text-primary"
                onClick={() => setSent(false)}
              >
                try again
              </button>
            </p>
            <Link to="/login">
              <Button
                label="Back to Login"
                icon="pi pi-arrow-left"
                className="p-button-outlined"
              />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field mb-4">
              <label htmlFor="email" className="block font-medium mb-2">
                Email Address
              </label>
              <InputText
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full"
                autoComplete="email"
              />
            </div>

            <Button
              type="submit"
              label="Send Reset Link"
              icon="pi pi-envelope"
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
        )}
      </Card>
    </div>
  );
}
