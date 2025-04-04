
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { getRelapseCalendarData, getRelapseData } from '../utils/firebase';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import { isSameDay, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { DayContentProps } from 'react-day-picker';

interface RelapseCalendarProps {
  userId?: string;
  showStats?: boolean;
}

interface DayInfo {
  date: Date;
  hadRelapse: boolean;
  relapseInfo: {
    triggers: string;
    notes: string;
  } | null;
}

const RelapseCalendar: React.FC<RelapseCalendarProps> = ({ userId, showStats = false }) => {
  const [calendarData, setCalendarData] = useState<DayInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [month, setMonth] = useState<Date>(new Date());
  const [stats, setStats] = useState({ cleanDays: 0, relapseDays: 0, netGrowth: 0 });

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Get calendar visualization data
        const data = await getRelapseCalendarData(userId);
        setCalendarData(data);
        
        // Get analytics data for accurate stats
        const relapseData = await getRelapseData(userId, 'all');
        setStats({
          cleanDays: relapseData.cleanDays,
          relapseDays: relapseData.relapseDays,
          netGrowth: relapseData.netGrowth
        });
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Custom day rendering with dots for relapse status
  const renderDay = (props: DayContentProps) => {
    const day = props.date;
    
    // Find data for this day
    const dayData = calendarData.find(d => isSameDay(d.date, day));
    
    if (!dayData) return null;
    
    const dotColor = dayData.hadRelapse ? 'bg-red-500' : 'bg-green-500';
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-7 h-7 flex items-center justify-center">
              {day.getDate()}
            </div>
            <div className={`absolute bottom-0 w-2 h-2 rounded-full ${dotColor}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="p-2">
            <p className="font-bold">{new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(day)}</p>
            {dayData.hadRelapse ? (
              <div>
                <p className="text-red-500">Relapse reported</p>
                <p className="text-sm">Trigger: {dayData.relapseInfo?.triggers}</p>
                {dayData.relapseInfo?.notes && (
                  <p className="text-sm italic">{dayData.relapseInfo.notes}</p>
                )}
              </div>
            ) : (
              <p className="text-green-500">Clean day</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  // Find consecutive days to connect dots
  const modifiers = {
    relapse: calendarData
      .filter(day => day.hadRelapse)
      .map(day => new Date(day.date)),
    clean: calendarData
      .filter(day => !day.hadRelapse)
      .map(day => new Date(day.date))
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 w-full">
        <h3 className="font-medium text-lg">Recovery Calendar</h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <Card className="p-4 w-full">
            <Calendar 
              mode="default"
              month={month}
              onMonthChange={setMonth}
              selected={[]}
              className="w-full mx-auto"
              styles={{
                months: { width: '100%' },
                month: { width: '100%' },
                table: { width: '100%' },
                row: { width: '100%', display: 'flex', justifyContent: 'space-between' },
                cell: { width: 'calc(100% / 7)', margin: '0', padding: '2px' },
                head_row: { width: '100%', display: 'flex', justifyContent: 'space-between' },
                head_cell: { width: 'calc(100% / 7)', textAlign: 'center' }
              }}
              components={{ DayContent: renderDay }}
              modifiers={modifiers}
              modifiersClassNames={{
                relapse: "relapse-day",
                clean: "clean-day"
              }}
            />

            <div className="flex justify-center gap-8 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Clean Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Relapse Day</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default RelapseCalendar;
