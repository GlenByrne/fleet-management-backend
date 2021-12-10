import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { Organisation } from '@/schema/schemaExports';

export const AddOrganisationInput = inputObjectType({
  name: 'AddOrganisationInput',
  definition(t) {
    t.nonNull.string('name');
  },
});

export const addOrganisation = mutationField('addOrganisation', {
  type: nonNull(Organisation),
  args: {
    data: nonNull(
      arg({
        type: AddOrganisationInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const userId = verifyAccessToken(context);

    if (!userId) {
      throw new Error('Unable to retrieve users. You are not logged in.');
    }

    return context.prisma.organisation.create({
      data: {
        name: args.data.name,
        users: {
          create: [
            {
              user: {
                connect: {
                  id: userId,
                },
              },
              role: 'OWNER',
              inviteAccepted: true,
            },
          ],
        },
      },
    });
  },
});
