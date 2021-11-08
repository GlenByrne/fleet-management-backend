import { objectType } from 'nexus';

const ThirteenWeekInspection = objectType({
  name: 'ThirteenWeekInspection',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.date('dueDate');
    t.date('previousDate');
  },
});

export default ThirteenWeekInspection;
