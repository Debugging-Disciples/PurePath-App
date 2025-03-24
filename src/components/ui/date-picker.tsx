import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface DatePickerProps extends React.HTMLAttributes<HTMLDivElement> { 
  preselectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({ className, preselectedDate, onDateChange, ...props }, ref) => {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [selectedDate, setSelectedDate] = React.useState<Date>(preselectedDate || new Date());

    const daysInMonth = (month: number, year: number) => {
      return new Date(year, month + 1, 0).getDate();
    };

    const startDayOfMonth = (month: number, year: number) => {
      return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    };

    const handleNextMonth = () => {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    };

    const handleDateClick = (day: number) => {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate(newDate);
      if (onDateChange) {
        onDateChange(newDate);
      }
    };

    const renderDays = () => {
      const days = [];
      const daysInCurrentMonth = daysInMonth(
        currentDate.getMonth(),
        currentDate.getFullYear()
      );
      const startDay = startDayOfMonth(
        currentDate.getMonth(),
        currentDate.getFullYear()
      );

      for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} />);
      }

      for (let day = 1; day <= daysInCurrentMonth; day++) {
        days.push(
          <div
            key={day}
            className={cn(
              "grid-item place-self-center cursor-pointer rounded-lg w-[30px] h-[30px] flex items-center justify-center hover:bg-primary/30 transition-colors",
              {
                "border-0 text-primary-foreground bg-primary/80 hover:bg-primary/80":
                  selectedDate?.getDate() === day &&
                  selectedDate?.getMonth() === currentDate.getMonth() &&
                  selectedDate?.getFullYear() === currentDate.getFullYear(),
              }
            )}
            onClick={() => handleDateClick(day)}
          >
            {day}
          </div>
        );
      }

      return days;
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center max-h-[300px] w-full sm:w-lg p-1 border-2 rounded-md text-xs",
          className
        )}
        {...props}
      >
        <div className="flex flex-row items-center gap-2 mb-2">
          <ChevronLeft
            onClick={handlePrevMonth}
            className="cursor-pointer rounded-md border-2 hover:bg-primary/30 hover:border-0 transition-colors"
          />
          <span className="flex text-lg font-bold text-center">
            {currentDate.toLocaleString("default", { month: "long" })}{" "}
            {currentDate.getFullYear()}
          </span>
          <ChevronRight
            onClick={handleNextMonth}
            className="cursor-pointer rounded-md border-2 hover:bg-primary/30 hover:border-0 transition-colors"
          />
        </div>
        <div className="h-full w-full grid grid-cols-7 gap-1 p-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((date, index) => (
            <div key={`${date}-${index}`} className="grid-item place-self-center">
              {date}
            </div>
          ))}
          {renderDays()}
        </div>
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
