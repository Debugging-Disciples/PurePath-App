
import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Gift, Share2, Users, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { CustomBadge } from '@/components/ui/custom-badge';

interface Referral {
  code: string;
  count: number;
  rewards: number;
  claimed: boolean;
}

const ReferralProgram: React.FC<{ className?: string }> = ({ className }) => {
  const [referral, setReferral] = useState<Referral | null>(null);
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { currentUser, userProfile } = useAuth();

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!currentUser) return;
      
      try {
        const referralRef = doc(db, 'users', currentUser.uid, 'userData', 'referrals');
        const referralSnap = await getDoc(referralRef);
        
        if (referralSnap.exists()) {
          setReferral(referralSnap.data() as Referral);
        } else {
          // Create a new referral code
          const newCode = generateReferralCode(userProfile?.username || '', currentUser.uid);
          const newReferral: Referral = {
            code: newCode,
            count: 0,
            rewards: 0,
            claimed: false
          };
          
          await setDoc(referralRef, newReferral);
          setReferral(newReferral);
        }
      } catch (error) {
        console.error('Error fetching referral data:', error);
      }
    };
    
    fetchReferralData();
  }, [currentUser, userProfile]);
  
  const generateReferralCode = (username: string, uid: string) => {
    // Generate a referral code based on username and a portion of the user ID
    const nameBase = username.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase();
    const uidPart = uid.substring(0, 4);
    return `${nameBase}-${uidPart}`;
  };
  
  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${referral?.code}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    
    toast.success("Referral link copied!", {
      description: "Share it with your friends to earn rewards",
    });
    
    setTimeout(() => setCopied(false), 3000);
  };
  
  const submitReferralCode = async () => {
    if (!currentUser || !referralCode.trim()) return;
    
    try {
      setSubmitting(true);
      
      // Check if code is valid and not user's own code
      if (referral?.code === referralCode.trim()) {
        toast.error("You cannot refer yourself", {
          description: "Please enter someone else's referral code",
        });
        setSubmitting(false);
        return;
      }
      
      // Check if user has already entered a referral code
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists() && userSnap.data().referredBy) {
        toast.error("You have already used a referral code", {
          description: "You can only use one referral code per account",
        });
        setSubmitting(false);
        return;
      }
      
      // Find the user with this referral code
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where("referralCode", "==", referralCode.trim())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast.error("Invalid referral code", {
          description: "Please check the code and try again",
        });
        setSubmitting(false);
        return;
      }
      
      const referrerDoc = querySnapshot.docs[0];
      const referrerId = referrerDoc.id;
      
      // Update referrer's referral count and rewards
      const referrerReferralRef = doc(db, 'users', referrerId, 'userData', 'referrals');
      await updateDoc(referrerReferralRef, {
        count: increment(1),
        rewards: increment(1)
      });
      
      // Update current user's data
      await updateDoc(userRef, {
        referredBy: referrerId,
        xp: increment(50) // Give bonus XP for using a referral code
      });
      
      toast.success("Referral code applied successfully!", {
        description: "You've earned 50 XP bonus",
      });
      
      setReferralCode('');
      setSubmitting(false);
    } catch (error) {
      console.error('Error submitting referral code:', error);
      toast.error("Failed to submit referral code", {
        description: "Please try again later",
      });
      setSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Gift className="h-5 w-5 mr-2 text-primary" />
          Invite Friends
        </CardTitle>
        <CardDescription>
          Earn rewards when friends join using your referral code
        </CardDescription>
      </CardHeader>
      <CardContent>
        {referral && (
          <>
            <div className="bg-secondary/20 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-sm">Your Referral Code:</h3>
                  <p className="text-xl font-bold tracking-wider mt-1">{referral.code}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-9 gap-1"
                  onClick={copyReferralLink}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy Link
                    </>
                  )}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{referral.count}</div>
                  <div className="text-xs text-muted-foreground">Friends Invited</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{referral.rewards}</div>
                  <div className="text-xs text-muted-foreground">Rewards Earned</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              <h3 className="font-medium text-sm mb-2">Rewards:</h3>
              <div className="flex items-center bg-secondary/10 p-3 rounded-md">
                <Users className="h-4 w-4 mr-3 text-primary" />
                <div>
                  <p className="text-sm font-medium">1 Friend Joins</p>
                  <p className="text-xs text-muted-foreground">Earn 100 XP</p>
                </div>
              </div>
              <div className="flex items-center bg-secondary/10 p-3 rounded-md">
                <Trophy className="h-4 w-4 mr-3 text-primary" />
                <div>
                  <p className="text-sm font-medium">5 Friends Join</p>
                  <p className="text-xs text-muted-foreground">Special Achievement Badge</p>
                </div>
              </div>
              <div className="flex items-center bg-secondary/10 p-3 rounded-md">
                <Gift className="h-4 w-4 mr-3 text-primary" />
                <div>
                  <p className="text-sm font-medium">10 Friends Join</p>
                  <p className="text-xs text-muted-foreground">Unlock Premium Meditations</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium text-sm mb-2">Have a referral code?</h3>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter code" 
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                />
                <Button 
                  onClick={submitReferralCode} 
                  disabled={!referralCode.trim() || submitting}
                >
                  Apply
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="justify-center pt-2">
        <Button variant="outline" className="w-full" onClick={copyReferralLink}>
          <Share2 className="mr-2 h-4 w-4" />
          Share Your Code
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReferralProgram;
