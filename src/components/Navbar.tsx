import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "../hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";

const Navbar = () => {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully.');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="w-full py-4 px-6 flex items-center justify-between bg-background border-b">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-xl font-bold">
          Sober App
        </Link>
        <Link to="/community">Community</Link>
        <Link to="/progress">Progress</Link>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user ? (
          <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
        ) : (
          <>
            <Link to="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link to="/register">
              <Button>Register</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
