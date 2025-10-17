import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("en");

export const ITEMS_PER_PAGE = 8;

export const paginate = (list: any[], page: number) =>
  list.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

export const groupByDate = (list: any[]) => {
  return list.reduce((groups: any, a: any) => {
    const dateKey = dayjs(a.due_date).format("dddd, D MMMM"); 
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(a);
    return groups;
  }, {});
};
