import { hash } from 'bcrypt';
import { objectType, nonNull, extendType, arg, inputObjectType } from 'nexus';
import { Context } from '../context';
import { Depot } from './Depot';
import { FuelCard } from './FuelCard';
import { TollTag } from './TollTag';
import { Vehicle } from './Vehicle';
import { User, UsersPayload } from './User';
import generateAccessToken from '../utilities/generateAccessToken';

export const Company = objectType({
  name: 'Company',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.nonNull.list.nonNull.field('users', {
      type: User,
      resolve(parent, _, context: Context) {
        return context.prisma.company
          .findUnique({
            where: { id: parent.id },
          })
          .users();
      },
    });
    t.nonNull.list.nonNull.field('vehicles', {
      type: Vehicle,
      resolve(parent, _, context: Context) {
        return context.prisma.company
          .findUnique({
            where: { id: parent.id },
          })
          .vehicles();
      },
    });
    t.nonNull.list.nonNull.field('depots', {
      type: Depot,
      resolve(parent, _, context: Context) {
        return context.prisma.company
          .findUnique({
            where: { id: parent.id },
          })
          .depots();
      },
    });
    t.nonNull.list.nonNull.field('fuelCards', {
      type: FuelCard,
      resolve(parent, _, context: Context) {
        return context.prisma.company
          .findUnique({
            where: { id: parent.id },
          })
          .fuelCards();
      },
    });
    t.nonNull.list.nonNull.field('tollTags', {
      type: TollTag,
      resolve(parent, _, context: Context) {
        return context.prisma.company
          .findUnique({
            where: { id: parent.id },
          })
          .tollTags();
      },
    });
  },
});

export const CompanyQuery = extendType({
  type: 'Query',
  definition(t) {
    // t.field('company', {
    //   type: Company,
    //   args: {
    //     companyId: nonNull(idArg()),
    //   },
    //   resolve: (_, { companyId }, context: Context) =>
    //     context.prisma.company.findUnique({
    //       where: {
    //         id: companyId,
    //       },
    //     }),
    // });
    // t.list.field('users', {
    //   type: User,
    //   args: {
    //     companyId: nonNull(idArg()),
    //   },
    //   resolve: (_, { companyId }, context: Context) =>
    //     context.prisma.company
    //       .findUnique({
    //         where: {
    //           id: companyId,
    //         },
    //       })
    //       .users(),
    // });
    // t.list.field('vehicles', {
    //   type: Vehicle,
    //   args: {
    //     companyId: nonNull(idArg()),
    //   },
    //   resolve: (_, { companyId }, context: Context) =>
    //     context.prisma.company
    //       .findUnique({
    //         where: {
    //           id: companyId,
    //         },
    //       })
    //       .vehicles(),
    // });
    // t.list.field('depots', {
    //   type: Depot,
    //   args: {
    //     companyId: nonNull(idArg()),
    //   },
    //   resolve: (_, { companyId }, context: Context) =>
    //     context.prisma.company
    //       .findUnique({
    //         where: {
    //           id: companyId,
    //         },
    //       })
    //       .depots(),
    // });
    // t.list.field('fuelCards', {
    //   type: FuelCard,
    //   args: {
    //     companyId: nonNull(idArg()),
    //   },
    //   resolve: (_, { companyId }, context: Context) =>
    //     context.prisma.company
    //       .findUnique({
    //         where: {
    //           id: companyId,
    //         },
    //       })
    //       .fuelCards(),
    // });
    // t.list.field('tollTags', {
    //   type: TollTag,
    //   args: {
    //     companyId: nonNull(idArg()),
    //   },
    //   resolve: (_, { companyId }, context: Context) =>
    //     context.prisma.company
    //       .findUnique({
    //         where: {
    //           id: companyId,
    //         },
    //       })
    //       .tollTags(),
    // });
  },
});

const AddCompanyInput = inputObjectType({
  name: 'AddCompanyInput',
  definition(t) {
    t.nonNull.string('name');
    t.nonNull.string('adminName');
    t.nonNull.string('email');
    t.nonNull.string('password');
  },
});

export const AddCompanyPayload = objectType({
  name: 'AddCompanyPayload',
  definition(t) {
    t.field('company', {
      type: Company,
    });
    t.field('user', {
      type: UsersPayload,
    });
  },
});

export const CompanyMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('addCompany', {
      type: AddCompanyPayload,
      args: {
        data: nonNull(
          arg({
            type: AddCompanyInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        const existingUser = await context.prisma.user.findUnique({
          where: {
            email: args.data.email,
          },
        });

        if (existingUser) {
          throw new Error('ERROR: Account already exists with this email');
        }

        const hashedPassword = await hash(args.data.password, 10);

        const company = await context.prisma.company.create({
          data: {
            name: args.data.name,
            users: {
              create: [
                {
                  name: args.data.adminName,
                  email: args.data.email,
                  password: hashedPassword,
                  role: 'ADMIN',
                },
              ],
            },
          },
        });

        const user = await context.prisma.user.findUnique({
          where: {
            email: args.data.email,
          },
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

        if (!user) {
          throw new Error('Error');
        }

        const token = generateAccessToken(user.id);

        context.res.cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/',
        });

        return {
          company,
          user,
        };
      },
    });
  },
});
