
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setIsEmailSent(true);
      toast.success('Password reset email sent');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      
      // Handle specific error codes
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email address');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address');
      } else {
        toast.error('Failed to send reset email: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
              <CardDescription className="text-center">
                {!isEmailSent ? 
                  "Enter your email to receive a password reset link" : 
                  "Check your email for a reset link"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isEmailSent ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="p-2 bg-green-50 text-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                    <Mail className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to <span className="font-medium">{email}</span>. 
                    Please check your inbox and spam folder.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => setIsEmailSent(false)}
                  >
                    Try a different email
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="text-center text-sm text-muted-foreground mt-2">
                <Link to="/login" className="text-primary hover:underline inline-flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
