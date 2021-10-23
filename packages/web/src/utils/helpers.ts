import { useLocation } from "react-router-dom";
import { format } from "date-fns";

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

const formatDate = (dateInput: Date) => {
  return format(dateInput, "dd MMM yyyy");
};

const getYesterdayDateTimestamp = (): number => {
  const date = new Date();
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 1) / 1000;
};

const convertDateToDayTimestamp = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 1000;
};

const convertDateToMonthTimestamp = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1) / 1000;
};

const convertDateToStartOfMonth = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  // This is very weird we need month, not UTC month which can cause skip cause of time zones
  return new Date(Date.UTC(date.getUTCFullYear(), date.getMonth(), 1));
};

const getStartOfTheWeek = (dateInput: string | Date | number) => {
  const date = new Date(dateInput);
  const diff = date.getUTCDate() - date.getUTCDay() + (date.getUTCDay() === 0 ? -6 : 1);
  return new Date(date.setUTCDate(diff));
};

const getPreviousWeekTimeStamp = () => {
  const date = getStartOfTheWeek(new Date());
  const previousWeek = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 2);
  return convertDateToDayTimestamp(getStartOfTheWeek(previousWeek));
};

const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// https://en.wikipedia.org/wiki/Root_mean_square
const calculateRMS = (...args: number[]) => {
  return Math.sqrt(
    (1 / args.length) *
      args.reduce((sum, value) => {
        // x^2
        return sum + value * value;
      }, 0),
  );
};

export {
  getYesterdayDateTimestamp,
  convertDateToDayTimestamp,
  convertDateToMonthTimestamp,
  getStartOfTheWeek,
  convertDateToStartOfMonth,
  getPreviousWeekTimeStamp,
  capitalize,
  useQuery,
  formatDate,
  calculateRMS,
  timeAgo,
};
