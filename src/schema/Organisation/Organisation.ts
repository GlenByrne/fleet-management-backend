import { objectType } from 'nexus';
import { Context } from 'src/context';
import { Depot } from '@/schema/Depot/Depot';
import { FuelCard } from '@/schema/FuelCard/FuelCard';
import { TollTag } from '@/schema/TollTag/TollTag';
import { UsersOnOrganisations } from '@/schema/UsersOnOrganisations/UsersOnOrganisations';
import { Vehicle } from '@/schema/Vehicle/Vehicle';

export const Organisation = objectType({
  name: 'Organisation',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.nonNull.list.nonNull.field('users', {
      type: UsersOnOrganisations,
      resolve(parent, _, context: Context) {
        return context.prisma.organisation
          .findUnique({
            where: { id: parent.id },
          })
          .users();
      },
    });
    t.nonNull.list.nonNull.field('vehicles', {
      type: Vehicle,
      resolve(parent, _, context: Context) {
        return context.prisma.organisation
          .findUnique({
            where: { id: parent.id },
          })
          .vehicles();
      },
    });
    t.nonNull.list.nonNull.field('depots', {
      type: Depot,
      resolve(parent, _, context: Context) {
        return context.prisma.organisation
          .findUnique({
            where: { id: parent.id },
          })
          .depots();
      },
    });
    t.nonNull.list.nonNull.field('fuelCards', {
      type: FuelCard,
      resolve(parent, _, context: Context) {
        return context.prisma.organisation
          .findUnique({
            where: { id: parent.id },
          })
          .fuelCards();
      },
    });
    t.nonNull.list.nonNull.field('tollTags', {
      type: TollTag,
      resolve(parent, _, context: Context) {
        return context.prisma.organisation
          .findUnique({
            where: { id: parent.id },
          })
          .tollTags();
      },
    });
  },
});
