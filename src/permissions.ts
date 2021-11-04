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
    depots: rules.isAuthenticatedUser,
    vehiclesInDepot: rules.isAuthenticatedUser,
    users: and(rules.isAuthenticatedUser, rules.isAdmin),
  },
  Mutation: {
    addVehicle: rules.isAuthenticatedUser,
    updateVehicle: rules.isAuthenticatedUser,
    deleteVehicle: rules.isAuthenticatedUser,
    addTollTag: rules.isAuthenticatedUser,
    updateTollTag: rules.isAuthenticatedUser,
    deleteTollTag: rules.isAuthenticatedUser,
    addFuelCard: rules.isAuthenticatedUser,
    updateFuelCard: rules.isAuthenticatedUser,
    deleteFuelCard: rules.isAuthenticatedUser,
    addDepot: rules.isAuthenticatedUser,
    updateDepot: rules.isAuthenticatedUser,
    deleteDepot: rules.isAuthenticatedUser,
    addDefect: rules.isAuthenticatedUser,
    addUser: and(rules.isAuthenticatedUser, rules.isAdmin),
    deleteUser: and(rules.isAuthenticatedUser, rules.isAdmin),
  },
});

export default permissions;
