import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useNetwork } from '@/context/NetworkContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageTransition } from '@/components/PageTransition';
import { ThemeToggle } from '@/components/ThemeToggle';
import { House, LogIn, Moon, Sun, WifiOff, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { isOnline } = useNetwork();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.', {
        duration: 3000,
        className: 'error-toast',
      });
      return;
    }
    if (password.trim().length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    login(email, password);
  };

  return (
    <PageTransition>
      <div className='flex min-h-screen flex-col items-center justify-center bg-background p-4'>
        <div className='absolute top-4 right-4'>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className='mb-8 text-center'
        >
          <div className='flex items-center justify-center gap-2 text-2xl font-bold'>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
            >
              <House className='h-8 w-8 text-primary' />
            </motion.div>
            <span className='text-primary'>Switch</span>
            <span>Stack</span>
          </div>
          <p className='mt-2 text-sm text-muted-foreground'>
            Your Smart Home Control Center
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className='w-full max-w-md'
        >
          <Card className='glass-card'>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your email and password to access your dashboard
              </CardDescription>
              {!isOnline && (
                <div className='mt-2 flex items-center text-sm font-semibold text-destructive gap-1'>
                  <WifiOff className='h-4 w-4' />
                  <span>You're offline. Demo mode available.</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='name@example.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='password'>Password</Label>
                  <div className='relative'>
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='••••••••'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent focus:bg-transparent'
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className='h-4 w-4 text-muted-foreground' />
                      ) : (
                        <Eye className='h-4 w-4 text-muted-foreground' />
                      )}
                      <span className='sr-only'>
                        {showPassword ? 'Hide password' : 'Show password'}
                      </span>
                    </Button>
                  </div>
                </div>
                <Button type='submit' className='w-full' disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>

              <div className='mt-4 text-center text-sm'>
                <p className='text-muted-foreground'>
                  For demo, use: demo@example.com / password
                </p>
              </div>
            </CardContent>
            <CardFooter className='flex justify-center'>
              <p className='text-sm text-muted-foreground'>
                Don't have an account?{' '}
                <Link to='/register' className='text-primary hover:underline'>
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
