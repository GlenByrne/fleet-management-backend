import {
  objectType,
  idArg,
  nonNull,
  extendType,
  arg,
  inputObjectType,
} from 'nexus';
import { Context } from '../context';
import createConnection from '../utilities/createConnection';
import { getUserId } from '../utilities/getUserId';
import upsertConnection from '../utilities/upsertConnection';
import { Company } from './Company';
import CVRT from './CVRT';
import { Defect } from './Defect';
import { Depot } from './Depot';
import { VehicleType } from './Enum';
import { FuelCard } from './FuelCard';
import TachoCalibration from './TachoCalibration';
import ThirteenWeekInspection from './ThirteenWeekInspection';
import { TollTag } from './TollTag';

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
    t.field('cvrt', {
      type: CVRT,
      resolve(parent, _, context: Context) {
        return context.prisma.vehicle
          .findUnique({
            where: { id: parent.id },
          })
          .cvrt();
      },
    });
    t.field('thirteenWeekInspection', {
      type: ThirteenWeekInspection,
      resolve(parent, _, context: Context) {
        return context.prisma.vehicle
          .findUnique({
            where: { id: parent.id },
          })
          .thirteenWeekInspection();
      },
    });
    t.field('tachoCalibration', {
      type: TachoCalibration,
      resolve(parent, _, context: Context) {
        return context.prisma.vehicle
          .findUnique({
            where: { id: parent.id },
          })
          .tachoCalibration();
      },
    });
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

const VehicleInputFilter = inputObjectType({
  name: 'VehicleInputFilter',
  definition(t) {
    t.string('searchCriteria');
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
      resolve: (_, { vehicleId }, context: Context) => {
        try {
          return context.prisma.vehicle.findUnique({
            where: {
              id: vehicleId,
            },
          });
        } catch (error) {
          throw new Error('Error retrieving vehicle');
        }
      },
    });
    t.list.field('vehicles', {
      type: Vehicle,
      args: {
        data: arg({
          type: VehicleInputFilter,
        }),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error(
            'Unable to retrieve vehicles. You are not logged in.'
          );
        }

        const company = await context.prisma.user
          .findUnique({
            where: {
              id: userId != null ? userId : undefined,
            },
          })
          .company();

        return context.prisma.vehicle.findMany({
          where: {
            AND: [
              { companyId: company?.id },
              {
                registration: {
                  contains:
                    args.data?.searchCriteria != null
                      ? args.data.searchCriteria
                      : undefined,
                  mode: 'insensitive',
                },
              },
            ],
          },
          orderBy: {
            registration: 'asc',
          },
        });
      },
    });
    t.list.field('defectsForVehicle', {
      type: Defect,
      args: {
        vehicleId: nonNull(idArg()),
      },
      resolve: (_, { vehicleId }, context: Context) => {
        try {
          return context.prisma.vehicle
            .findUnique({
              where: {
                id: vehicleId,
              },
            })
            .defects();
        } catch (error) {
          throw new Error('There was an error retrieving defects for vehicle');
        }
      },
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

const UpdateVehicleDates = inputObjectType({
  name: 'UpdateVehicleDates',
  definition(t) {
    t.nonNull.string('id');
  },
});

const UpdateVehicleDatesWithCompletion = inputObjectType({
  name: 'UpdateVehicleDatesWithCompletion',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.date('completionDate');
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

        if (!userId) {
          throw new Error('Unable to add vehicle. You are not logged in.');
        }

        const company = await context.prisma.user
          .findUnique({
            where: {
              id: userId != null ? userId : undefined,
            },
          })
          .company();

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
            cvrt: {
              create: { dueDate: args.data.cvrtDueDate },
            },
            thirteenWeekInspection: {
              create: {
                dueDate: args.data.thirteenWeekInspectionDueDate,
              },
            },
            tachoCalibration: {
              create: {
                dueDate: args.data.tachoCalibrationDueDate,
              },
            },
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
      resolve: (_, args, context: Context) => {
        try {
          return context.prisma.vehicle.delete({
            where: {
              id: args.data.id,
            },
          });
        } catch (error) {
          throw new Error('Error deleting vehicle');
        }
      },
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
              cvrt: {
                update: {
                  dueDate: args.data.cvrtDueDate,
                },
              },
              thirteenWeekInspection: {
                update: {
                  dueDate: args.data.thirteenWeekInspectionDueDate,
                },
              },
              tachoCalibration: {
                update: {
                  dueDate: args.data.tachoCalibrationDueDate,
                },
              },
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

    t.nonNull.field('updateVehicleCVRT', {
      type: Vehicle,
      args: {
        data: nonNull(
          arg({
            type: UpdateVehicleDates,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        try {
          const vehicle = await context.prisma.vehicle.findUnique({
            where: {
              id: args.data.id,
            },
            include: {
              cvrt: true,
            },
          });

          if (!vehicle) {
            throw new Error('This vehicle does not exist.');
          }

          if (!vehicle.cvrt) {
            throw new Error('This vehicle does not have a cvrt due date set.');
          }

          const year = vehicle.cvrt.dueDate.getFullYear();
          const month = vehicle.cvrt.dueDate.getMonth();
          const day = vehicle.cvrt.dueDate.getDate();
          const nextCVRT = new Date(year + 1, month, day);

          const updatedVehicle = await context.prisma.vehicle.update({
            where: {
              id: args.data.id,
            },
            data: {
              cvrt: {
                update: {
                  dueDate: nextCVRT,
                },
              },
            },
          });

          return updatedVehicle;
        } catch (error) {
          throw new Error('Error deleting vehicle');
        }
      },
    });

    t.nonNull.field('updateVehicleThirteenWeekInspection', {
      type: Vehicle,
      args: {
        data: nonNull(
          arg({
            type: UpdateVehicleDatesWithCompletion,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        try {
          const vehicle = await context.prisma.vehicle.findUnique({
            where: {
              id: args.data.id,
            },
            include: {
              thirteenWeekInspection: true,
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
              thirteenWeekInspection: {
                update: {
                  dueDate: nextThirteenWeekInspection,
                  previousDate: completionDate,
                },
              },
            },
          });

          return updatedVehicle;
        } catch (error) {
          throw new Error('Error deleting vehicle');
        }
      },
    });

    t.nonNull.field('updateVehicleTachoCalibration', {
      type: Vehicle,
      args: {
        data: nonNull(
          arg({
            type: UpdateVehicleDatesWithCompletion,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        try {
          const vehicle = await context.prisma.vehicle.findUnique({
            where: {
              id: args.data.id,
            },
            include: {
              tachoCalibration: true,
            },
          });

          if (!vehicle) {
            throw new Error('This vehicle does not exist.');
          }

          if (!vehicle.tachoCalibration) {
            throw new Error(
              'This vehicle does not have a thirteen week inspection due date set.'
            );
          }

          const yearsToAdd = 2;
          const completionDate = new Date(args.data.completionDate);
          const nextTachoCalibration = new Date(
            completionDate.setFullYear(
              completionDate.getFullYear() + yearsToAdd
            )
          );

          const updatedVehicle = await context.prisma.vehicle.update({
            where: {
              id: args.data.id,
            },
            data: {
              tachoCalibration: {
                update: {
                  dueDate: nextTachoCalibration,
                  previousDate: completionDate,
                },
              },
            },
          });

          return updatedVehicle;
        } catch (error) {
          throw new Error('Error deleting vehicle');
        }
      },
    });
  },
});
