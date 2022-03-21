import { objectType } from 'nexus';
import { DefectStatus } from '@/schema/Enum';

const Defect = objectType({
  name: 'Defect',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('description');
    t.nonNull.string('reporter');
    t.nonNull.date('dateReported');
    t.date('dateCompleted');
    t.nonNull.field('status', {
      type: DefectStatus,
    });
  },
});

export default Defect;
