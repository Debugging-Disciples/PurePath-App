
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BarChart3,
  User,
  Users,
  Map,
  Book,
  LogOut,
  Menu,
  X,
  Award,
  Brain,
  Flag,
  Handshake
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '../utils/auth';
import { logout } from '../utils/firebase';
import { useIsMobile } from "@/hooks/use-mobile";
import NotificationsDropdown from './NotificationsDropdown';

const Navbar: React.FC = () => {
  const { currentUser, userRole, isLoading, unreadNotifications } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Close the mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/goodbye');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = currentUser ? [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'Community', path: '/community', icon: <Users size={20} /> },
    { name: 'Friends', path: '/friends', icon: <Handshake size={20} /> },
    { name: 'Map', path: '/map', icon: <Map size={20} /> },
    { name: 'Journal', path: '/journal', icon: <Book size={20} /> },
    { name: 'Meditations', path: '/meditations', icon: <Brain size={20} /> },
    { name: 'Challenges', path: '/challenges', icon: <Flag size={20} /> },
    { name: 'Achievements', path: '/achievements', icon: <Award size={20} /> },
  ] : [];

  // Admin menu items
  const adminItems = userRole === 'admin' ? [
    { name: 'Admin', path: '/admin', icon: <Users size={20} /> },
  ] : [];

  // All menu items
  const allMenuItems = [...menuItems, ...adminItems];

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      x: '-100%',
      transition: {
        duration: 0.3,
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">PurePath</span>
          </Link>

          {isMobile && currentUser && (
            <Button 
              variant="ghost" 
              className="mr-auto" 
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={20} />
            </Button>
          )}

          {/* Desktop navigation */}
          {!isMobile && (
            <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
              {allMenuItems.map((item, index) => (
                <Link
                  key={`desktop-${item.path}-${index}`}
                  to={item.path}
                  className={`text-sm font-medium transition-colors flex items-center ${
                    isActive(item.path)
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <div className="mr-1">{item.icon}</div>
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side items */}
          <div className={`ml-auto flex items-center space-x-2 ${isMobile && !currentUser ? 'mr-auto' : ''}`}>
            {currentUser ? (
              <>
                <NotificationsDropdown />
                
                <Button onClick={handleLogout} variant="ghost" size="icon">
                  <LogOut size={20} />
                </Button>
              </>
            ) : (
              <>
                {!isLoading && (
                  <>
                    <Link to="/login">
                      <Button variant="ghost">Login</Button>
                    </Link>
                    <Link to="/register">
                      <Button>Sign Up</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile navigation menu */}
      <AnimatePresence>
        {isMenuOpen && isMobile && (
          <motion.div
            className="fixed inset-0 z-40 bg-background"
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
          >
            <div className="flex flex-col h-full">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <Link to="/" className="font-bold text-xl">
                  PurePath
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X size={20} />
                </Button>
              </div>
              <nav className="flex-1 overflow-auto py-4">
                {allMenuItems.map((item, index) => (
                  <Link
                    key={`mobile-${item.path}-${index}`}
                    to={item.path}
                    className={`flex items-center px-4 py-3 ${
                      isActive(item.path)
                        ? 'bg-accent text-primary'
                        : 'text-muted-foreground hover:bg-accent/50'
                    }`}
                  >
                    <div className="mr-3">{item.icon}</div>
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="px-4 py-3 border-t">
                <Button 
                  onClick={handleLogout} 
                  variant="destructive" 
                  className="w-full"
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
