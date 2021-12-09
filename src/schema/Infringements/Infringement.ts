import { objectType } from 'nexus';
import { Context } from 'src/context';
import { InfringementStatus } from '@/schema/Enum';
import { User } from '@/schema/User/User';

export const Infringement = objectType({
  name: 'Infringement',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('description');
    t.nonNull.date('dateOccured');
    t.nonNull.field('status', {
      type: InfringementStatus,
    });
    t.field('driver', {
      type: User,
      resolve(parent, _, context: Context) {
        return context.prisma.infringement
          .findUnique({
            where: { id: parent.id },
          })
          .driver();
      },
    });
  },
});
