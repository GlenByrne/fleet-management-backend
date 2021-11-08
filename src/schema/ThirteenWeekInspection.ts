import { objectType } from 'nexus';
import { Context } from '../context';
import { Vehicle } from './Vehicle';

const ThirteenWeekInspection = objectType({
  name: 'ThirteenWeekInspection',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.date('dueDate');
    t.date('previousDate');
    t.field('vehicle', {
      type: Vehicle,
      resolve(parent, _, context: Context) {
        return context.prisma.thirteenWeekInspection
          .findUnique({
            where: { id: parent.id },
          })
          .vehicle();
      },
    });
  },
});

export default ThirteenWeekInspection;
