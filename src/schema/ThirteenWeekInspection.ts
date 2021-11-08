import { objectType } from 'nexus';
import { Status } from './Enum';

const ThirteenWeekInspection = objectType({
  name: 'ThirteenWeekInspection',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.date('dueDate');
    t.date('completionDate');
    t.field('status', { type: Status });
  },
});

export default ThirteenWeekInspection;
