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
import getDateTwoWeeks from '../utilities/getDateTwoWeeks';
import { getUserId } from '../utilities/getUserId';
import upsertConnection from '../utilities/upsertConnection';
import { Organisation } from './Organisation';
import { Defect } from './Defect';
import { Depot } from './Depot';
import { VehicleType } from './Enum';
import { FuelCard } from './FuelCard';
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

const VehicleInputFilter = inputObjectType({
  name: 'VehicleInputFilter',
  definition(t) {
    t.string('searchCriteria');
    t.nonNull.string('organisationId');
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
        data: nonNull(
          arg({
            type: VehicleInputFilter,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error(
            'Unable to retrieve vehicles. You are not logged in.'
          );
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
            'Unable to retrieve vehicles. You are not a member of this organisation'
          );
        }

        return context.prisma.vehicle.findMany({
          where: {
            AND: [
              { organisationId: args.data.organisationId },
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

    t.list.field('upcomingCVRT', {
      type: Vehicle,
      args: {
        organisationId: nonNull(idArg()),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error('Unable to retrieve depots. You are not logged in.');
        }

        const isInOrganisation =
          await context.prisma.usersOnOrganisations.findUnique({
            where: {
              userId_organisationId: {
                userId,
                organisationId: args.organisationId,
              },
            },
          });

        if (!isInOrganisation) {
          throw new Error(
            'Unable to retrieve depots. You are not a member of this organisation'
          );
        }

        return context.prisma.vehicle.findMany({
          where: {
            AND: [
              { organisationId: args.organisationId },
              {
                cvrt: {
                  lte: getDateTwoWeeks(),
                },
              },
            ],
          },
          orderBy: {
            cvrt: 'asc',
          },
        });
      },
    });

    t.list.field('upcomingThirteenWeek', {
      type: Vehicle,
      args: {
        organisationId: nonNull(idArg()),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error('Unable to retrieve depots. You are not logged in.');
        }

        const isInOrganisation =
          await context.prisma.usersOnOrganisations.findUnique({
            where: {
              userId_organisationId: {
                userId,
                organisationId: args.organisationId,
              },
            },
          });

        if (!isInOrganisation) {
          throw new Error(
            'Unable to retrieve depots. You are not a member of this organisation'
          );
        }

        return context.prisma.vehicle.findMany({
          where: {
            AND: [
              { organisationId: args.organisationId },
              {
                thirteenWeekInspection: {
                  lte: getDateTwoWeeks(),
                },
              },
            ],
          },
          orderBy: {
            thirteenWeekInspection: 'asc',
          },
        });
      },
    });

    t.list.field('upcomingTachoCalibration', {
      type: Vehicle,
      args: {
        organisationId: nonNull(idArg()),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error(
            'Unable to retrieve upcoming tacho cals. You are not logged in.'
          );
        }

        const isInOrganisation =
          await context.prisma.usersOnOrganisations.findUnique({
            where: {
              userId_organisationId: {
                userId,
                organisationId: args.organisationId,
              },
            },
          });

        if (!isInOrganisation) {
          throw new Error(
            'Unable to retrieve upcoming tacho cals. You are not a member of this organisation'
          );
        }

        return context.prisma.vehicle.findMany({
          where: {
            AND: [
              { organisationId: args.organisationId },
              {
                tachoCalibration: {
                  lte: getDateTwoWeeks(),
                },
              },
            ],
          },
          orderBy: {
            tachoCalibration: 'asc',
          },
        });
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
    t.date('cvrt');
    t.date('thirteenWeekInspection');
    t.date('tachoCalibration');
    t.string('depotId');
    t.string('fuelCardId');
    t.string('tollTagId');
    t.nonNull.string('organisationId');
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
    t.date('cvrt');
    t.date('thirteenWeekInspection');
    t.date('tachoCalibration');
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
        const vehicle = await context.prisma.vehicle.findUnique({
          where: {
            id: args.data.id,
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
          completionDate.setFullYear(completionDate.getFullYear() + yearsToAdd)
        );

        const updatedVehicle = await context.prisma.vehicle.update({
          where: {
            id: args.data.id,
          },
          data: {
            tachoCalibration: nextTachoCalibration,
          },
        });

        return updatedVehicle;
      },
    });
  },
});
