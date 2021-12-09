import { objectType, mutationField, nonNull } from 'nexus';
import { Context } from 'src/context';

export const LogoutPayload = objectType({
  name: 'LogoutPayload',
  definition(t) {
    t.nonNull.string('message');
  },
});

export const logout = mutationField('logout', {
  type: nonNull(LogoutPayload),
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
