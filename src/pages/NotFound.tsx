import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PageTransition } from '@/components/PageTransition';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageTransition>
      <div className='min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 relative'>
        <div className='absolute top-4 right-4'>
          <ThemeToggle />
        </div>

        <div className='text-center max-w-md'>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.5,
              type: 'spring',
              stiffness: 100,
            }}
            className='mb-6'
          >
            <div className='flex justify-center mb-4'>
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                <AlertCircle className='h-24 w-24 text-primary' />
              </motion.div>
            </div>
            <motion.h1
              className='text-6xl font-bold mb-2'
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              404
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h2 className='text-2xl font-semibold mb-2'>Page Not Found</h2>
              <p className='text-muted-foreground mb-8'>
                Oops! The page you're looking for doesn't exist or has been
                moved.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button asChild variant='default' className='mr-2'>
              <Link to='/' className='inline-flex items-center'>
                <Home className='mr-2 h-4 w-4' />
                Return Home
              </Link>
            </Button>
            {/* <Button asChild variant='outline' className='mt-4 sm:mt-0'>
              <Link to='/dashboard' className='inline-flex items-center'>
                Go to Dashboard
              </Link>
            </Button> */}
          </motion.div>

          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className='mt-10 text-sm text-muted-foreground'
          >
            <p>
              Lost? You were trying to access:{' '}
              <span className='font-mono bg-muted px-2 py-1 rounded'>
                {location.pathname}
              </span>
            </p>
          </motion.div> */}
        </div>

        {/* Animated background elements */}
        <div className='absolute inset-0 overflow-hidden -z-10'>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className='absolute rounded-full bg-primary/5'
              initial={{
                x: Math.random() * 100 - 50 + '%',
                y: Math.random() * 100 - 50 + '%',
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                x: [
                  Math.random() * 100 - 50 + '%',
                  Math.random() * 100 - 50 + '%',
                ],
                y: [
                  Math.random() * 100 - 50 + '%',
                  Math.random() * 100 - 50 + '%',
                ],
              }}
              transition={{
                duration: Math.random() * 10 + 20,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
              style={{
                width: Math.random() * 300 + 100 + 'px',
                height: Math.random() * 300 + 100 + 'px',
                opacity: 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
