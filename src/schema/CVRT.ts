import { objectType } from 'nexus';
import { Context } from '../context';
import { Vehicle } from './Vehicle';

const CVRT = objectType({
  name: 'CVRT',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.date('dueDate');
    t.field('vehicle', {
      type: Vehicle,
      resolve(parent, _, context: Context) {
        return context.prisma.cvrt
          .findUnique({
            where: { id: parent.id },
          })
          .vehicle();
      },
    });
  },
});

export default CVRT;
