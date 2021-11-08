export const getDateTwoWeeks = () => {
  const weeks = 2;
  const date = new Date();
  date.setDate(date.getDate() + weeks * 7);

  return date;
};

export default getDateTwoWeeks;
