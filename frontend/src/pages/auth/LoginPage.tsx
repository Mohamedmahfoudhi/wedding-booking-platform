import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Checkbox } from 'primereact/checkbox';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login } from '../../store/slices/authSlice';
import { UserRole } from '../../types';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useRef<Toast>(null);

  const { loading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      if (user.role === UserRole.ADMIN) {
        navigate('/admin');
      } else if (user.role === UserRole.PROVIDER) {
        navigate('/provider');
      } else {
        navigate(from);
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  useEffect(() => {
    if (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Login Failed',
        detail: error,
        life: 5000,
      });
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all fields',
      });
      return;
    }

    dispatch(login({ email, password }));
  };

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
          <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
          <p className="text-color-secondary">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field mb-4">
            <label htmlFor="email" className="block font-medium mb-2">
              Email
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

          <div className="field mb-4">
            <label htmlFor="password" className="block font-medium mb-2">
              Password
            </label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full"
              inputClassName="w-full"
              toggleMask
              feedback={false}
              autoComplete="current-password"
              style={{ width: '100%' }}
              inputStyle={{ width: '100%' }}
            />
          </div>

          <div className="flex justify-content-between align-items-center mb-4">
            <div className="flex align-items-center">
              <Checkbox
                inputId="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.checked || false)}
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="text-primary text-sm no-underline">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            label="Sign In"
            icon="pi pi-sign-in"
            className="w-full mb-4"
            loading={loading}
          />
        </form>

        <div className="text-center">
          <span className="text-color-secondary">Don't have an account? </span>
          <Link to="/register" className="text-primary font-medium no-underline">
            Sign up
          </Link>
        </div>

        <div className="mt-4 text-center">
          <span className="text-color-secondary text-sm">Want to join as a vendor? </span>
          <Link to="/register?role=provider" className="text-primary font-medium no-underline text-sm">
            Register as provider
          </Link>
        </div>
      </Card>
    </div>
  );
}
