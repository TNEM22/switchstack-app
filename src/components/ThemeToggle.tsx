import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={toggleTheme}
      className='rounded-full'
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        key={theme}
      >
        {theme === 'dark' ? (
          <Moon className='h-5 w-5' />
        ) : (
          <Sun className='h-5 w-5' />
        )}
      </motion.div>
      <span className='sr-only'>Toggle theme</span>
    </Button>
  );
}
