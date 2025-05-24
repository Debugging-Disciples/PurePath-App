
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import ProgressChart from "@/components/ProgressChart";
import { logRelapse, getUserProfile, getRelapseData, calculateLongestStreak } from "../utils/firebase";
import { useAuth } from "../utils/auth";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Trophy,
  CalendarDays,
  TrendingUp,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { db } from "../utils/firebase";
import { collection, doc, getDoc } from "firebase/firestore";
import RelapseCalendar from "@/components/RelapseCalendar";

const Analytics: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triggers, setTriggers] = useState<{ name: string; count: number }[]>(
    []
  );
  const [streakData, setStreakData] = useState<any[]>([]);
  const [moodData, setMoodData] = useState<any[]>([]);
  const [longestStreak, setLongestStreak] = useState(0);
  const [chartTimeframe, setChartTimeframe] = useState("all"); // Changed from "weekly" to "all"
  const [relapseStats, setRelapseStats] = useState({
    cleanDays: 0,
    relapseDays: 0,
    netGrowth: 0,
  });

  const useTriggers = (uid: string | undefined) => {
    useEffect(() => {
      if (!uid) return;

      const fetchTriggers = async () => {
        try {
          const userDocRef = doc(collection(db, "users"), uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const relapses = userDoc.data().relapses || [];
            const triggerCounts: Record<string, number> = {};

            relapses.forEach((relapse: { triggers: string }) => {
              const trigger = relapse.triggers;
              if (trigger) {
                triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
              }
            });

            const formattedTriggers = Object.entries(triggerCounts).map(
              ([name, count]) => ({
                name,
                count,
              })
            );

            setTriggers(formattedTriggers);
          }
        } catch (error) {
          console.error("Error fetching triggers:", error);
        }
      };

      fetchTriggers();
    }, [uid]);

    return triggers;
  };

  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchData = async () => {
      try {
        const data = await getRelapseData(currentUser.uid, chartTimeframe);
        setStreakData(data.streakData);
        setMoodData(data.moodData);
        setLongestStreak(data.longestStreak);
        setRelapseStats({
          cleanDays: data.cleanDays,
          relapseDays: data.relapseDays,
          netGrowth: data.netGrowth || data.cleanDays - data.relapseDays,
        });
      } catch (error) {
        console.error("Error fetching relapse data:", error);
      }
    };

    fetchData();
  }, [currentUser, chartTimeframe]);

  const handleRelapseSubmit = async () => {
    if (!currentUser) return;

    setIsSubmitting(true);

    try {
      const result = await logRelapse(currentUser.uid, selectedTrigger, notes);
      if (result.success) {
        toast.success("Relapse reported", {
          description:
            "Remember that every moment is a new opportunity to begin again.",
        });

        setNotes("");
        setSelectedTrigger("");

        navigate("/journal");
      } else {
        toast.error("Failed to log relapse", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Error logging relapse:", error);
      toast.error("An error occurred", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStreak = userProfile?.streakDays || 0;
  const lastCheckIn = userProfile?.lastCheckIn
    ? userProfile.lastCheckIn.toDate()
    : new Date();

  const Triggers = useTriggers(currentUser?.uid);
  const hasNoTriggerData = Triggers.length === 0;

  function capitalize(val: string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  return (
    <motion.div
      className="container max-w-6xl py-8 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
        <p className="text-muted-foreground">
          Track your journey and identify patterns
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Trophy className="h-5 w-5 mr-2 text-primary" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-1 text-primary">
                  {currentStreak}
                </div>
                <div className="text-muted-foreground">days</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Longest Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-1 text-primary">
                  {longestStreak}
                </div>
                <div className="text-muted-foreground">days</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                Last Check-in
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6">
              <div className="text-center">
                <div className="text-xl font-medium mb-1">
                  {lastCheckIn.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="text-muted-foreground">
                  {lastCheckIn.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="progress">
        <TabsList className="mb-6">
          <TabsTrigger value="progress">Progress Charts</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="relapse">Report Relapse</TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="flex justify-end mb-4">
              <Select value={chartTimeframe} onValueChange={setChartTimeframe}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly (7 days)</SelectItem>
                  <SelectItem value="monthly">Monthly (30 days)</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ProgressChart data={streakData} type="streak" />
            <ProgressChart data={moodData} type="mood" />
          </motion.div>
        </TabsContent>

        <TabsContent value="insights">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recovery Journey</CardTitle>
                <CardDescription>
                  Visualize your progress and patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <RelapseCalendar userId={currentUser?.uid} />

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                      <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                        Clean Days
                      </h4>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {relapseStats.cleanDays}
                      </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                      <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                        Relapse Days
                      </h4>
                      <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                        {relapseStats.relapseDays}
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                      <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                        Net Growth
                      </h4>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {relapseStats.netGrowth}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Common Triggers</CardTitle>
                <CardDescription>
                  Understanding your patterns helps prevent relapses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {hasNoTriggerData ? (
                    <div className="flex flex-col items-center justify-center py-8 bg-[#F2FCE2] rounded-lg">
                      <Check className="h-16 w-16 text-green-500 mb-2" />
                      <p className="text-center text-muted-foreground">
                        No trigger data yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 mt-6">
                      <h3 className="font-medium text-lg">Common Triggers</h3>
                      {Triggers.map((trigger, index) => (
                        <div key={trigger.name} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {capitalize(trigger.name)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {trigger.count} times
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary rounded-full"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${
                                  (trigger.count /
                                    Math.max(...Triggers.map((t) => t.count))) *
                                  100
                                }%`,
                              }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4 bg-secondary rounded-lg">
                    <h4 className="font-medium mb-2">
                      Personalized Recommendations
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                          1
                        </span>
                        <span>
                          Try the "Stress Management" meditation series to help
                          cope with your main trigger
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                          2
                        </span>
                        <span>
                          Consider developing a structured evening routine to
                          reduce boredom triggers
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                          3
                        </span>
                        <span>
                          Your mood is consistently higher when you maintain at
                          least 3 days of streak
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="relapse">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                  Report a Relapse
                </CardTitle>
                <CardDescription>
                  Honesty is critical for true progress. Reporting relapses
                  helps identify patterns.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="trigger">What triggered this relapse?</Label>
                  <Select
                    value={selectedTrigger}
                    onValueChange={setSelectedTrigger}
                  >
                    <SelectTrigger id="trigger">
                      <SelectValue placeholder="Select a trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stress">Stress</SelectItem>
                      <SelectItem value="boredom">Boredom</SelectItem>
                      <SelectItem value="loneliness">Loneliness</SelectItem>
                      <SelectItem value="fatigue">Fatigue</SelectItem>
                      <SelectItem value="social-media">Social Media</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="What happened? What could you do differently next time?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleRelapseSubmit}
                  disabled={isSubmitting || !selectedTrigger}
                >
                  {isSubmitting ? "Submitting..." : "Report Relapse"}
                </Button>

                <p className="text-sm text-muted-foreground">
                  Remember: this is a journey, not a competition. Every setback
                  is an opportunity to learn.
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Analytics;
