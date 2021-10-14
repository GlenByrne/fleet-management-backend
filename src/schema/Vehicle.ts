import {
  objectType,
  idArg,
  nonNull,
  extendType,
  arg,
  inputObjectType,
} from 'nexus';
import { Context } from '../context';
import { Defect } from './Defect';
import { Depot } from './Depot';
import { FuelCard } from './FuelCard';
import { TollTag } from './TollTag';

export const Vehicle = objectType({
  name: 'Vehicle',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('registration');
    t.nonNull.string('make');
    t.nonNull.string('model');
    t.nonNull.string('owner');
    t.date('cvrtDueDate');
    t.date('thirteenWeekInspectionDueDate');
    t.date('tachoCalibrationDueDate');
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
    t.nonNull.list.field('defects', {
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

export const VehicleQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('vehicle', {
      type: Vehicle,
      args: {
        vehicleId: nonNull(idArg()),
      },
      resolve: (_, { vehicleId }, context: Context) =>
        context.prisma.vehicle.findUnique({
          where: {
            id: vehicleId,
          },
        }),
    });
    t.list.field('vehicles', {
      type: Vehicle,
      resolve: (_, __, context: Context) => context.prisma.vehicle.findMany(),
    });
    t.list.field('defectsForVehicle', {
      type: Defect,
      args: {
        vehicleId: nonNull(idArg()),
      },
      resolve: (_, { vehicleId }, context: Context) =>
        context.prisma.vehicle
          .findUnique({
            where: {
              id: vehicleId,
            },
          })
          .defects(),
    });
  },
});

const AddVehicleInput = inputObjectType({
  name: 'AddVehicleInput',
  definition(t) {
    t.nonNull.string('registration');
    t.nonNull.string('make');
    t.nonNull.string('model');
    t.nonNull.string('owner');
    t.date('cvrtDueDate');
    t.date('thirteenWeekInspectionDueDate');
    t.date('tachoCalibrationDueDate');
    t.nonNull.string('depotId');
    t.string('fuelCardId');
    t.string('tollTagId');
  },
});

const UpdateVehicleInput = inputObjectType({
  name: 'UpdateVehicleInput',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('registration');
    t.nonNull.string('make');
    t.nonNull.string('model');
    t.nonNull.string('owner');
    t.date('cvrtDueDate');
    t.date('thirteenWeekInspectionDueDate');
    t.date('tachoCalibrationDueDate');
    t.nonNull.string('depotId');
    t.string('fuelCardId');
    t.string('tollTagId');
  },
});

const DeleteVehicleInput = inputObjectType({
  name: 'DeleteVehicleInput',
  definition(t) {
    t.nonNull.id('id');
  },
});

export const VehicleMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('addVehicle', {
      type: Vehicle,
      args: {
        data: nonNull(
          arg({
            type: AddVehicleInput,
          })
        ),
      },
      resolve: (_, args, context: Context) =>
        context.prisma.vehicle.create({
          data: {
            registration: args.data.registration,
            make: args.data.make,
            model: args.data.model,
            owner: args.data.owner,
            cvrtDueDate: args.data.cvrtDueDate,
            thirteenWeekInspectionDueDate:
              args.data.thirteenWeekInspectionDueDate,
            tachoCalibrationDueDate: args.data.tachoCalibrationDueDate,
            depot: {
              connect: {
                id: args.data.depotId,
              },
            },
            fuelCard: {
              connect: {
                id: args.data.fuelCardId || undefined,
              },
            },
            tollTag: {
              connect: {
                id: args.data.tollTagId || undefined,
              },
            },
          },
        }),
    });

    t.nonNull.field('deleteVehicle', {
      type: Vehicle,
      args: {
        data: nonNull(
          arg({
            type: DeleteVehicleInput,
          })
        ),
      },
      resolve: (_, args, context: Context) =>
        context.prisma.vehicle.delete({
          where: {
            id: args.data.id,
          },
        }),
    });

    t.nonNull.field('updateVehicle', {
      type: Vehicle,
      args: {
        data: nonNull(
          arg({
            type: UpdateVehicleInput,
          })
        ),
      },
      resolve: (_, args, context: Context) =>
        context.prisma.vehicle.update({
          where: {
            id: args.data.id,
          },
          data: {
            registration: args.data.registration,
            make: args.data.make,
            model: args.data.model,
            owner: args.data.owner,
            cvrtDueDate: args.data.cvrtDueDate,
            thirteenWeekInspectionDueDate:
              args.data.thirteenWeekInspectionDueDate,
            tachoCalibrationDueDate: args.data.tachoCalibrationDueDate,
            depot: {
              connect: {
                id: args.data.depotId,
              },
            },
            fuelCard: {
              connect: {
                id: args.data.fuelCardId || undefined,
              },
            },
            tollTag: {
              connect: {
                id: args.data.tollTagId || undefined,
              },
            },
          },
        }),
    });
  },
});
