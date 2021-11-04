import { and, rule, shield } from 'graphql-shield';
import { Context } from './context';
import { getUserId } from './utilities/getUserId';

const rules = {
  isAuthenticatedUser: rule()((_, __, context: Context) => {
    const userId = getUserId(context);
    return Boolean(userId);
  }),
  isAdmin: rule()(async (_, __, context: Context) => {
    const userId = getUserId(context);
    const user = await context.prisma.user.findUnique({
      where: {
        id: String(userId),
      },
    });

    return user?.role === 'ADMIN';
  }),
};

const permissions = shield({
  Query: {
    vehicle: rules.isAuthenticatedUser,
    vehicles: rules.isAuthenticatedUser,
    defectsForVehicle: rules.isAuthenticatedUser,
    tollTags: rules.isAuthenticatedUser,
    tollTagsNotAssigned: rules.isAuthenticatedUser,
    fuelCards: rules.isAuthenticatedUser,
    fuelCardsNotAssigned: rules.isAuthenticatedUser,
    depots: and(rules.isAuthenticatedUser, rules.isAdmin),
    vehiclesInDepot: rules.isAuthenticatedUser,
    users: and(rules.isAuthenticatedUser, rules.isAdmin),
  },
  Mutation: {
    addVehicle: and(rules.isAuthenticatedUser, rules.isAdmin),
    updateVehicle: and(rules.isAuthenticatedUser, rules.isAdmin),
    deleteVehicle: and(rules.isAuthenticatedUser, rules.isAdmin),
    addTollTag: and(rules.isAuthenticatedUser, rules.isAdmin),
    updateTollTag: and(rules.isAuthenticatedUser, rules.isAdmin),
    deleteTollTag: and(rules.isAuthenticatedUser, rules.isAdmin),
    addFuelCard: and(rules.isAuthenticatedUser, rules.isAdmin),
    updateFuelCard: and(rules.isAuthenticatedUser, rules.isAdmin),
    deleteFuelCard: and(rules.isAuthenticatedUser, rules.isAdmin),
    addDepot: and(rules.isAuthenticatedUser, rules.isAdmin),
    updateDepot: and(rules.isAuthenticatedUser, rules.isAdmin),
    deleteDepot: and(rules.isAuthenticatedUser, rules.isAdmin),
    addDefect: rules.isAuthenticatedUser,
    addUser: and(rules.isAuthenticatedUser, rules.isAdmin),
    deleteUser: and(rules.isAuthenticatedUser, rules.isAdmin),
  },
});

export default permissions;
