import {
  arg,
  extendType,
  idArg,
  inputObjectType,
  nonNull,
  objectType,
} from 'nexus';
import { compare, hash } from 'bcrypt';
import { Context } from '../context';
import { Depot } from './Depot';
import { Company } from './Company';
import { getUserId } from '../utilities/getUserId';
import createConnection from '../utilities/createConnection';
import upsertConnection from '../utilities/upsertConnection';
import generateAccessToken from '../utilities/generateAccessToken';
import { Role } from './Enum';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.nonNull.string('email');
    t.nonNull.string('password');
    t.nonNull.field('role', {
      type: Role,
    });
    t.nonNull.field('company', {
      type: Company,
      resolve: async (parent, _, context: Context) => {
        const company = await context.prisma.user
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
        return context.prisma.user
          .findUnique({
            where: { id: parent.id },
          })
          .depot();
      },
    });
  },
});
export const UsersPayload = objectType({
  name: 'UsersPayload',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.nonNull.string('email');
    t.nonNull.field('role', { type: Role });
    t.field('depot', {
      type: Depot,
    });
  },
});

export const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.string('token');
    t.field('user', {
      type: UsersPayload,
    });
  },
});

const LoginInput = inputObjectType({
  name: 'LoginInput',
  definition(t) {
    t.nonNull.string('email');
    t.nonNull.string('password');
  },
});

const UsersInputFilter = inputObjectType({
  name: 'UsersInputFilter',
  definition(t) {
    t.string('searchCriteria');
  },
});

const AddUserInput = inputObjectType({
  name: 'AddUserInput',
  definition(t) {
    t.nonNull.string('email');
    t.nonNull.string('password');
    t.nonNull.string('name');
    t.nonNull.string('depotId');
    t.nonNull.field('role', { type: Role });
  },
});

const DeleteUserInput = inputObjectType({
  name: 'DeleteUserInput',
  definition(t) {
    t.nonNull.id('id');
  },
});

const UpdateUserInput = inputObjectType({
  name: 'UpdateUserInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('email');
    t.nonNull.string('name');
    t.nonNull.string('depotId');
    t.nonNull.field('role', { type: Role });
  },
});

export const UserQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('user', {
      type: UsersPayload,
      args: {
        userId: nonNull(idArg()),
      },
      resolve: (_, { userId }, context: Context) => {
        try {
          return context.prisma.user.findUnique({
            where: {
              id: userId,
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              depot: true,
              password: false,
              company: false,
            },
          });
        } catch {
          throw new Error('Error retrieving user');
        }
      },
    });
    t.field('me', {
      type: UsersPayload,
      resolve: (_, __, context: Context) => {
        const userId = getUserId(context);
        if (!userId) {
          throw new Error(
            'Unable to retrieve your account info. You are not logged in.'
          );
        }
        return context.prisma.user.findUnique({
          where: {
            id: String(userId),
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            depot: true,
            password: false,
            company: false,
          },
        });
      },
    });

    t.list.field('users', {
      type: UsersPayload,
      args: {
        data: arg({
          type: UsersInputFilter,
        }),
      },
      resolve: async (_, args, context: Context) => {
        try {
          const userId = getUserId(context);

          if (!userId) {
            throw new Error('Unable to retrieve users. You are not logged in.');
          }

          const company = await context.prisma.user
            .findUnique({
              where: {
                id: userId != null ? userId : undefined,
              },
            })
            .company();

          return context.prisma.user.findMany({
            where: {
              AND: [
                { companyId: company?.id },
                {
                  role: {
                    not: 'ADMIN',
                  },
                },
                {
                  name: {
                    contains:
                      args.data?.searchCriteria != null
                        ? args.data.searchCriteria
                        : undefined,
                    mode: 'insensitive',
                  },
                },
              ],
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              depot: true,
              password: false,
              company: false,
            },
            orderBy: {
              name: 'asc',
            },
          });
        } catch (error) {
          throw new Error('Error retrieving users');
        }
      },
    });
  },
});

export const UserMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('login', {
      type: AuthPayload,
      args: {
        data: nonNull(
          arg({
            type: LoginInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        const user = await context.prisma.user.findUnique({
          where: {
            email: args.data.email,
          },
          include: {
            depot: true,
          },
        });

        if (!user) {
          throw new Error('No user with these credentials could be found');
        }

        const valid = await compare(args.data.password, user.password);

        if (!valid) {
          throw new Error('The password you have entered is incorrect');
        }

        const token = generateAccessToken(user.id);

        return {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            depot: user.depot,
          },
        };
      },
    });

    // t.nonNull.field('register', {
    //   type: AuthPayload,
    //   args: {
    //     data: nonNull(
    //       arg({
    //         type: RegisterInput,
    //       })
    //     ),
    //   },
    //   resolve: async (_, args, context: Context) => {
    //     const existingUser = await context.prisma.user.findUnique({
    //       where: {
    //         email: args.data.email,
    //       },
    //     });

    //     if (existingUser) {
    //       throw new Error('ERROR: Account already exists with this email');
    //     }

    //     const hashedPassword = await hash(args.data.password, 10);

    //     const user = await context.prisma.user.create({
    //       data: {
    //         email: args.data.email,
    //         password: hashedPassword,
    //         name: args.data.name,
    //         role: 'USER',
    //         company: {
    //           connect: {
    //             id: args.data.companyId,
    //           },
    //         },
    //       },
    //     });

    //     if (!user) {
    //       throw new Error('Error');
    //     }

    //     const token = generateToken(user.id);

    //     return {
    //       token,
    //       user,
    //     };
    //   },
    // });

    t.nonNull.field('addUser', {
      type: UsersPayload,
      args: {
        data: nonNull(
          arg({
            type: AddUserInput,
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

        const existingUser = await context.prisma.user.findUnique({
          where: {
            email: args.data.email,
          },
        });

        if (existingUser) {
          throw new Error('Account already exists with this email');
        }

        const hashedPassword = await hash(args.data.password, 10);

        const user = await context.prisma.user.create({
          data: {
            email: args.data.email,
            password: hashedPassword,
            name: args.data.name,
            role: args.data.role,
            ...createConnection('depot', args.data.depotId),
            company: {
              connect: {
                id: company?.id,
              },
            },
          },
          include: {
            depot: true,
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          depot: user.depot,
        };
      },
    });

    t.nonNull.field('deleteUser', {
      type: User,
      args: {
        data: nonNull(
          arg({
            type: DeleteUserInput,
          })
        ),
      },
      resolve: (_, args, context: Context) => {
        try {
          return context.prisma.user.delete({
            where: {
              id: args.data.id,
            },
          });
        } catch (error) {
          throw new Error('Error deleting user');
        }
      },
    });

    t.nonNull.field('updateUser', {
      type: UsersPayload,
      args: {
        data: nonNull(
          arg({
            type: UpdateUserInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        try {
          const oldUser = await context.prisma.user.findUnique({
            where: {
              id: args.data.id,
            },
            include: {
              depot: {
                select: {
                  id: true,
                },
              },
            },
          });

          const user = await context.prisma.user.update({
            where: {
              id: args.data.id,
            },
            data: {
              name: args.data.name,
              email: args.data.email,
              role: args.data.role,
              ...upsertConnection(
                'depot',
                oldUser?.depot?.id,
                args.data.depotId
              ),
            },
            include: {
              depot: true,
            },
          });

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            depot: user.depot,
          };
        } catch (error) {
          throw new Error('Error updating user');
        }
      },
    });
  },
});
