// Simple input validation helpers

export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isValidTime = (time: string): boolean => {
  const re = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return re.test(time);
};

export const isValidRating = (value: number): boolean => {
  return Number.isInteger(value) && value >= 1 && value <= 5;
};

export const isValidDate = (date: string): boolean => {
  const d = new Date(date);
  return !isNaN(d.getTime());
};

export const isValidUUID = (id: string): boolean => {
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return re.test(id);
};
