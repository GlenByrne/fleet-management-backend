import { objectType } from 'nexus';
import { Status } from './Enum';

const CVRT = objectType({
  name: 'CVRT',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.date('dueDate');
    t.date('completionDate');
    t.field('status', { type: Status });
  },
});

export default CVRT;
