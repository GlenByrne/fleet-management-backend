import { objectType } from 'nexus';
import { Context } from 'src/context';
import { Organisation } from '@/schema/Organisation/Organisation';
import { Vehicle } from '@/schema/Vehicle/Vehicle';

export const FuelCard = objectType({
  name: 'FuelCard',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('cardNumber');
    t.nonNull.string('cardProvider');
    t.nonNull.field('organisation', {
      type: Organisation,
      resolve: async (parent, _, context: Context) => {
        const organisation = await context.prisma.fuelCard
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
    t.field('vehicle', {
      type: Vehicle,
      resolve(parent, _, context: Context) {
        return context.prisma.fuelCard
          .findUnique({
            where: { id: parent.id },
          })
          .vehicle();
      },
    });
  },
});
