
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { getRelapseCalendarData } from '../utils/firebase';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import { addMonths, format, startOfMonth, isSameDay, isSameMonth } from 'date-fns';
import { motion } from 'framer-motion';

interface RelapseCalendarProps {
  userId?: string;
}

interface DayInfo {
  date: Date;
  hadRelapse: boolean;
  relapseInfo: {
    triggers: string;
    notes: string;
  } | null;
}

const RelapseCalendar: React.FC<RelapseCalendarProps> = ({ userId }) => {
  const [calendarData, setCalendarData] = useState<DayInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getRelapseCalendarData(userId);
        setCalendarData(data);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Navigate to previous month
  const goToPrevMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, -1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  // Custom day rendering with dots for relapse status
  const renderDay = (day: Date) => {
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
            <p className="font-bold">{format(day, 'MMMM d, yyyy')}</p>
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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-lg">Recovery Calendar</h3>
          <div className="flex gap-2">
            <button 
              onClick={goToPrevMonth}
              className="p-1 rounded hover:bg-secondary"
            >
              ← Prev
            </button>
            <div className="font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            <button 
              onClick={goToNextMonth}
              className="p-1 rounded hover:bg-secondary"
            >
              Next →
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <Card className="p-2">
            <Calendar
              mode="default"
              month={currentMonth}
              selected={[]}
              className="bg-card"
              components={{ DayContent: renderDay }}
              modifiers={modifiers}
              modifiersClassNames={{
                relapse: "relapse-day",
                clean: "clean-day"
              }}
              styles={{
                day_selected: {
                  backgroundColor: "transparent",
                  color: "var(--foreground)"
                },
                day_today: {
                  fontWeight: "bold",
                  border: "1px solid var(--primary)"
                }
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
