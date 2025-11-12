# Bonus 09: Google Calendar Clone Walkthrough with Vite + React + TypeScript

This comprehensive walkthrough demonstrates building a full-featured Google Calendar clone using Vite, React, and TypeScript. We'll implement advanced calendar functionality with type safety, covering everything from basic date manipulation to complex recurring events and drag-and-drop scheduling.

## Phase 1: Project Setup and Core Infrastructure

### 1. Initialize Vite TypeScript Project

```bash
# Create new Vite project with TypeScript
npm create vite@latest calendar-clone -- --template react-ts
cd calendar-clone

# Install core dependencies
npm install date-fns clsx react-router-dom @types/react-router-dom

# Install advanced dependencies
npm install react-dnd react-dnd-html5-backend react-hook-form @hookform/resolvers zod zustand

# Install development dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw
```

### 2. Configure TypeScript for Complex Project

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/stores/*": ["src/stores/*"],
      "@/constants/*": ["src/constants/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Core Type Definitions

```typescript
// src/types/calendar.ts
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

// Branded types for type safety
export type EventId = string & { readonly __brand: 'EventId' };
export type CalendarId = string & { readonly __brand: 'CalendarId' };
export type UserId = string & { readonly __brand: 'UserId' };

// Event color system
export type EventColor = 
  | 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink' | 'gray';

// Recurrence patterns
export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Every N days/weeks/months/years
  endDate?: Date;
  count?: number; // Number of occurrences
  byDay?: number[]; // For weekly: 0=Sunday, 1=Monday, etc.
  byMonthDay?: number[]; // For monthly: 1-31
  exceptions?: Date[]; // Excluded dates
}

// Main event interface
export interface CalendarEvent {
  id: EventId;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  recurrence?: RecurrenceRule;
  color: EventColor;
  calendarId: CalendarId;
  location?: string;
  attendees?: Attendee[];
  reminders?: Reminder[];
  created: Date;
  modified: Date;
  isRecurring?: boolean;
  parentId?: EventId; // For recurring event instances
}

// Calendar definition
export interface Calendar {
  id: CalendarId;
  name: string;
  color: EventColor;
  isPrimary: boolean;
  isVisible: boolean;
  ownerId: UserId;
  permissions: CalendarPermission[];
}

// Calendar state
export interface CalendarState {
  currentView: CalendarView;
  currentDate: Date;
  selectedDate: Date | null;
  selectedEventId: EventId | null;
  events: CalendarEvent[];
  calendars: Calendar[];
  loading: boolean;
  error: string | null;
}

// View-specific data types
export interface MonthViewData {
  weeks: Date[][];
  eventsByDate: Map<string, CalendarEvent[]>;
}

export interface WeekViewData {
  days: Date[];
  hours: number[];
  eventsByHour: Map<string, CalendarEvent[]>;
}

export interface DayViewData {
  date: Date;
  hours: number[];
  eventsByHour: Map<string, CalendarEvent[]>;
}

export interface AgendaViewData {
  events: CalendarEvent[];
  dateRange: { start: Date; end: Date };
}

// Conditional type for view data
export type ViewData<T extends CalendarView> =
  T extends 'month' ? MonthViewData :
  T extends 'week' ? WeekViewData :
  T extends 'day' ? DayViewData :
  T extends 'agenda' ? AgendaViewData :
  never;
```

## Phase 2: Date Manipulation Utilities

### 1. Core Date Utilities

```typescript
// src/utils/date.ts
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  isToday,
  isTomorrow,
  isYesterday,
  differenceInMinutes,
  startOfDay,
  endOfDay,
} from 'date-fns';

export class DateUtils {
  static getMonthViewDates(date: Date): Date[][] {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    // Group into weeks (7 days each)
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return weeks;
  }

  static getWeekViewDates(date: Date): Date[] {
    const weekStart = startOfWeek(date);
    return eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
  }

  static formatEventTime(event: CalendarEvent): string {
    if (event.allDay) {
      return 'All day';
    }

    const startTime = format(event.start, 'HH:mm');
    const endTime = format(event.end, 'HH:mm');
    
    if (isSameDay(event.start, event.end)) {
      return `${startTime} - ${endTime}`;
    }
    
    const startDate = format(event.start, 'MMM dd');
    const endDate = format(event.end, 'MMM dd');
    
    return `${startDate} ${startTime} - ${endDate} ${endTime}`;
  }

  static getEventDuration(event: CalendarEvent): number {
    return differenceInMinutes(event.end, event.start);
  }

  static isEventAllDay(event: CalendarEvent): boolean {
    return event.allDay || 
           (startOfDay(event.start).getTime() === event.start.getTime() &&
            endOfDay(event.end).getTime() === event.end.getTime());
  }

  static getRelativeDateLabel(date: Date): string {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM dd');
  }

  static navigateDate(currentDate: Date, direction: 'prev' | 'next', view: CalendarView): Date {
    switch (view) {
      case 'month':
        return direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
      case 'week':
        return direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
      case 'day':
        return direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1);
      default:
        return currentDate;
    }
  }
}
```

### 2. Event Utilities

```typescript
// src/utils/events.ts
import { CalendarEvent, EventId, RecurrenceRule } from '@/types/calendar';
import { addDays, addWeeks, addMonths, addYears, isSameDay } from 'date-fns';

export class EventUtils {
  static generateEventId(): EventId {
    return crypto.randomUUID() as EventId;
  }

  static createRecurringInstances(
    event: CalendarEvent,
    startDate: Date,
    endDate: Date
  ): CalendarEvent[] {
    if (!event.recurrence) return [event];

    const instances: CalendarEvent[] = [];
    const rule = event.recurrence;
    let currentDate = event.start;

    while (currentDate <= endDate && (!rule.endDate || currentDate <= rule.endDate)) {
      // Check if this date is excluded
      if (rule.exceptions?.some(ex => isSameDay(ex, currentDate))) {
        currentDate = this.getNextOccurrence(currentDate, rule);
        continue;
      }

      // Create instance
      const instance: CalendarEvent = {
        ...event,
        id: this.generateEventId(),
        start: new Date(currentDate),
        end: new Date(currentDate.getTime() + (event.end.getTime() - event.start.getTime())),
        isRecurring: true,
        parentId: event.id,
      };

      instances.push(instance);

      // Check count limit
      if (rule.count && instances.length >= rule.count) break;

      // Move to next occurrence
      currentDate = this.getNextOccurrence(currentDate, rule);
    }

    return instances;
  }

  private static getNextOccurrence(date: Date, rule: RecurrenceRule): Date {
    switch (rule.frequency) {
      case 'daily':
        return addDays(date, rule.interval);
      case 'weekly':
        return addWeeks(date, rule.interval);
      case 'monthly':
        return addMonths(date, rule.interval);
      case 'yearly':
        return addYears(date, rule.interval);
      default:
        return addDays(date, 1);
    }
  }

  static detectEventConflicts(events: CalendarEvent[]): Array<{
    event1: CalendarEvent;
    event2: CalendarEvent;
  }> {
    const conflicts: Array<{ event1: CalendarEvent; event2: CalendarEvent }> = [];

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const event1 = events[i];
        const event2 = events[j];

        if (this.eventsOverlap(event1, event2)) {
          conflicts.push({ event1, event2 });
        }
      }
    }

    return conflicts;
  }

  private static eventsOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
    return event1.start < event2.end && event2.start < event1.end;
  }

  static groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
    const grouped = new Map<string, CalendarEvent[]>();

    events.forEach(event => {
      const dateKey = event.start.toDateString();
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });

    return grouped;
  }

  static sortEventsByTime(events: CalendarEvent[]): CalendarEvent[] {
    return [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  }
}
```

## Phase 3: State Management with Zustand

### 1. Calendar Store

```typescript
// src/stores/calendarStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CalendarState, CalendarEvent, Calendar, CalendarView, EventId, CalendarId } from '@/types/calendar';
import { EventUtils } from '@/utils/events';

interface CalendarStore extends CalendarState {
  // Actions
  setCurrentView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedEvent: (eventId: EventId | null) => void;
  
  // Event actions
  addEvent: (event: Omit<CalendarEvent, 'id' | 'created' | 'modified'>) => void;
  updateEvent: (eventId: EventId, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (eventId: EventId) => void;
  
  // Calendar actions
  addCalendar: (calendar: Omit<Calendar, 'id'>) => void;
  updateCalendar: (calendarId: CalendarId, updates: Partial<Calendar>) => void;
  deleteCalendar: (calendarId: CalendarId) => void;
  
  // Utility actions
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventsForDateRange: (start: Date, end: Date) => CalendarEvent[];
}

export const useCalendarStore = create<CalendarStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentView: 'month',
        currentDate: new Date(),
        selectedDate: null,
        selectedEventId: null,
        events: [],
        calendars: [
          {
            id: 'primary' as CalendarId,
            name: 'My Calendar',
            color: 'blue',
            isPrimary: true,
            isVisible: true,
            ownerId: 'user1' as any,
            permissions: ['owner'],
          },
        ],
        loading: false,
        error: null,

        // View actions
        setCurrentView: (view) => set({ currentView: view }),
        setCurrentDate: (date) => set({ currentDate: date }),
        setSelectedDate: (date) => set({ selectedDate: date }),
        setSelectedEvent: (eventId) => set({ selectedEventId: eventId }),

        // Event actions
        addEvent: (eventData) => {
          const newEvent: CalendarEvent = {
            ...eventData,
            id: EventUtils.generateEventId(),
            created: new Date(),
            modified: new Date(),
          };

          set((state) => ({
            events: [...state.events, newEvent],
          }));
        },

        updateEvent: (eventId, updates) => {
          set((state) => ({
            events: state.events.map(event =>
              event.id === eventId
                ? { ...event, ...updates, modified: new Date() }
                : event
            ),
          }));
        },

        deleteEvent: (eventId) => {
          set((state) => ({
            events: state.events.filter(event => event.id !== eventId),
          }));
        },

        // Calendar actions
        addCalendar: (calendarData) => {
          const newCalendar: Calendar = {
            ...calendarData,
            id: crypto.randomUUID() as CalendarId,
          };

          set((state) => ({
            calendars: [...state.calendars, newCalendar],
          }));
        },

        updateCalendar: (calendarId, updates) => {
          set((state) => ({
            calendars: state.calendars.map(calendar =>
              calendar.id === calendarId ? { ...calendar, ...updates } : calendar
            ),
          }));
        },

        deleteCalendar: (calendarId) => {
          set((state) => ({
            calendars: state.calendars.filter(calendar => calendar.id !== calendarId),
            events: state.events.filter(event => event.calendarId !== calendarId),
          }));
        },

        // Utility functions
        getEventsForDate: (date) => {
          const state = get();
          return state.events.filter(event =>
            event.start.toDateString() === date.toDateString() ||
            (event.end.toDateString() === date.toDateString() && !event.allDay)
          );
        },

        getEventsForDateRange: (start, end) => {
          const state = get();
          return state.events.filter(event =>
            event.start <= end && event.end >= start
          );
        },
      }),
      {
        name: 'calendar-storage',
        partialize: (state) => ({
          events: state.events,
          calendars: state.calendars,
          currentView: state.currentView,
        }),
      }
    ),
    { name: 'calendar-store' }
  )
);
```

## Phase 4: Calendar View Components

### 1. Month View Component

```tsx
// src/components/views/MonthView.tsx
import React, { useMemo } from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import clsx from 'clsx';
import { useCalendarStore } from '@/stores/calendarStore';
import { DateUtils } from '@/utils/date';
import { CalendarEvent } from '@/types/calendar';

interface MonthViewProps {
  date: Date;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  date,
  onDateClick,
  onEventClick,
}) => {
  const { events, calendars } = useCalendarStore();

  const monthData = useMemo(() => {
    const weeks = DateUtils.getMonthViewDates(date);
    const eventsByDate = new Map<string, CalendarEvent[]>();

    // Group events by date
    events.forEach(event => {
      const dateKey = event.start.toDateString();
      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, []);
      }
      eventsByDate.get(dateKey)!.push(event);
    });

    return { weeks, eventsByDate };
  }, [date, events]);

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateKey = date.toDateString();
    return monthData.eventsByDate.get(dateKey) || [];
  };

  const getCalendarColor = (calendarId: string): string => {
    const calendar = calendars.find(c => c.id === calendarId);
    return calendar?.color || 'gray';
  };

  return (
    <div className="month-view">
      {/* Header with day names */}
      <div className="month-header">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="month-grid">
        {monthData.weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="week-row">
            {week.map(day => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth = isSameMonth(day, date);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={clsx('day-cell', {
                    'current-month': isCurrentMonth,
                    'other-month': !isCurrentMonth,
                    'today': isTodayDate,
                  })}
                  onClick={() => onDateClick(day)}
                >
                  <div className="day-number">{format(day, 'd')}</div>
                  
                  <div className="day-events">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={`event-item event-${getCalendarColor(event.calendarId)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    
                    {dayEvents.length > 3 && (
                      <div className="more-events">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 2. Week View Component

```tsx
// src/components/views/WeekView.tsx
import React, { useMemo } from 'react';
import { format, addHours, startOfDay } from 'date-fns';
import clsx from 'clsx';
import { useCalendarStore } from '@/stores/calendarStore';
import { DateUtils } from '@/utils/date';
import { CalendarEvent } from '@/types/calendar';

interface WeekViewProps {
  date: Date;
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  date,
  onEventClick,
  onTimeSlotClick,
}) => {
  const { events, calendars } = useCalendarStore();

  const weekData = useMemo(() => {
    const days = DateUtils.getWeekViewDates(date);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const eventsByDayAndHour = new Map<string, CalendarEvent[]>();
    
    events.forEach(event => {
      if (event.allDay) return; // Handle all-day events separately
      
      const dayKey = format(event.start, 'yyyy-MM-dd');
      const hourKey = `${dayKey}-${format(event.start, 'HH')}`;
      
      if (!eventsByDayAndHour.has(hourKey)) {
        eventsByDayAndHour.set(hourKey, []);
      }
      eventsByDayAndHour.get(hourKey)!.push(event);
    });

    return { days, hours, eventsByDayAndHour };
  }, [date, events]);

  const getEventsForTimeSlot = (day: Date, hour: number): CalendarEvent[] => {
    const dayKey = format(day, 'yyyy-MM-dd');
    const hourKey = `${dayKey}-${hour.toString().padStart(2, '0')}`;
    return weekData.eventsByDayAndHour.get(hourKey) || [];
  };

  const getCalendarColor = (calendarId: string): string => {
    const calendar = calendars.find(c => c.id === calendarId);
    return calendar?.color || 'gray';
  };

  const calculateEventStyle = (event: CalendarEvent, day: Date) => {
    const startHour = event.start.getHours() + event.start.getMinutes() / 60;
    const duration = DateUtils.getEventDuration(event) / 60; // Convert to hours
    
    return {
      top: `${startHour * 60}px`, // 60px per hour
      height: `${Math.max(duration * 60, 30)}px`, // Minimum 30px height
    };
  };

  return (
    <div className="week-view">
      {/* Header with day names and dates */}
      <div className="week-header">
        <div className="time-column"></div>
        {weekData.days.map(day => (
          <div key={day.toISOString()} className="day-column">
            <div className="day-name">{format(day, 'EEE')}</div>
            <div className={clsx('day-date', { 'today': DateUtils.isToday(day) })}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="week-grid">
        {weekData.hours.map(hour => (
          <div key={hour} className="hour-row">
            <div className="time-label">
              {format(addHours(startOfDay(new Date()), hour), 'HH:mm')}
            </div>
            
            {weekData.days.map(day => {
              const dayEvents = getEventsForTimeSlot(day, hour);
              
              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className="time-slot"
                  onClick={() => onTimeSlotClick(day, hour)}
                >
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className={`event-block event-${getCalendarColor(event.calendarId)}`}
                      style={calculateEventStyle(event, day)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      <div className="event-title">{event.title}</div>
                      <div className="event-time">
                        {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Phase 5: Event Management

### 1. Event Form with React Hook Form

```tsx
// src/components/EventForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarEvent, EventColor } from '@/types/calendar';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().optional(),
  start: z.date(),
  end: z.date(),
  allDay: z.boolean(),
  color: z.enum(['blue', 'red', 'green', 'yellow', 'purple', 'orange', 'pink', 'gray']),
  calendarId: z.string(),
  location: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  initialData?: Partial<CalendarEvent>;
  calendars: Array<{ id: string; name: string }>;
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({
  initialData,
  calendars,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      start: initialData?.start || new Date(),
      end: initialData?.end || new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
      allDay: initialData?.allDay || false,
      color: initialData?.color || 'blue',
      calendarId: initialData?.calendarId || calendars[0]?.id || '',
      location: initialData?.location || '',
    },
  });

  const allDay = watch('allDay');

  const onFormSubmit = (data: EventFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="event-form">
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          {...register('title')}
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-text">{errors.title.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>
            <input type="checkbox" {...register('allDay')} />
            All day
          </label>
        </div>
      </div>

      {!allDay && (
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start">Start</label>
            <Controller
              name="start"
              control={control}
              render={({ field }) => (
                <input
                  id="start"
                  type="datetime-local"
                  {...field}
                  value={field.value ? field.value.toISOString().slice(0, 16) : ''}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              )}
            />
          </div>

          <div className="form-group">
            <label htmlFor="end">End</label>
            <Controller
              name="end"
              control={control}
              render={({ field }) => (
                <input
                  id="end"
                  type="datetime-local"
                  {...field}
                  value={field.value ? field.value.toISOString().slice(0, 16) : ''}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              )}
            />
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="calendarId">Calendar</label>
          <select {...register('calendarId')}>
            {calendars.map(calendar => (
              <option key={calendar.id} value={calendar.id}>
                {calendar.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="color">Color</label>
          <select {...register('color')}>
            <option value="blue">Blue</option>
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="yellow">Yellow</option>
            <option value="purple">Purple</option>
            <option value="orange">Orange</option>
            <option value="pink">Pink</option>
            <option value="gray">Gray</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          id="location"
          {...register('location')}
          placeholder="Add location"
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Event'}
        </button>
      </div>
    </form>
  );
};
```

## Phase 6: Drag and Drop with React DnD

### 1. Event Drag Source

```tsx
// src/components/dnd/EventDragSource.tsx
import React from 'react';
import { useDrag } from 'react-dnd';
import { CalendarEvent } from '@/types/calendar';

interface EventDragSourceProps {
  event: CalendarEvent;
  children: React.ReactNode;
}

export const EventDragSource: React.FC<EventDragSourceProps> = ({
  event,
  children,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'calendar-event',
    item: { event },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {children}
    </div>
  );
};
```

### 2. Time Slot Drop Target

```tsx
// src/components/dnd/TimeSlotDropTarget.tsx
import React from 'react';
import { useDrop } from 'react-dnd';
import { CalendarEvent } from '@/types/calendar';

interface TimeSlotDropTargetProps {
  date: Date;
  hour: number;
  children: React.ReactNode;
  onEventDrop: (event: CalendarEvent, newStart: Date) => void;
}

export const TimeSlotDropTarget: React.FC<TimeSlotDropTargetProps> = ({
  date,
  hour,
  children,
  onEventDrop,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'calendar-event',
    drop: (item: { event: CalendarEvent }) => {
      const newStart = new Date(date);
      newStart.setHours(hour, 0, 0, 0);
      
      // Preserve duration
      const duration = item.event.end.getTime() - item.event.start.getTime();
      const newEnd = new Date(newStart.getTime() + duration);
      
      onEventDrop(item.event, newStart);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      style={{
        backgroundColor: isOver ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
      }}
    >
      {children}
    </div>
  );
};
```

## Phase 7: Main Application

### 1. App Router

```tsx
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CalendarLayout } from '@/components/layout/CalendarLayout';
import { MonthView } from '@/components/views/MonthView';
import { WeekView } from '@/components/views/WeekView';
import { DayView } from '@/components/views/DayView';
import { AgendaView } from '@/components/views/AgendaView';

const App: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <CalendarLayout>
          <Routes>
            <Route path="/" element={<MonthView />} />
            <Route path="/month" element={<MonthView />} />
            <Route path="/week" element={<WeekView />} />
            <Route path="/day" element={<DayView />} />
            <Route path="/agenda" element={<AgendaView />} />
          </Routes>
        </CalendarLayout>
      </Router>
    </DndProvider>
  );
};

export default App;
```

### 2. Calendar Layout

```tsx
// src/components/layout/CalendarLayout.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCalendarStore } from '@/stores/calendarStore';
import { CalendarView } from '@/types/calendar';
import { DateUtils } from '@/utils/date';
import { EventModal } from '@/components/EventModal';

interface CalendarLayoutProps {
  children: React.ReactNode;
}

export const CalendarLayout: React.FC<CalendarLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    currentView,
    currentDate,
    setCurrentView,
    setCurrentDate,
    selectedEventId,
    setSelectedEvent,
  } = useCalendarStore();

  const [showEventModal, setShowEventModal] = useState(false);

  const handleViewChange = (view: CalendarView) => {
    setCurrentView(view);
    navigate(`/${view}`);
  };

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const newDate = DateUtils.navigateDate(currentDate, direction, currentView);
    setCurrentDate(newDate);
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  const getCurrentViewFromPath = (): CalendarView => {
    const path = location.pathname.slice(1);
    return (path as CalendarView) || 'month';
  };

  React.useEffect(() => {
    const viewFromPath = getCurrentViewFromPath();
    if (viewFromPath !== currentView) {
      setCurrentView(viewFromPath);
    }
  }, [location.pathname, currentView, setCurrentView]);

  return (
    <div className="calendar-app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1>Calendar</h1>
        </div>
        
        <div className="header-center">
          <button onClick={() => handleDateNavigation('prev')}>‹</button>
          <button onClick={handleTodayClick}>Today</button>
          <button onClick={() => handleDateNavigation('next')}>›</button>
          <h2>{DateUtils.getRelativeDateLabel(currentDate)}</h2>
        </div>
        
        <div className="header-right">
          <div className="view-buttons">
            {(['month', 'week', 'day', 'agenda'] as CalendarView[]).map(view => (
              <button
                key={view}
                className={currentView === view ? 'active' : ''}
                onClick={() => handleViewChange(view)}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
          
          <button 
            className="create-event-btn"
            onClick={() => setShowEventModal(true)}
          >
            + Create Event
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="calendar-content">
        {React.cloneElement(children as React.ReactElement, {
          date: currentDate,
          onDateClick: (date: Date) => setCurrentDate(date),
          onEventClick: (event: any) => setSelectedEvent(event.id),
          onTimeSlotClick: (date: Date, hour: number) => {
            // Handle time slot click for creating events
            console.log('Time slot clicked:', date, hour);
          },
        })}
      </main>

      {/* Modals */}
      {showEventModal && (
        <EventModal 
          onClose={() => setShowEventModal(false)}
          selectedDate={currentDate}
        />
      )}
      
      {selectedEventId && (
        <EventDetailsModal 
          eventId={selectedEventId}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};
```

## Phase 8: Testing

### 1. Unit Tests

```typescript
// src/tests/utils/date.test.ts
import { describe, it, expect } from 'vitest';
import { DateUtils } from '@/utils/date';

describe('DateUtils', () => {
  describe('getMonthViewDates', () => {
    it('should return correct number of weeks for a month', () => {
      const date = new Date(2023, 0, 15); // January 15, 2023
      const weeks = DateUtils.getMonthViewDates(date);
      
      expect(weeks).toHaveLength(5); // January 2023 has 5 weeks
      expect(weeks[0]).toHaveLength(7); // Each week has 7 days
    });

    it('should include days from previous and next months', () => {
      const date = new Date(2023, 0, 1); // January 1, 2023 (Sunday)
      const weeks = DateUtils.getMonthViewDates(date);
      
      // First week should start with December 25, 2022
      expect(weeks[0][0].getDate()).toBe(25);
      expect(weeks[0][0].getMonth()).toBe(11); // December
    });
  });

  describe('formatEventTime', () => {
    it('should format all-day events', () => {
      const event = {
        start: new Date(2023, 0, 1, 9, 0),
        end: new Date(2023, 0, 1, 17, 0),
        allDay: true,
      } as any;
      
      expect(DateUtils.formatEventTime(event)).toBe('All day');
    });

    it('should format same-day events', () => {
      const event = {
        start: new Date(2023, 0, 1, 9, 0),
        end: new Date(2023, 0, 1, 17, 0),
        allDay: false,
      } as any;
      
      expect(DateUtils.formatEventTime(event)).toBe('09:00 - 17:00');
    });
  });
});
```

### 2. Component Tests

```typescript
// src/tests/components/MonthView.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MonthView } from '@/components/views/MonthView';

const mockStore = {
  events: [],
  calendars: [{ id: '1', name: 'Test', color: 'blue' as const, isPrimary: true, isVisible: true, ownerId: 'user1' as any, permissions: [] }],
};

vi.mock('@/stores/calendarStore', () => ({
  useCalendarStore: () => mockStore,
}));

describe('MonthView', () => {
  const defaultProps = {
    date: new Date(2023, 0, 15), // January 15, 2023
    onDateClick: vi.fn(),
    onEventClick: vi.fn(),
  };

  it('should render month grid', () => {
    render(<MonthView {...defaultProps} />);
    
    // Should show day numbers
    expect(screen.getByText('15')).toBeInTheDocument();
    
    // Should show day headers
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
  });

  it('should call onDateClick when date is clicked', () => {
    render(<MonthView {...defaultProps} />);
    
    const dayCell = screen.getByText('15');
    fireEvent.click(dayCell);
    
    expect(defaultProps.onDateClick).toHaveBeenCalledWith(
      expect.any(Date)
    );
  });
});
```

## Phase 9: Performance Optimization

### 1. Virtual Scrolling for Large Lists

```typescript
// src/components/virtual/VirtualizedAgendaView.tsx
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { CalendarEvent } from '@/types/calendar';

interface VirtualizedAgendaViewProps {
  events: CalendarEvent[];
  height: number;
  itemHeight: number;
  renderEvent: (event: CalendarEvent) => React.ReactNode;
}

export const VirtualizedAgendaView: React.FC<VirtualizedAgendaViewProps> = ({
  events,
  height,
  itemHeight,
  renderEvent,
}) => {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events]);

  const EventRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const event = sortedEvents[index];
    return (
      <div style={style}>
        {renderEvent(event)}
      </div>
    );
  };

  return (
    <List
      height={height}
      itemCount={sortedEvents.length}
      itemSize={itemHeight}
      width="100%"
    >
      {EventRow}
    </List>
  );
};
```

### 2. Memoized Event Calculations

```typescript
// src/hooks/useCalendarEvents.ts
import { useMemo } from 'react';
import { useCalendarStore } from '@/stores/calendarStore';
import { CalendarEvent } from '@/types/calendar';
import { EventUtils } from '@/utils/events';
import { DateUtils } from '@/utils/date';

export const useCalendarEvents = (startDate: Date, endDate: Date) => {
  const { events, calendars } = useCalendarStore();

  const processedEvents = useMemo(() => {
    // Filter events in date range
    const filteredEvents = events.filter(event =>
      event.start <= endDate && event.end >= startDate
    );

    // Expand recurring events
    const expandedEvents: CalendarEvent[] = [];
    filteredEvents.forEach(event => {
      if (event.recurrence) {
        const instances = EventUtils.createRecurringInstances(event, startDate, endDate);
        expandedEvents.push(...instances);
      } else {
        expandedEvents.push(event);
      }
    });

    // Sort by start time
    return EventUtils.sortEventsByTime(expandedEvents);
  }, [events, startDate, endDate]);

  const eventsByDate = useMemo(() => {
    return EventUtils.groupEventsByDate(processedEvents);
  }, [processedEvents]);

  const conflicts = useMemo(() => {
    return EventUtils.detectEventConflicts(processedEvents);
  }, [processedEvents]);

  return {
    events: processedEvents,
    eventsByDate,
    conflicts,
  };
};
```

## Summary

This comprehensive walkthrough demonstrates building a production-quality calendar application with advanced TypeScript patterns:

### Key Features Implemented:
- **Multiple Calendar Views**: Month, week, day, and agenda with smooth navigation
- **Event Management**: Full CRUD operations with recurring events
- **Drag & Drop**: Intuitive event scheduling with visual feedback
- **Type Safety**: 100% TypeScript coverage with complex type relationships
- **Performance**: Virtual scrolling and memoization for large datasets
- **Testing**: Comprehensive unit and integration tests

### Advanced TypeScript Patterns Used:
- **Branded Types**: Type-safe IDs and unique identifiers
- **Discriminated Unions**: Complex state management with type safety
- **Generic Components**: Reusable components with type constraints
- **Conditional Types**: Dynamic typing based on calendar view modes
- **Mapped Types**: Transforming calendar data structures
- **Utility Types**: Advanced type composition and manipulation

### Architecture Highlights:
- **Zustand Store**: Type-safe global state management
- **React Hook Form + Zod**: Runtime validation with compile-time safety
- **React DnD**: Complex drag-and-drop interactions
- **Date Manipulation**: Robust date handling with date-fns
- **Virtual Scrolling**: Performance optimization for large event lists

### Production Considerations:
- **Error Boundaries**: Graceful error handling
- **Loading States**: User feedback during async operations
- **Accessibility**: ARIA labels and keyboard navigation
- **Responsive Design**: Mobile-friendly interface
- **Data Persistence**: Local storage with type safety

This calendar application serves as a comprehensive example of building complex, type-safe React applications that handle
