import { objectType } from 'nexus';
import { Context } from 'src/context';
import { VehicleType } from '@/schema/Enum';
import { Defect } from '@/schema/Defect/Defect';
import { Depot } from '@/schema/Depot/Depot';
import { FuelCard } from '@/schema/FuelCard/FuelCard';
import { Organisation } from '@/schema/Organisation/Organisation';
import { TollTag } from '@/schema/TollTag/TollTag';

export const Vehicle = objectType({
  name: 'Vehicle',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.field('type', {
      type: VehicleType,
    });
    t.nonNull.string('registration');
    t.nonNull.string('make');
    t.nonNull.string('model');
    t.nonNull.string('owner');
    t.date('cvrt');
    t.date('thirteenWeekInspection');
    t.date('tachoCalibration');
    t.nonNull.field('organisation', {
      type: Organisation,
      resolve: async (parent, _, context: Context) => {
        const organisation = await context.prisma.vehicle
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
    t.field('depot', {
      type: Depot,
      resolve(parent, _, context: Context) {
        return context.prisma.vehicle
          .findUnique({
            where: { id: parent.id },
          })
          .depot();
      },
    });
    t.nonNull.list.nonNull.field('defects', {
      type: Defect,
      resolve(parent, _, context: Context) {
        return context.prisma.vehicle
          .findUnique({
            where: { id: parent.id },
          })
          .defects();
      },
    });
    t.field('fuelCard', {
      type: FuelCard,
      resolve(parent, _, context: Context) {
        return context.prisma.vehicle
          .findUnique({
            where: { id: parent.id },
          })
          .fuelCard();
      },
    });
    t.field('tollTag', {
      type: TollTag,
      resolve(parent, _, context: Context) {
        return context.prisma.vehicle
          .findUnique({
            where: { id: parent.id },
          })
          .tollTag();
      },
    });
  },
});
