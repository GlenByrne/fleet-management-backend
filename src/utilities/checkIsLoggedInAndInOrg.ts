import { Context } from '../context';
import getUserId from './getUserId';

const checkIsLoggedInAndInOrg = async (
  context: Context,
  organisationId: string
) => {
  const userId = getUserId(context);

  if (!userId) {
    throw new Error('Unable to add vehicle. You are not logged in.');
  }

  const isInOrganisation = await context.prisma.usersOnOrganisations.findUnique(
    {
      where: {
        userId_organisationId: {
          userId,
          organisationId,
        },
      },
    }
  );

  if (!isInOrganisation) {
    throw new Error(
      'Unable to add vehicle. You are not a member of this organisation'
    );
  }
};

export default checkIsLoggedInAndInOrg;
