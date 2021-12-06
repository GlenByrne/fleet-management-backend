import {
  arg,
  extendType,
  idArg,
  inputObjectType,
  nonNull,
  objectType,
  stringArg,
} from 'nexus';
import { compare, hash } from 'bcrypt';
import { verify } from 'jsonwebtoken';
import { Context } from '../context';
import { getUserId } from '../utilities/getUserId';
import generateAccessToken from '../utilities/generateAccessToken';
import { Role } from './Enum';
import Infringement from './Infringement';
import generateRefreshToken from '../utilities/generateRefreshToken';
import getRefreshUserId from '../utilities/getRefreshUserId';
import { UsersOnOrganisations } from './UsersOnOrganisations';
import sendEmail, {
  activationEmail,
  resetPasswordEmail,
} from '../utilities/sendEmail';
import generateActivationToken from '../utilities/generateActivationToken';
import {
  ACTIVATION_TOKEN_SECRET,
  RESET_PASSWORD_TOKEN_SECRET,
} from '../server';
import generateResetPasswordToken from '../utilities/generateResetPasswordToken';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.nonNull.string('email');
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

export const MessagePayload = objectType({
  name: 'MessagePayload',
  definition(t) {
    t.nonNull.string('message');
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

const ActivateAccountInput = inputObjectType({
  name: 'ActivateAccountInput',
  definition(t) {
    t.nonNull.string('token');
  },
});

const ForgotPasswordInput = inputObjectType({
  name: 'ForgotPasswordInput',
  definition(t) {
    t.nonNull.string('email');
  },
});

const ResetPasswordInput = inputObjectType({
  name: 'ResetPasswordInput',
  definition(t) {
    t.nonNull.string('resetPasswordToken');
    t.nonNull.string('newPassword');
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
            organisations: true,
          },
        });
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
      type: MessagePayload,
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

        // const user = await context.prisma.user.create({
        //   data: {
        //     email: args.data.email,
        //     password: hashedPassword,
        //     name: args.data.name,
        //   },
        //   select: {
        //     id: true,
        //     name: true,
        //     email: true,
        //     infringements: true,
        //     password: false,
        //     organisations: true,
        //   },
        // });

        // if (!user) {
        //   throw new Error('Error');
        // }

        const token = generateActivationToken({
          name: args.data.name,
          email: args.data.email,
          password: hashedPassword,
        });

        const html = activationEmail(token);

        await sendEmail({
          from: '"Fred Foo 👻" <foo@example.com>',
          to: args.data.email,
          subject: 'Account Activation',
          html,
        });

        return {
          message: `Email has been sent to ${args.data.email}. Follow the instructions to activate your account`,
        };
        // const accessToken = generateAccessToken(user.id);
        // const refreshToken = generateRefreshToken(user.id);

        // context.res.cookie('refreshToken', refreshToken, {
        //   httpOnly: true,
        //   secure: true,
        //   sameSite: 'strict',
        // });

        // return {
        //   accessToken,
        //   user,
        // };
      },
    });

    t.nonNull.field('activateAccount', {
      type: 'Boolean',
      args: {
        data: nonNull(
          arg({
            type: ActivateAccountInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        if (!args.data.token) {
          return false;
        }

        const decoded = verify(args.data.token, ACTIVATION_TOKEN_SECRET);

        const { name, email, password } = decoded as {
          name: string;
          email: string;
          password: string;
        };

        const user = await context.prisma.user.create({
          data: {
            email,
            password,
            name,
          },
          select: {
            id: true,
            name: true,
            email: true,
            infringements: true,
            organisations: true,
          },
        });

        if (!user) {
          throw new Error('Error');
        }

        return true;

        // const accessToken = generateAccessToken(user.id);
        // const refreshToken = generateRefreshToken(user.id);

        // context.res.cookie('refreshToken', refreshToken, {
        //   httpOnly: true,
        //   secure: true,
        //   sameSite: 'strict',
        // });

        // return {
        //   accessToken,
        //   user,
        // };
      },
    });

    t.nonNull.field('forgotPassword', {
      type: 'Boolean',
      args: {
        data: nonNull(
          arg({
            type: ForgotPasswordInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        const user = await context.prisma.user.findUnique({
          where: {
            email: args.data.email,
          },
        });

        if (!user) {
          return true;
        }

        const token = generateResetPasswordToken({
          userId: user.id,
        });

        const html = resetPasswordEmail(token);

        await sendEmail({
          from: '"Fred Foo 👻" <foo@example.com>',
          to: user.email,
          subject: 'Password Reset',
          html,
        });

        return true;
      },
    });

    t.nonNull.field('resetPassword', {
      type: MessagePayload,
      args: {
        data: nonNull(
          arg({
            type: ResetPasswordInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        if (!args.data.resetPasswordToken) {
          throw new Error('No token found');
        }

        const decoded = verify(
          args.data.resetPasswordToken,
          RESET_PASSWORD_TOKEN_SECRET
        );

        const { userId } = decoded as {
          userId: string;
        };

        const hashedPassword = await hash(args.data.newPassword, 10);

        await context.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            password: hashedPassword,
          },
        });

        return {
          message: `Password reset! you can now log in with your new password`,
        };
      },
    });
  },
});
