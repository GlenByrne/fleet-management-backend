import { enumType } from 'nexus';

export const Role = enumType({
  name: 'Role',
  members: {
    Owner: 'OWNER',
    Admin: 'ADMIN',
    User: 'USER',
    Driver: 'DRIVER',
  },
});

export const VehicleType = enumType({
  name: 'VehicleType',
  members: {
    Van: 'VAN',
    Truck: 'TRUCK',
    Trailer: 'TRAILER',
  },
});

export const DefectStatus = enumType({
  name: 'DefectStatus',
  members: {
    Incomplete: 'INCOMPLETE',
    Complete: 'COMPLETE',
  },
});

export const InfringementStatus = enumType({
  name: 'InfringementStatus',
  members: {
    Unsigned: 'UNSIGNED',
    Signed: 'SIGNED',
  },
});
