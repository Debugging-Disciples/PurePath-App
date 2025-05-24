import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import { ArrowRight, HeartPulse, Shield, Zap, Users, Map, Lock, AlertTriangle, Clock, CheckSquare, BookOpen, Bell, Calendar, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

const Index: React.FC = () => {
  const { currentUser, firebaseInitialized } = useAuth();
  
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  
  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };
  
  
  const features = [
    {
      title: 'Community Support',
      description: 'Connect with others on the same journey. Share experiences and find strength in unity.',
      icon: <Users className="h-10 w-10 text-primary" />
    },
    {
      title: 'Guided Meditations',
      description: 'Access specialized meditations designed to build resilience and clarity.',
      icon: <HeartPulse className="h-10 w-10 text-primary" />
    },
    {
      title: 'Emergency Panic Button',
      description: 'Immediate support when urges are strong. Get proven techniques to overcome the moment.',
      icon: <Shield className="h-10 w-10 text-primary" />
    },
    {
      title: 'Progress Analytics',
      description: 'Track your journey visually. See your growth and identify patterns to stay on course.',
      icon: <Zap className="h-10 w-10 text-primary" />
    },
    {
      title: 'Global Community Map',
      description: 'See how many others are on this journey worldwide. You\'re never alone.',
      icon: <Map className="h-10 w-10 text-primary" />
    },
    {
      title: 'Complete Privacy',
      description: 'Your journey is personal. All data is private and anonymized.',
      icon: <Lock className="h-10 w-10 text-primary" />
    }
  ];

  const keyFeatures = [
    {
      title: "Streak Tracker",
      description: "Track your daily progress with a continuous streak counter",
      icon: <Trophy className="h-6 w-6 text-amber-500" />
    },
    {
      title: "Daily Check-ins",
      description: "Mark each successful day to maintain accountability",
      icon: <CheckSquare className="h-6 w-6 text-green-500" />
    },
    {
      title: "Journal System",
      description: "Record thoughts and progress with guided reflection prompts",
      icon: <BookOpen className="h-6 w-6 text-blue-500" />
    },
    {
      title: "Meditation Library",
      description: "Access specialized techniques like urge surfing to overcome challenges",
      icon: <HeartPulse className="h-6 w-6 text-purple-500" />
    },
    {
      title: "Accountability Partners",
      description: "Connect with trusted friends for support and encouragement",
      icon: <Users className="h-6 w-6 text-orange-500" />
    },
    {
      title: "Emergency Support",
      description: "One-click access to tools during moments of weakness",
      icon: <Shield className="h-6 w-6 text-red-500" />
    }
  ];
  
  return (
    <div className="min-h-screen">
      {!firebaseInitialized && (
        <div className="px-6 py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Firebase Initialization Error</AlertTitle>
            <AlertDescription>
              Firebase could not be initialized. Please check your configuration and console for errors.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <section className="relative py-20 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-transparent -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/10%),transparent_60%)] -z-10" />
        
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn}>
              <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                Begin Your Journey to <span className="text-primary">Freedom</span>
              </h1>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                PurePath provides the tools, community, and guidance 
                you need to break free from unwanted habits and build a life of purpose.
              </p>
            </motion.div>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row justify-center gap-4">
              {currentUser ? (
                <Button size="lg" asChild className="px-6">
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="px-6">
                    <Link to="/register">
                      Start Your Journey
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/login">
                      I Already Have an Account
                    </Link>
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* New Key Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Core Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to start your journey to freedom, all in one place
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {keyFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="bg-secondary/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="font-medium text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
       
      
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Real Stories, Real Progress
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto"></div>
          </motion.div>
          
          <div className="relative">
            <div className="filter blur-md opacity-50">
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  { quote: "Finally found a community that understands my struggle without judgment.", author: "Member since 2022" },
                  { quote: "The analytics helped me identify my triggers. I'm 90 days strong now.", author: "Member since 2023" },
                  { quote: "The panic button has saved me countless times. This app is lifechanging.", author: "Member since 2022" }
                ].map((testimonial, index) => (
                  <motion.div
                    key={index}
                    className="glass-card p-6 rounded-xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <blockquote className="text-lg mb-4">"{testimonial.quote}"</blockquote>
                    <p className="text-muted-foreground text-sm">{testimonial.author}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
              <Clock className="h-12 w-12 text-primary mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">Real member testimonials will be available shortly</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 px-6 bg-gradient-to-b from-secondary/50 to-background">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 
            className="text-2xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Begin Your Path to Freedom Today
          </motion.h2>
          
          <motion.p 
            className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Join thousands of others who are transforming their lives
            one day at a time with PurePath.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {!currentUser ? (
              <Button size="lg" asChild className="px-8">
                <Link to="/register">
                  Get Started — It's Free
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild className="px-8">
                <Link to="/dashboard">
                  Go to My Dashboard
                </Link>
              </Button>
            )}
          </motion.div>
        </div>
      </section>
      
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="font-bold text-xl text-primary">
                Pure<span className="text-foreground">Path</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Your journey to freedom and purpose
              </p>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PurePath. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
