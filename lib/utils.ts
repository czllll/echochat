import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDateTime = (date: Date | string) => {
  const d = new Date(date);
  return format(d, 'yyyy-MM-dd HH:mm:ss');
};