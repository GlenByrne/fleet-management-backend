import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { Vehicle } from '@/schema/Vehicle/Vehicle';

export const UpdateVehicleCVRTInput = inputObjectType({
  name: 'UpdateVehicleCVRTInput',
  definition(t) {
    t.nonNull.string('id');
  },
});

export const updateVehicleCVRT = mutationField('updateVehicleCVRT', {
  type: nonNull(Vehicle),
  args: {
    data: nonNull(
      arg({
        type: UpdateVehicleCVRTInput,
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

    if (!vehicle.cvrt) {
      throw new Error('This vehicle does not have a cvrt due date set.');
    }

    const year = vehicle.cvrt.getFullYear();
    const month = vehicle.cvrt.getMonth();
    const day = vehicle.cvrt.getDate();
    const nextCVRT = new Date(year + 1, month, day);

    const updatedVehicle = await context.prisma.vehicle.update({
      where: {
        id: args.data.id,
      },
      data: {
        cvrt: nextCVRT,
      },
    });

    return updatedVehicle;
  },
});
