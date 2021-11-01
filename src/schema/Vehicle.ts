import {
  objectType,
  idArg,
  nonNull,
  extendType,
  arg,
  inputObjectType,
  enumType,
} from 'nexus';
import { Context } from '../context';
import createConnection from '../utilities/createConnection';
import { getUserId } from '../utilities/getUserId';
import upsertConnection from '../utilities/upsertConnection';
import { Company } from './Company';
import { Defect } from './Defect';
import { Depot } from './Depot';
import { FuelCard } from './FuelCard';
import { TollTag } from './TollTag';

export const VehicleType = enumType({
  name: 'VehicleType',
  members: {
    Van: 'VAN',
    Truck: 'TRUCK',
    Trailer: 'TRAILER',
  },
});

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
    t.date('cvrtDueDate');
    t.date('thirteenWeekInspectionDueDate');
    t.date('tachoCalibrationDueDate');
    t.nonNull.field('company', {
      type: Company,
      resolve: async (parent, _, context: Context) => {
        const company = await context.prisma.vehicle
          .findUnique({
            where: { id: parent.id },
          })
          .company();

        if (!company) {
          throw new Error('Company not found');
        }

        return company;
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
      resolve: async (_, __, context: Context) => {
        const userId = getUserId(context);

        const company = await context.prisma.user
          .findUnique({
            where: {
              id: userId != null ? userId : undefined,
            },
          })
          .company();

        return context.prisma.vehicle.findMany({
          where: {
            companyId: company?.id,
          },
        });
      },
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
    t.nonNull.field('type', { type: VehicleType });
    t.nonNull.string('registration');
    t.nonNull.string('make');
    t.nonNull.string('model');
    t.nonNull.string('owner');
    t.date('cvrtDueDate');
    t.date('thirteenWeekInspectionDueDate');
    t.date('tachoCalibrationDueDate');
    t.string('depotId');
    t.string('fuelCardId');
    t.string('tollTagId');
  },
});

const UpdateVehicleInput = inputObjectType({
  name: 'UpdateVehicleInput',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.field('type', { type: VehicleType });
    t.nonNull.string('registration');
    t.nonNull.string('make');
    t.nonNull.string('model');
    t.nonNull.string('owner');
    t.date('cvrtDueDate');
    t.date('thirteenWeekInspectionDueDate');
    t.date('tachoCalibrationDueDate');
    t.string('depotId');
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
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        const company = await context.prisma.user
          .findUnique({
            where: {
              id: userId != null ? userId : undefined,
            },
          })
          .company();

        return context.prisma.vehicle.create({
          data: {
            type: args.data.type,
            registration: args.data.registration,
            make: args.data.make,
            model: args.data.model,
            owner: args.data.owner,
            cvrtDueDate: args.data.cvrtDueDate,
            thirteenWeekInspectionDueDate:
              args.data.thirteenWeekInspectionDueDate,
            tachoCalibrationDueDate: args.data.tachoCalibrationDueDate,
            company: {
              connect: {
                id: company?.id,
              },
            },
            ...createConnection('depot', args.data.depotId),
            ...createConnection('fuelCard', args.data.fuelCardId),
            ...createConnection('tollTag', args.data.tollTagId),
          },
        });
      },
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
      resolve: async (_, args, context: Context) => {
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
            cvrtDueDate: args.data.cvrtDueDate,
            thirteenWeekInspectionDueDate:
              args.data.thirteenWeekInspectionDueDate,
            tachoCalibrationDueDate: args.data.tachoCalibrationDueDate,
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
      },
    });
  },
});
