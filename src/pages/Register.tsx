
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { register, auth } from '../utils/firebase';
import { useAuth } from '../utils/auth';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CountrySelect } from '@/components/CountrySelect';
import { StateSelect } from '@/components/StateSelect';
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from 'sonner';

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }).max(20, {
    message: "Username must be no more than 20 characters."
  }).regex(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain letters, numbers, and underscores."
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string(),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"], {
    required_error: "Please select a gender.",
  }),
  country: z.string().min(1, {
    message: "Please select a country.",
  }),
  state: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState('');
  const isMobile = useIsMobile();
  
  // Extract referral ID from URL parameters
  const queryParams = new URLSearchParams(location.search);
  const referralId = queryParams.get('ref');
  
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "prefer-not-to-say",
      country: "",
      state: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (loading) return; // Prevent multiple submissions
    
    setLoading(true);
    
    try {
      const location = {
        country: values.country,
        state: values.state || null
      };
      
      const result = await register(
        values.email, 
        values.password, 
        values.username,
        values.firstName, 
        values.lastName, 
        values.gender,
        location,
        referralId || undefined
      );
      
      if (result) {
        toast.success("Registration successful! Redirecting to dashboard...");
        // Short delay to allow toast to be seen before redirect
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        // If register returns false but no error thrown
        toast.error("Registration failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // More specific error messages based on Firebase error codes
      if (error.code === 'auth/email-already-in-use') {
        toast.error("This email is already registered. Please log in instead.");
        form.setError('email', { 
          type: 'manual', 
          message: 'This email is already in use'
        });
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Invalid email format.");
        form.setError('email', { 
          type: 'manual', 
          message: 'Invalid email format'
        });
      } else if (error.code === 'auth/weak-password') {
        toast.error("Password is too weak. Please use a stronger password.");
        form.setError('password', { 
          type: 'manual', 
          message: 'Password is too weak'
        });
      } else {
        toast.error(`Registration failed: ${error.message || "Unknown error occurred"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md">
        <motion.div 
          className="bg-card p-8 rounded-lg shadow-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="text-center mb-6">
            <motion.h1 
              className="text-2xl font-bold"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              Create Your Account
            </motion.h1>
            <motion.p 
              className="text-muted-foreground mt-2"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Join the recovery community today
            </motion.p>
            
            {referralId && (
              <motion.div 
                className="mt-2 text-sm p-2 bg-primary/10 rounded-md"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                You were invited by a friend! You'll be connected automatically.
              </motion.div>
            )}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be used for others to find you
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <CountrySelect 
                        value={field.value} 
                        onChange={(value) => {
                          field.onChange(value);
                          setCountry(value);
                          // Reset state if country changes
                          if (value !== 'United States') {
                            form.setValue('state', '');
                          }
                        }} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {country === 'United States' && (
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <StateSelect value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Register;
