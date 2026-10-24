import { PlantCombo, StoreSettings } from '../types';

export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type WeekdayName = typeof WEEKDAYS[number];

const WEEKDAY_INDEX: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

export interface DispatchAndDeliveryEstimate {
  // Configured weekly dispatch days (e.g. ['Monday', 'Thursday'])
  dispatchDays: string[];
  dispatchDaysShort: string; // e.g. "Mon, Thu"
  dispatchScheduleText: string; // e.g. "Every Monday & Thursday"
  
  // Next upcoming dispatch
  nextDispatchDate: Date;
  nextDispatchWeekday: string; // e.g. "Thursday"
  nextDispatchFormatted: string; // e.g. "Thursday, Oct 29"
  isSameDayDispatch: boolean;
  daysUntilDispatch: number;

  // Transit and arrival
  minTransitDays: number;
  maxTransitDays: number;
  earliestDeliveryDate: Date;
  latestDeliveryDate: Date;
  estimatedDeliveryFormatted: string; // e.g. "Friday, Oct 30 – Saturday, Oct 31"
  estimatedDeliveryShort: string; // e.g. "Fri, Oct 30 – Sat, Oct 31"
  transitDaysText: string; // e.g. "1–2 Days" or "2–3 Days"

  // Ready-to-render strings
  summaryBadgeText: string; // e.g. "Dispatches Mon & Thu • 1–2 Days Delivery"
  timelineDescription: string; // e.g. "Order today for dispatch this Thursday. Estimated delivery to Kerala: Oct 30 – Oct 31."
}

interface CalculateOptions {
  combo?: PlantCombo | null;
  storeSettings?: StoreSettings | null;
  orderDate?: Date;
  deliveryState?: string | null;
}

/**
 * Calculates real-time live plant dispatch and arrival based on weekly dispatch schedule
 */
export function calculateComboDispatchAndDelivery(
  options: CalculateOptions = {}
): DispatchAndDeliveryEstimate {
  const {
    combo,
    storeSettings,
    orderDate = new Date(),
    deliveryState = 'Kerala',
  } = options;

  // 1. Resolve active dispatch days (combo custom override > storewide setting > default Mon & Thu)
  let rawDays =
    combo?.customDispatchDays && combo.customDispatchDays.length > 0
      ? combo.customDispatchDays
      : storeSettings?.comboDispatchDays && storeSettings.comboDispatchDays.length > 0
      ? storeSettings.comboDispatchDays
      : ['Monday', 'Thursday'];

  // Normalize days
  const activeDispatchDayIndices = new Set<number>();
  const normalizedDays: string[] = [];

  rawDays.forEach((dayStr) => {
    const key = dayStr.trim().toLowerCase();
    const idx = WEEKDAY_INDEX[key];
    if (idx !== undefined && !activeDispatchDayIndices.has(idx)) {
      activeDispatchDayIndices.add(idx);
      normalizedDays.push(WEEKDAYS[idx]);
    }
  });

  if (activeDispatchDayIndices.size === 0) {
    activeDispatchDayIndices.add(1); // Monday
    activeDispatchDayIndices.add(4); // Thursday
    normalizedDays.push('Monday', 'Thursday');
  }

  // 2. Daily dispatch cutoff hour (default: 12 PM / 12:00)
  const cutoffHour = storeSettings?.comboDispatchCutoffHour ?? 12;

  const currentDayIndex = orderDate.getDay();
  const currentHour = orderDate.getHours();

  // Check if today is a dispatch day and order placed before cutoff
  const canDispatchToday =
    activeDispatchDayIndices.has(currentDayIndex) && currentHour < cutoffHour;

  let daysUntilDispatch = 0;
  if (canDispatchToday) {
    daysUntilDispatch = 0;
  } else {
    // Find next dispatch day in the upcoming 7 days
    for (let offset = 1; offset <= 7; offset++) {
      const targetDayIndex = (currentDayIndex + offset) % 7;
      if (activeDispatchDayIndices.has(targetDayIndex)) {
        daysUntilDispatch = offset;
        break;
      }
    }
  }

  const nextDispatchDate = new Date(orderDate);
  nextDispatchDate.setDate(orderDate.getDate() + daysUntilDispatch);
  nextDispatchDate.setHours(12, 0, 0, 0);

  const nextDispatchWeekday = WEEKDAYS[nextDispatchDate.getDay()];

  // 3. Courier Transit Time by Destination State
  const stateNorm = (deliveryState || 'Kerala').trim().toLowerCase();
  let minTransitDays = 1;
  let maxTransitDays = 2;

  if (stateNorm.includes('kerala')) {
    minTransitDays = 1;
    maxTransitDays = 2;
  } else if (stateNorm.includes('tamil') || stateNorm.includes('karnataka')) {
    minTransitDays = 2;
    maxTransitDays = 3;
  } else {
    minTransitDays = 3;
    maxTransitDays = 5;
  }

  // Helper to add transit days while avoiding Sunday delivery (couriers non-operational)
  const addTransitDaysExcludingSundays = (startDate: Date, transitDaysCount: number): Date => {
    const result = new Date(startDate);
    result.setDate(result.getDate() + transitDaysCount);
    // If lands on Sunday (0), push to Monday
    if (result.getDay() === 0) {
      result.setDate(result.getDate() + 1);
    }
    return result;
  };

  const earliestDeliveryDate = addTransitDaysExcludingSundays(nextDispatchDate, minTransitDays);
  const latestDeliveryDate = addTransitDaysExcludingSundays(nextDispatchDate, maxTransitDays);

  // 4. Formatting Utilities
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDate = (d: Date, withWeekday: boolean = true) => {
    const w = withWeekday ? `${WEEKDAYS[d.getDay()]}, ` : '';
    return `${w}${shortMonths[d.getMonth()]} ${d.getDate()}`;
  };

  const formatDateShort = (d: Date) => {
    return `${shortDays[d.getDay()]}, ${shortMonths[d.getMonth()]} ${d.getDate()}`;
  };

  const nextDispatchFormatted = formatDate(nextDispatchDate);
  const estimatedDeliveryFormatted =
    earliestDeliveryDate.toDateString() === latestDeliveryDate.toDateString()
      ? formatDate(earliestDeliveryDate)
      : `${formatDate(earliestDeliveryDate)} – ${formatDate(latestDeliveryDate)}`;

  const estimatedDeliveryShort =
    earliestDeliveryDate.toDateString() === latestDeliveryDate.toDateString()
      ? formatDateShort(earliestDeliveryDate)
      : `${formatDateShort(earliestDeliveryDate)} – ${formatDateShort(latestDeliveryDate)}`;

  const dispatchDaysShort = normalizedDays
    .map((d) => d.slice(0, 3))
    .join(', ');

  const dispatchScheduleText =
    normalizedDays.length === 1
      ? `Every ${normalizedDays[0]}`
      : `Every ${normalizedDays.slice(0, -1).join(', ')} & ${normalizedDays[normalizedDays.length - 1]}`;

  const transitDaysText = `${minTransitDays}–${maxTransitDays} Days`;
  const summaryBadgeText = `Dispatches ${dispatchDaysShort} • ${transitDaysText} Delivery`;

  const relativeDispatchNote =
    daysUntilDispatch === 0
      ? 'today'
      : daysUntilDispatch === 1
      ? 'tomorrow'
      : `this ${nextDispatchWeekday}`;

  const timelineDescription = `Order today for dispatch ${relativeDispatchNote} (${formatDate(nextDispatchDate, false)}). Expected delivery to ${deliveryState || 'your address'}: ${estimatedDeliveryShort}.`;

  return {
    dispatchDays: normalizedDays,
    dispatchDaysShort,
    dispatchScheduleText,
    nextDispatchDate,
    nextDispatchWeekday,
    nextDispatchFormatted,
    isSameDayDispatch: daysUntilDispatch === 0,
    daysUntilDispatch,
    minTransitDays,
    maxTransitDays,
    earliestDeliveryDate,
    latestDeliveryDate,
    estimatedDeliveryFormatted,
    estimatedDeliveryShort,
    transitDaysText,
    summaryBadgeText,
    timelineDescription,
  };
}
