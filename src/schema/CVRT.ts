import { objectType } from 'nexus';

const CVRT = objectType({
  name: 'CVRT',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.date('dueDate');
  },
});

export default CVRT;
