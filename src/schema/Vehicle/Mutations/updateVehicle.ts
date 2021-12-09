import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { upsertConnection } from '@/utilities/upsertConnection';
import { VehicleType } from '@/schema/Enum';
import { Vehicle } from '@/schema/Vehicle/Vehicle';

export const UpdateVehicleInput = inputObjectType({
  name: 'UpdateVehicleInput',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.field('type', { type: VehicleType });
    t.nonNull.string('registration');
    t.nonNull.string('make');
    t.nonNull.string('model');
    t.nonNull.string('owner');
    t.date('cvrt');
    t.date('thirteenWeekInspection');
    t.date('tachoCalibration');
    t.string('depotId');
    t.string('fuelCardId');
    t.string('tollTagId');
  },
});

export const updateVehicle = mutationField('updateVehicle', {
  type: nonNull(Vehicle),
  args: {
    data: nonNull(
      arg({
        type: UpdateVehicleInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    try {
      const oldVehicle = await context.prisma.vehicle.findUnique({
        where: {
          id: args.data.id,
        },
        include: {
          fuelCard: {
            select: {
              id: true,
            },
          },
          tollTag: {
            select: {
              id: true,
            },
          },
          depot: {
            select: {
              id: true,
            },
          },
        },
      });

      const vehicle = context.prisma.vehicle.update({
        where: {
          id: args.data.id,
        },
        data: {
          type: args.data.type,
          registration: args.data.registration,
          make: args.data.make,
          model: args.data.model,
          owner: args.data.owner,
          cvrt: args.data.cvrt,
          thirteenWeekInspection: args.data.thirteenWeekInspection,
          tachoCalibration: args.data.tachoCalibration,
          ...upsertConnection(
            'depot',
            oldVehicle?.depot?.id,
            args.data.depotId
          ),
          ...upsertConnection(
            'fuelCard',
            oldVehicle?.fuelCard?.id,
            args.data.fuelCardId
          ),
          ...upsertConnection(
            'tollTag',
            oldVehicle?.tollTag?.id,
            args.data.tollTagId
          ),
        },
      });

      return vehicle;
    } catch {
      throw new Error('Error updating vehicle');
    }
  },
});
