import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format,
  add,
  sub
} from 'date-fns';

export const getCalendarDays = (date) => {
  const firstDayOfMonth = startOfMonth(date);
  const lastDayOfMonth = endOfMonth(date);

  const startDate = startOfWeek(firstDayOfMonth);
  const endDate = endOfWeek(lastDayOfMonth);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return days;
};

export const nextMonth = (date) => add(date, { months: 1 });
export const prevMonth = (date) => sub(date, { months: 1 });

export const formatDay = (date) => format(date, 'd');
export const formatMonthYear = (date) => format(date, 'MMMM yyyy');