import { objectType, mutationField, nonNull } from 'nexus';
import { Context } from 'src/context';
import { generateAccessToken } from '@/utilities/generateAccessToken';
import { generateRefreshToken } from '@/utilities/generateRefreshToken';
import { getRefreshUserId } from '@/utilities/getRefreshUserId';

export const RefreshAccessTokenPayload = objectType({
  name: 'RefreshAccessTokenPayload',
  definition(t) {
    t.nonNull.string('accessToken');
  },
});

export const refreshAccessToken = mutationField('refreshAccessToken', {
  type: nonNull(RefreshAccessTokenPayload),
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
