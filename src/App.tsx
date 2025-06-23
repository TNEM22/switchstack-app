// TODO: Implement ReactQuery for data fetching
// TODO: Upgrade React Router to v7
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster as Sonner } from '@/components/ui/sonner';

import { AuthProvider } from '@/context/AuthContext';
import { RoomProvider } from '@/context/RoomContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NetworkProvider } from '@/context/NetworkContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import RoomDetail from './pages/RoomDetail';
import ProtectedRoutes from './utils/ProtectedRoutes';

const App = () => (
  <NetworkProvider>
    <ThemeProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <RoomProvider>
            <WebSocketProvider>
              <TooltipProvider>
                <AnimatePresence mode='wait'>
                  <Routes>
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/' element={<ProtectedRoutes />}>
                      <Route path='' element={<Dashboard />} />
                      <Route path='rooms/:roomId' element={<RoomDetail />} />
                      <Route path='settings' element={<Settings />} />
                    </Route>
                    <Route path='*' element={<NotFound />} />
                  </Routes>
                </AnimatePresence>
                <Toaster />
                <Sonner />
              </TooltipProvider>
            </WebSocketProvider>
          </RoomProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </NetworkProvider>
);

export default App;
