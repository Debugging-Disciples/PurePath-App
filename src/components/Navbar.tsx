
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import { logout } from '../utils/firebase';
import { cn } from '@/lib/utils';
import { 
  Activity, 
  LogOut, 
  Menu, 
  MessageCircle, 
  Moon, 
  Settings, 
  Sun, 
  User, 
  X,
  Map,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { currentUser, userProfile, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 10);
    };

    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    await logout();
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <Activity className="h-4 w-4 mr-2" /> },
    { path: '/community', label: 'Community', icon: <MessageCircle className="h-4 w-4 mr-2" /> },
    { path: '/map', label: 'Map', icon: <Map className="h-4 w-4 mr-2" /> },
    { path: '/meditations', label: 'Meditations', icon: <Heart className="h-4 w-4 mr-2" /> },
    { path: '/analytics', label: 'Analytics', icon: <Activity className="h-4 w-4 mr-2" /> },
  ];

  if (isAdmin) {
    navLinks.push({ path: '/admin', label: 'Admin', icon: <Settings className="h-4 w-4 mr-2" /> });
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-apple px-6 py-4',
          isScrolled ? 'bg-white/80 dark:bg-black/50 backdrop-blur-lg shadow-sm' : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight text-primary transition-opacity duration-200">
              Pure<span className="text-foreground">Path</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {currentUser ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'px-3 py-2 text-sm rounded-md transition-all ease-apple',
                      location.pathname === link.path
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    )}
                  >
                    <span className="flex items-center">
                      {link.icon}
                      {link.label}
                    </span>
                  </Link>
                ))}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                    <DropdownMenuLabel>
                      {userProfile?.username || 'User'}
                      <p className="text-xs text-muted-foreground mt-1">
                        {userProfile?.role || 'member'}
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer w-full">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-all ease-apple"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="ml-2 px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-all ease-apple"
                >
                  Get Started
                </Link>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="ml-2"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-4 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          'fixed inset-0 z-40 transform transition-all duration-300 ease-apple md:hidden',
          isMobileMenuOpen 
            ? 'translate-x-0 opacity-100' 
            : 'translate-x-full opacity-0 pointer-events-none'
        )}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        
        <nav className="absolute right-0 top-0 bottom-0 w-64 bg-background border-l border-border shadow-xl flex flex-col h-full">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <span className="font-medium">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            {currentUser ? (
              <div className="px-6 py-4 border-b border-border">
                <p className="font-medium">{userProfile?.username || 'User'}</p>
                <p className="text-sm text-muted-foreground">{userProfile?.role || 'member'}</p>
              </div>
            ) : null}
            
            <div className="px-3 py-4">
              {currentUser ? (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={cn(
                        'flex items-center px-3 py-3 mb-1 rounded-md transition-all ease-apple',
                        location.pathname === link.path
                          ? 'bg-secondary text-foreground font-medium'
                          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                      )}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  ))}
                  
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-3 mb-1 text-muted-foreground hover:bg-secondary/50 hover:text-foreground rounded-md transition-all ease-apple"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="flex items-center px-3 py-3 mb-1 text-muted-foreground hover:bg-secondary/50 hover:text-foreground rounded-md transition-all ease-apple"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-3 mb-1 text-destructive hover:bg-destructive/10 rounded-md transition-all ease-apple"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    className="w-full px-3 py-2 text-center text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-all ease-apple"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="w-full px-3 py-2 text-center bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-all ease-apple"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
      
      {/* Spacer to prevent content from hiding under the navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;
