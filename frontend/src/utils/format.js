import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export const formatDate = (date, pattern = 'MMM d, yyyy') => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, pattern) : '';
};

export const formatDateTime = (date) => formatDate(date, 'MMM d, yyyy · h:mm a');

export const timeAgo = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '';
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');

export const truncate = (text = '', length = 140) =>
  text.length > length ? `${text.slice(0, length).trim()}...` : text;
