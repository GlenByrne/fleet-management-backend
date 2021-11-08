import { objectType } from 'nexus';

const TachoCalibration = objectType({
  name: 'TachoCalibration',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.date('dueDate');
    t.date('previousDate');
  },
});

export default TachoCalibration;
