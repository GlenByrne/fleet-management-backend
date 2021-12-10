import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { createConnection } from '@/utilities/createConnection';
import { VehicleType } from '@/schema/Enum';
import { Vehicle } from '@/schema/schemaExports';

export const AddVehicleInput = inputObjectType({
  name: 'AddVehicleInput',
  definition(t) {
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
    t.nonNull.string('organisationId');
  },
});

export const addVehicle = mutationField('addVehicle', {
  type: nonNull(Vehicle),
  args: {
    data: nonNull(
      arg({
        type: AddVehicleInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const userId = verifyAccessToken(context);

    if (!userId) {
      throw new Error('Unable to add vehicle. You are not logged in.');
    }

    const isInOrganisation =
      await context.prisma.usersOnOrganisations.findUnique({
        where: {
          userId_organisationId: {
            userId,
            organisationId: args.data.organisationId,
          },
        },
      });

    if (!isInOrganisation) {
      throw new Error(
        'Unable to add vehicle. You are not a member of this organisation'
      );
    }

    const existingVehicle = await context.prisma.vehicle.findUnique({
      where: {
        registration: args.data.registration,
      },
    });

    if (existingVehicle) {
      throw new Error('Vehicle already exists with this registration');
    }

    return context.prisma.vehicle.create({
      data: {
        type: args.data.type,
        registration: args.data.registration,
        make: args.data.make,
        model: args.data.model,
        owner: args.data.owner,
        organisation: {
          connect: {
            id: args.data.organisationId,
          },
        },
        cvrt: args.data.cvrt,
        thirteenWeekInspection: args.data.thirteenWeekInspection,
        tachoCalibration: args.data.tachoCalibration,
        ...createConnection('depot', args.data.depotId),
        ...createConnection('fuelCard', args.data.fuelCardId),
        ...createConnection('tollTag', args.data.tollTagId),
      },
    });
  },
});
