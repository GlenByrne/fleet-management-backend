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
import { Organisation } from './Organisation';
import { getUserId } from '../utilities/getUserId';
import createConnection from '../utilities/createConnection';
import upsertConnection from '../utilities/upsertConnection';
import generateAccessToken from '../utilities/generateAccessToken';
import { Role } from './Enum';
import Infringement from './Infringement';
import generateRefreshToken from '../utilities/generateRefreshToken';
import getRefreshUserId from '../utilities/getRefreshUserId';
import { UsersOnOrganisations } from './UsersOnOrganisations';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.nonNull.string('email');
    t.nonNull.string('password');
    t.list.field('organisations', {
      type: UsersOnOrganisations,
      resolve: async (parent, _, context: Context) => {
        const organisation = await context.prisma.user
          .findUnique({
            where: { id: parent.id },
          })
          .organisations();

        if (!organisation) {
          throw new Error('Organisation not found');
        }

        return organisation;
      },
    });
    t.nonNull.list.nonNull.field('infringements', {
      type: Infringement,
      resolve(parent, _, context: Context) {
        return context.prisma.user
          .findUnique({
            where: { id: parent.id },
          })
          .infringements();
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
    t.nonNull.list.nonNull.field('infringements', {
      type: Infringement,
    });
    t.nonNull.list.nonNull.field('organisations', {
      type: UsersOnOrganisations,
    });
  },
});

export const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.field('user', {
      type: UsersPayload,
    });
    t.nonNull.string('accessToken');
  },
});

export const LogoutPayload = objectType({
  name: 'LogoutPayload',
  definition(t) {
    t.nonNull.string('message');
  },
});

export const RefreshTokenPayload = objectType({
  name: 'RefreshTokenPayload',
  definition(t) {
    t.nonNull.string('accessToken');
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
    t.nonNull.string('organisationId');
  },
});

const RegisterInput = inputObjectType({
  name: 'RegisterInput',
  definition(t) {
    t.nonNull.string('name');
    t.nonNull.string('email');
    t.nonNull.string('password');
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
              infringements: true,
              password: false,
              organisations: true,
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
            id: userId,
          },
          select: {
            id: true,
            name: true,
            email: true,
            infringements: true,
            password: false,
            organisations: true,
          },
        });
      },
    });
    t.list.field('currentUsersOrganisations', {
      type: UsersOnOrganisations,
      resolve: async (_, __, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error(
            'Unable to retrieve your account info. You are not logged in.'
          );
        }
        const user = await context.prisma.user.findUnique({
          where: {
            id: userId,
          },
          include: {
            organisations: {
              include: {
                organisation: true,
              },
            },
          },
        });

        if (!user) {
          throw new Error('User not found');
        }

        return user.organisations;
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
            infringements: true,
            organisations: true,
          },
        });

        if (!user) {
          throw new Error('Email or password is incorrect');
        }

        const valid = await compare(args.data.password, user.password);

        if (!valid) {
          throw new Error('Email or password is incorrect');
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        context.res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            infringements: user.infringements,
            organisations: user.organisations,
          },
          accessToken,
        };
      },
    });

    t.nonNull.field('logout', {
      type: LogoutPayload,
      resolve: async (_, __, context: Context) => {
        context.res.cookie('refreshToken', '', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          expires: new Date(0),
        });
        return {
          message: 'Logged out successfully',
        };
      },
    });

    t.nonNull.field('refreshToken', {
      type: RefreshTokenPayload,
      resolve: async (_, __, context: Context) => {
        const userId = getRefreshUserId(context);

        if (!userId) {
          throw new Error('User could not be found');
        }

        const accessToken = generateAccessToken(userId);
        const refreshToken = generateRefreshToken(userId);

        context.res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return {
          accessToken,
        };
      },
    });

    t.nonNull.field('register', {
      type: AuthPayload,
      args: {
        data: nonNull(
          arg({
            type: RegisterInput,
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

        const user = await context.prisma.user.create({
          data: {
            email: args.data.email,
            password: hashedPassword,
            name: args.data.name,
          },
          select: {
            id: true,
            name: true,
            email: true,
            infringements: true,
            password: false,
            organisations: true,
          },
        });

        if (!user) {
          throw new Error('Error');
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        context.res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });

        return {
          accessToken,
          user,
        };
      },
    });

    // t.nonNull.field('addUser', {
    //   type: UsersPayload,
    //   args: {
    //     data: nonNull(
    //       arg({
    //         type: AddUserInput,
    //       })
    //     ),
    //   },
    //   resolve: async (_, args, context: Context) => {
    //     const userId = getUserId(context);

    //     const organisation = await context.prisma.user
    //       .findUnique({
    //         where: {
    //           id: userId != null ? userId : undefined,
    //         },
    //       })
    //       .organisation();

    //     const existingUser = await context.prisma.user.findUnique({
    //       where: {
    //         email: args.data.email,
    //       },
    //     });

    //     if (existingUser) {
    //       throw new Error('Account already exists with this email');
    //     }

    //     const hashedPassword = await hash(args.data.password, 10);

    //     const user = await context.prisma.user.create({
    //       data: {
    //         email: args.data.email,
    //         password: hashedPassword,
    //         name: args.data.name,
    //         role: args.data.role,
    //         ...createConnection('depot', args.data.depotId),
    //         organisation: {
    //           connect: {
    //             id: organisation?.id,
    //           },
    //         },
    //       },
    //       include: {
    //         depot: true,
    //         infringements: true,
    //       },
    //     });

    //     return {
    //       id: user.id,
    //       name: user.name,
    //       email: user.email,
    //       role: user.role,
    //       depot: user.depot,
    //       infringements: user.infringements,
    //     };
    //   },
    // });

    // t.nonNull.field('deleteUser', {
    //   type: User,
    //   args: {
    //     data: nonNull(
    //       arg({
    //         type: DeleteUserInput,
    //       })
    //     ),
    //   },
    //   resolve: (_, args, context: Context) => {
    //     try {
    //       return context.prisma.user.delete({
    //         where: {
    //           id: args.data.id,
    //         },
    //       });
    //     } catch (error) {
    //       throw new Error('Error deleting user');
    //     }
    //   },
    // });

    // t.nonNull.field('updateUser', {
    //   type: UsersPayload,
    //   args: {
    //     data: nonNull(
    //       arg({
    //         type: UpdateUserInput,
    //       })
    //     ),
    //   },
    //   resolve: async (_, args, context: Context) => {
    //     try {
    //       const oldUser = await context.prisma.user.findUnique({
    //         where: {
    //           id: args.data.id,
    //         },
    //         include: {
    //           depot: {
    //             select: {
    //               id: true,
    //             },
    //           },
    //         },
    //       });

    //       const user = await context.prisma.user.update({
    //         where: {
    //           id: args.data.id,
    //         },
    //         data: {
    //           name: args.data.name,
    //           email: args.data.email,
    //           role: args.data.role,
    //           ...upsertConnection(
    //             'depot',
    //             oldUser?.depot?.id,
    //             args.data.depotId
    //           ),
    //         },
    //         include: {
    //           depot: true,
    //           infringements: true,
    //         },
    //       });

    //       return {
    //         id: user.id,
    //         name: user.name,
    //         email: user.email,
    //         role: user.role,
    //         depot: user.depot,
    //         infringements: user.infringements,
    //       };
    //     } catch (error) {
    //       throw new Error('Error updating user');
    //     }
    //   },
    // });
  },
});
