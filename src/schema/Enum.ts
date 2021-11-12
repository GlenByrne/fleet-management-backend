import { enumType } from 'nexus';

export const Role = enumType({
  name: 'Role',
  members: {
    User: 'USER',
    Driver: 'DRIVER',
    Admin: 'ADMIN',
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
