import { objectType } from 'nexus';
import { Context } from 'src/context';
import { UsersOnOrganisations, Infringement } from '@/schema/schemaExports';

const User = objectType({
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

export default User;
