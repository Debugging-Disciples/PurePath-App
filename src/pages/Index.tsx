
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import { useIsMobile } from "@/hooks/use-mobile";

const Index: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Check for referral parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const ref = queryParams.get('ref');
    
    if (ref && !currentUser && !isLoading) {
      // Store referral ID in session storage to persist during registration
      sessionStorage.setItem('referralId', ref);
      navigate(`/register?ref=${ref}`);
    } else if (currentUser && !isLoading) {
      navigate('/dashboard');
    }
  }, [currentUser, isLoading, location, navigate]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen">
      <motion.div 
        className={`container mx-auto px-4 py-12 flex flex-col ${isMobile ? 'items-center' : 'items-start'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className={`w-full max-w-4xl mx-auto mb-12 ${isMobile ? 'text-center' : ''}`}
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold tracking-tight"
            variants={item}
          >
            Recovery Together
          </motion.h1>
          <motion.p 
            className="mt-4 text-xl md:text-2xl text-muted-foreground max-w-2xl"
            variants={item}
          >
            Join a supportive community of people on their journey to recovery
          </motion.p>
          <motion.div 
            className="mt-8 flex flex-col sm:flex-row gap-4"
            variants={item}
          >
            <Link to="/register">
              <Button size="lg" className="text-lg px-8">
                Start Your Journey
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div 
            className="bg-card rounded-lg p-6 shadow-md"
            variants={item}
          >
            <h3 className="text-xl font-bold mb-2">Track Progress</h3>
            <p className="text-muted-foreground">Monitor your recovery journey with comprehensive tracking tools and visualizations.</p>
          </motion.div>
          
          <motion.div 
            className="bg-card rounded-lg p-6 shadow-md"
            variants={item}
          >
            <h3 className="text-xl font-bold mb-2">Community Support</h3>
            <p className="text-muted-foreground">Connect with others on similar journeys through our supportive community features.</p>
          </motion.div>
          
          <motion.div 
            className="bg-card rounded-lg p-6 shadow-md"
            variants={item}
          >
            <h3 className="text-xl font-bold mb-2">Accountability Partners</h3>
            <p className="text-muted-foreground">Stay on track with accountability partners who help you maintain your commitment.</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
