import { and, rule, shield } from 'graphql-shield';
import { Context } from './context';
import { getUserId } from './utilities/getUserId';

const rules = {
  isAuthenticatedUser: rule()((_, __, context: Context) => {
    const userId = getUserId(context);
    return Boolean(userId);
  }),
  // isAdmin: rule()(async (_, __, context: Context) => {
  //   const userId = getUserId(context);
  //   const user = await context.prisma.user.findUnique({
  //     where: {
  //       id: String(userId),
  //     },
  //   });

  //   return user?.role === 'ADMIN';
  // }),
};

const permissions = shield(
  {
    Query: {
      vehicle: rules.isAuthenticatedUser,
      vehicles: rules.isAuthenticatedUser,
      defectsForVehicle: rules.isAuthenticatedUser,
      upcomingCVRT: rules.isAuthenticatedUser,
      upcomingThirteenWeek: rules.isAuthenticatedUser,
      upcomingTachoCalibration: rules.isAuthenticatedUser,
      tollTags: rules.isAuthenticatedUser,
      tollTagsNotAssigned: rules.isAuthenticatedUser,
      fuelCards: rules.isAuthenticatedUser,
      fuelCardsNotAssigned: rules.isAuthenticatedUser,
      depots: rules.isAuthenticatedUser,
      vehiclesInDepot: rules.isAuthenticatedUser,
      usersOrganisations: rules.isAuthenticatedUser,
      user: rules.isAuthenticatedUser,
      me: rules.isAuthenticatedUser,
      infringements: rules.isAuthenticatedUser,
      usersInOrganisation: rules.isAuthenticatedUser,
      driversInOrganisation: rules.isAuthenticatedUser,
      usersOrganisationInvites: rules.isAuthenticatedUser,
    },
    Mutation: {
      addVehicle: rules.isAuthenticatedUser,
      updateVehicle: rules.isAuthenticatedUser,
      deleteVehicle: rules.isAuthenticatedUser,
      updateVehicleCVRT: rules.isAuthenticatedUser,
      updateVehicleThirteenWeekInspection: rules.isAuthenticatedUser,
      updateVehicleTachoCalibration: rules.isAuthenticatedUser,
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
      updateDefect: rules.isAuthenticatedUser,
      deleteDefect: rules.isAuthenticatedUser,
      addOrganisation: rules.isAuthenticatedUser,
      addInfringement: rules.isAuthenticatedUser,
      updateInfringement: rules.isAuthenticatedUser,
      deleteInfringement: rules.isAuthenticatedUser,
      updateInfringementStatus: rules.isAuthenticatedUser,
      updateUserOrgDetails: rules.isAuthenticatedUser,
      inviteUserToOrganisation: rules.isAuthenticatedUser,
      removeUserFromOrganisation: rules.isAuthenticatedUser,
      acceptInvite: rules.isAuthenticatedUser,
      declineInvite: rules.isAuthenticatedUser,
    },
  },
  { allowExternalErrors: true }
);

export default permissions;
