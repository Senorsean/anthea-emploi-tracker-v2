import React from 'react';
import { Calendar } from './ui/calendar';

export const YearCalendar2025 = () => (
  <Calendar
    month={new Date(2025, 0, 1)}
    numberOfMonths={12}
    classNames={{
      months: 'grid grid-cols-3 gap-4',
    }}
  />
);

export default YearCalendar2025;
