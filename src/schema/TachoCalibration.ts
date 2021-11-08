import { objectType } from 'nexus';
import { Status } from './Enum';

const TachoCalibration = objectType({
  name: 'TachoCalibration',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.date('dueDate');
    t.date('completionDate');
    t.field('status', { type: Status });
  },
});

export default TachoCalibration;
