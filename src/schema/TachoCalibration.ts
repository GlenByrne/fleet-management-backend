import { objectType } from 'nexus';
import { Context } from '../context';
import { Vehicle } from './Vehicle';

const TachoCalibration = objectType({
  name: 'TachoCalibration',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.date('dueDate');
    t.date('previousDate');
    t.field('vehicle', {
      type: Vehicle,
      resolve(parent, _, context: Context) {
        return context.prisma.tachographCalibration
          .findUnique({
            where: { id: parent.id },
          })
          .vehicle();
      },
    });
  },
});

export default TachoCalibration;
