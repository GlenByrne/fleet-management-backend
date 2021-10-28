import { rule, shield } from 'graphql-shield';
import { Context } from './context';
import { getUserId } from './utilities/getUserId';

const rules = {
  isAuthenticatedUser: rule()((_, __, context: Context) => {
    const userId = getUserId(context);
    return Boolean(userId);
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
  },
});

export default permissions;
