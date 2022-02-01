import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { Vehicle } from '@/schema/schemaExports';

export const UpdateVehicleThirteenWeekInspectionInput = inputObjectType({
  name: 'UpdateVehicleThirteenWeekInspectionInput',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.date('completionDate');
  },
});

export const updateVehicleThirteenWeekInspection = mutationField(
  'updateVehicleThirteenWeekInspection',
  {
    type: nonNull(Vehicle),
    args: {
      data: nonNull(
        arg({
          type: UpdateVehicleThirteenWeekInspectionInput,
        })
      ),
    },
    resolve: async (_, args, context: Context) => {
      const vehicle = await context.prisma.vehicle.findUnique({
        where: {
          id: args.data.id,
        },
      });

      if (!vehicle) {
        throw new Error('This vehicle does not exist.');
      }

      if (!vehicle.thirteenWeekInspection) {
        throw new Error(
          'This vehicle does not have a thirteen week inspection due date set.'
        );
      }

      const weeksToAdd = 13;
      const completionDate = new Date(args.data.completionDate);
      const nextThirteenWeekInspection = new Date(
        completionDate.setDate(completionDate.getDate() + weeksToAdd * 7)
      );

      const updatedVehicle = await context.prisma.vehicle.update({
        where: {
          id: args.data.id,
        },
        data: {
          thirteenWeekInspection: nextThirteenWeekInspection,
        },
      });

      return updatedVehicle;
    },
  }
);
