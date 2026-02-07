import { differenceInYears, parseISO } from 'date-fns';

export function calculateAge(dateOfBirth: string): number {
  try {
    const dob = parseISO(dateOfBirth);
    return differenceInYears(new Date(), dob);
  } catch (error) {
    return 0;
  }
}

export function isAgeOver(dateOfBirth: string, minimumAge: number): boolean {
  return calculateAge(dateOfBirth) >= minimumAge;
}

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return dateString;
  }
}
