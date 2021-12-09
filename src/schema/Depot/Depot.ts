import { objectType } from 'nexus';
import { Context } from 'src/context';
import { Organisation } from '@/schema/Organisation/Organisation';
import { Vehicle } from '@/schema/Vehicle/Vehicle';

export const Depot = objectType({
  name: 'Depot',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.nonNull.field('organisation', {
      type: Organisation,
      resolve: async (parent, _, context: Context) => {
        const organisation = await context.prisma.depot
          .findUnique({
            where: { id: parent.id },
          })
          .organisation();

        if (!organisation) {
          throw new Error('Organisation not found');
        }

        return organisation;
      },
    });
    t.nonNull.list.nonNull.field('vehicles', {
      type: Vehicle,
      resolve(parent, _, context: Context) {
        return context.prisma.depot
          .findUnique({
            where: { id: parent.id },
          })
          .vehicles();
      },
    });
  },
});
