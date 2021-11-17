import { arg, extendType, inputObjectType, nonNull, objectType } from 'nexus';
import { Context } from '../context';
import { getUserId } from '../utilities/getUserId';
import { InfringementStatus } from './Enum';
import { UsersPayload } from './User';

const Infringement = objectType({
  name: 'Infringement',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('description');
    t.nonNull.date('dateOccured');
    t.nonNull.field('status', {
      type: InfringementStatus,
    });
    t.field('driver', {
      type: UsersPayload,
      resolve(parent, _, context: Context) {
        return context.prisma.infringement
          .findUnique({
            where: { id: parent.id },
          })
          .driver({
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              depot: true,
              infringements: true,
              password: false,
              company: false,
            },
          });
      },
    });
  },
});

const AddInfringementInput = inputObjectType({
  name: 'AddInfringementInput',
  definition(t) {
    t.nonNull.id('driverId');
    t.nonNull.string('description');
    t.nonNull.date('dateOccured');
  },
});

export const InfringementMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('addInfringement', {
      type: Infringement,
      args: {
        data: nonNull(
          arg({
            type: AddInfringementInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error('Unable to add fuel card. You are not logged in.');
        }

        const driver = await context.prisma.user.findUnique({
          where: {
            id: args.data.driverId,
          },
        });

        if (!driver) {
          throw new Error('Unable to add infringemnt. Driver not found.');
        }

        if (driver.role !== 'DRIVER') {
          throw new Error(
            'Unable to add infringemnt. Infringements can only be added to a driver'
          );
        }

        return context.prisma.infringement.create({
          data: {
            description: args.data.description,
            dateOccured: args.data.dateOccured,
            status: 'UNSIGNED',
            driver: {
              connect: {
                id: args.data.driverId,
              },
            },
          },
        });
      },
    });
  },
});

export default Infringement;
