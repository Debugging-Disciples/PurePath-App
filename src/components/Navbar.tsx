
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/auth";
import { logout } from "../utils/firebase";
import { Button } from "@/components/ui/button";
import { Moon, Sun, ShieldCheck } from "lucide-react";
import { db } from "../utils/firebase";
import { collection, where, query, getDocs } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Navbar: React.FC = () => {
  const [userInitials, setUserInitials] = useState("U");
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };
  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  
  useEffect(() => {
    const fetchUserInitials = async () => {
      if (currentUser && currentUser.email) {
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", currentUser.email));
          const querySnapshot = await getDocs(q);
          // console.log(q);
          if (!querySnapshot.empty) {
            // Assuming only one document matches the email.
            const userDoc = querySnapshot.docs[0].data();
            const firstname = userDoc.firstName || "";
            const lastname = userDoc.lastName || "";

            if (firstname || lastname) {
              const initials =
                (firstname.charAt(0).toUpperCase() || "") +
                (lastname.charAt(0).toUpperCase() || "");
              setUserInitials(initials);
            } else {
              setUserInitials("U");
            }
          } else {
            setUserInitials("U"); // No document found for this email.
          }
        } catch (error) {
          console.error("Error fetching user initials:", error);
          setUserInitials("U"); // Fallback in case of an error.
        }
      }
    };

    fetchUserInitials();
  }, [currentUser]);


  return (<div className="bg-background border-b">
    <div className="container flex h-16 items-center justify-between py-4">
      <Link to="/" className="flex items-center space-x-2">
        <span className="font-bold text-xl tracking-tight text-primary transition-opacity duration-200">
          Pure<span className="text-foreground">Path</span>
        </span>
      </Link>
  
      <nav className="flex items-center space-x-4">
        {/* Admin Link - Only visible to admins */}
        {isAdmin && (
          <Link 
            to="/admin" 
            className="flex items-center text-sm text-foreground hover:text-primary transition-colors"
          >
            <ShieldCheck className="h-4 w-4 mr-1" />
            Admin
          </Link>
        )}
        
        {/* Dark Mode Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="ml-auto p-2 border rounded-md shadow-sm hover:bg-secondary transition-all"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-yellow-400" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
  
        {/* Dropdown Menu */}
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 rounded-full ml-4"
              >
                <Avatar>
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
              </Button>
            </DropdownMenuTrigger>
            {/* Dropdown Menu Content */}
            <DropdownMenuContent
              align="end"
              className="mt-2 w-56 animate-scale-in shadow-lg border rounded-md bg-background"
            >
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login" className="mr-4">
              Login
            </Link>
            <Link to="/register">Register</Link>
          </div>
        )}
      </nav>
    </div>
  </div>  
  );
};

export default Navbar;
