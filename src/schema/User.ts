import {
  arg,
  enumType,
  extendType,
  inputObjectType,
  nonNull,
  objectType,
} from 'nexus';
import { compare, hash } from 'bcrypt';
import { Context } from '../context';
import { Depot } from './Depot';
import generateToken from '../utilities/generateToken';

export const Role = enumType({
  name: 'Role',
  members: {
    User: 'USER',
    Admin: 'ADMIN',
  },
});

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

export const UserLoginPayload = objectType({
  name: 'UserLoginPayload',
  definition(t) {
    t.field('user', {
      type: User,
    });
    t.string('token');
  },
});

export const UserRegisterPayload = objectType({
  name: 'UserRegisterPayload',
  definition(t) {
    t.field('user', {
      type: User,
    });
    t.string('token');
  },
});

const LoginInput = inputObjectType({
  name: 'LoginInput',
  definition(t) {
    t.nonNull.string('email');
    t.nonNull.string('password');
  },
});

const RegisterInput = inputObjectType({
  name: 'RegisterInput',
  definition(t) {
    t.nonNull.string('email');
    t.nonNull.string('password');
  },
});

export const UserMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('login', {
      type: UserLoginPayload,
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
        });

        if (!user) {
          throw new Error('No user found');
        }

        const valid = await compare(args.data.password, user.password);

        if (!valid) {
          throw new Error('Password is Incorrect');
        }

        const token = generateToken(user.id);

        return {
          token,
          user,
        };
      },
    });

    t.nonNull.field('register', {
      type: UserRegisterPayload,
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
            name: 'Test Name',
          },
        });

        if (!user) {
          throw new Error('Error');
        }

        // const token = jwt.sign({ userId: user.id }, 'TEST_SECRET');
        const token = generateToken(user.id);

        return {
          token,
          user,
        };
      },
    });
  },
});
