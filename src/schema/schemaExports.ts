import { DateTimeResolver } from 'graphql-scalars';
import { asNexusMethod } from 'nexus';

export * from '@/schema/Defect/Defect';
export * from '@/schema/Defect/Mutations/addDefect';
export * from '@/schema/Defect/Mutations/deleteDefect';
export * from '@/schema/Defect/Mutations/updateDefect';
export * from '@/schema/Defect/Queries/defectsForVehicles';

export * from '@/schema/Depot/Depot';
export * from '@/schema/Depot/Mutations/addDepot';
export * from '@/schema/Depot/Mutations/deleteDepot';
export * from '@/schema/Depot/Mutations/updateDepot';
export * from '@/schema/Depot/Queries/depots';

export * from '@/schema/FuelCard/FuelCard';
export * from '@/schema/FuelCard/Mutations/addFuelCard';
export * from '@/schema/FuelCard/Mutations/deleteFuelCard';
export * from '@/schema/FuelCard/Mutations/updateFuelCard';
export * from '@/schema/FuelCard/Queries/fuelCards';
export * from '@/schema/FuelCard/Queries/fuelCardsNotAssigned';
export * from '@/schema/FuelCard/Subscriptions/fuelCardAdded';

export * from '@/schema/Infringements/Infringement';
export * from '@/schema/Infringements/Mutations/addInfringement';
export * from '@/schema/Infringements/Mutations/deleteInfringement';
export * from '@/schema/Infringements/Mutations/updateInfringement';
export * from '@/schema/Infringements/Mutations/updateInfringementStatus';
export * from '@/schema/Infringements/Queries/infringements';

export * from '@/schema/Organisation/Organisation';
export * from '@/schema/Organisation/Mutations/addOrganisation';
export * from '@/schema/Organisation/Mutations/inviteUserToOrganisation';

export * from '@/schema/TollTag/TollTag';
export * from '@/schema/TollTag/Mutations/addTollTag';
export * from '@/schema/TollTag/Mutations/deleteTollTag';
export * from '@/schema/TollTag/Mutations/updateTollTag';
export * from '@/schema/TollTag/Queries/tollTags';
export * from '@/schema/TollTag/Queries/tollTagsNotAssigned';

export * from '@/schema/User/User';
export * from '@/schema/User/Mutations/activateAccount';
export * from '@/schema/User/Mutations/changePassword';
export * from '@/schema/User/Mutations/forgotPassword';
export * from '@/schema/User/Mutations/login';
export * from '@/schema/User/Mutations/logout';
export * from '@/schema/User/Mutations/refreshToken';
export * from '@/schema/User/Mutations/register';
export * from '@/schema/User/Mutations/resetPassword';
export * from '@/schema/User/Queries/me';
export * from '@/schema/User/Queries/user';

export * from '@/schema/UsersOnOrganisations/UsersOnOrganisations';
export * from '@/schema/UsersOnOrganisations/Mutations/acceptInvite';
export * from '@/schema/UsersOnOrganisations/Mutations/declineInvite';
export * from '@/schema/UsersOnOrganisations/Mutations/removeUserFromOrganisation';
export * from '@/schema/UsersOnOrganisations/Mutations/updateUserOrgDetails';
export * from '@/schema/UsersOnOrganisations/Queries/driversInOrganisation';
export * from '@/schema/UsersOnOrganisations/Queries/usersInOrganisation';
export * from '@/schema/UsersOnOrganisations/Queries/usersOrganisationInvites';
export * from '@/schema/UsersOnOrganisations/Queries/usersOrganisations';

export * from '@/schema/Vehicle/Vehicle';
export * from '@/schema/Vehicle/Mutations/addVehicle';
export * from '@/schema/Vehicle/Mutations/deleteVehicle';
export * from '@/schema/Vehicle/Mutations/updateVehicle';
export * from '@/schema/Vehicle/Mutations/updateVehicleCVRT';
export * from '@/schema/Vehicle/Mutations/updateVehicleTachoCalibration';
export * from '@/schema/Vehicle/Mutations/updateVehicleThirteenWeekInspection';
export * from '@/schema/Vehicle/Queries/defectsForVehicle';
export * from '@/schema/Vehicle/Queries/upcomingCVRT';
export * from '@/schema/Vehicle/Queries/upcomingTachoCalibration';
export * from '@/schema/Vehicle/Queries/upcomingThirteenWeek';
export * from '@/schema/Vehicle/Queries/vehicle';
export * from '@/schema/Vehicle/Queries/vehicles';

export * from '@/schema/Enum';

export const DateTimeScalar = asNexusMethod(DateTimeResolver, 'date');
