/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { Context } from "./../src/context"
import type { core } from "nexus"
declare global {
  interface NexusGenCustomInputMethods<TypeName extends string> {
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    date<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "DateTime";
  }
}
declare global {
  interface NexusGenCustomOutputMethods<TypeName extends string> {
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    date<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "DateTime";
  }
}


declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  AddDefectInput: { // input type
    dateReported: NexusGenScalars['DateTime']; // DateTime!
    description: string; // String!
    status?: string | null; // String
    vehicleId: string; // ID!
  }
  AddDepotInput: { // input type
    name: string; // String!
  }
  AddFuelCardInput: { // input type
    cardNumber: string; // String!
    cardProvider: string; // String!
    depotId?: string | null; // String
  }
  AddTollTagInput: { // input type
    depotId?: string | null; // String
    tagNumber: string; // String!
    tagProvider: string; // String!
  }
  AddVehicleInput: { // input type
    cvrtDueDate?: NexusGenScalars['DateTime'] | null; // DateTime
    depotId?: string | null; // String
    fuelCardId?: string | null; // String
    make: string; // String!
    model: string; // String!
    owner: string; // String!
    registration: string; // String!
    tachoCalibrationDueDate?: NexusGenScalars['DateTime'] | null; // DateTime
    thirteenWeekInspectionDueDate?: NexusGenScalars['DateTime'] | null; // DateTime
    tollTagId?: string | null; // String
    type: NexusGenEnums['VehicleType']; // VehicleType!
  }
  DeleteDepotInput: { // input type
    id: string; // ID!
  }
  DeleteFuelCardInput: { // input type
    id: string; // ID!
  }
  DeleteTollTagInput: { // input type
    id: string; // ID!
  }
  DeleteVehicleInput: { // input type
    id: string; // ID!
  }
  LoginInput: { // input type
    email: string; // String!
    password: string; // String!
  }
  RegisterInput: { // input type
    email: string; // String!
    password: string; // String!
  }
  UpdateDepotInput: { // input type
    id: string; // ID!
    name: string; // String!
  }
  UpdateFuelCardInput: { // input type
    cardNumber: string; // String!
    cardProvider: string; // String!
    depotId?: string | null; // String
    id: string; // ID!
  }
  UpdateTollTagInput: { // input type
    depotId?: string | null; // String
    id: string; // ID!
    tagNumber: string; // String!
    tagProvider: string; // String!
  }
  UpdateVehicleInput: { // input type
    cvrtDueDate?: NexusGenScalars['DateTime'] | null; // DateTime
    depotId?: string | null; // String
    fuelCardId?: string | null; // String
    id: string; // String!
    make: string; // String!
    model: string; // String!
    owner: string; // String!
    registration: string; // String!
    tachoCalibrationDueDate?: NexusGenScalars['DateTime'] | null; // DateTime
    thirteenWeekInspectionDueDate?: NexusGenScalars['DateTime'] | null; // DateTime
    tollTagId?: string | null; // String
    type: NexusGenEnums['VehicleType']; // VehicleType!
  }
}

export interface NexusGenEnums {
  Role: "ADMIN" | "USER"
  VehicleType: "TRAILER" | "TRUCK" | "VAN"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
  DateTime: any
}

export interface NexusGenObjects {
  Defect: { // root type
    dateCompleted?: NexusGenScalars['DateTime'] | null; // DateTime
    dateReported: NexusGenScalars['DateTime']; // DateTime!
    description: string; // String!
    id: string; // ID!
    status?: string | null; // String
  }
  Depot: { // root type
    id: string; // ID!
    name: string; // String!
  }
  FuelCard: { // root type
    cardNumber: string; // String!
    cardProvider: string; // String!
    id: string; // ID!
  }
  Mutation: {};
  Query: {};
  TollTag: { // root type
    id: string; // ID!
    tagNumber: string; // String!
    tagProvider: string; // String!
  }
  User: { // root type
    email: string; // String!
    id: string; // ID!
    name: string; // String!
    password: string; // String!
    role: NexusGenEnums['Role']; // Role!
  }
  UserLoginPayload: { // root type
    token?: string | null; // String
    user?: NexusGenRootTypes['User'] | null; // User
  }
  UserRegisterPayload: { // root type
    token?: string | null; // String
    user?: NexusGenRootTypes['User'] | null; // User
  }
  Vehicle: { // root type
    cvrtDueDate?: NexusGenScalars['DateTime'] | null; // DateTime
    id: string; // ID!
    make: string; // String!
    model: string; // String!
    owner: string; // String!
    registration: string; // String!
    tachoCalibrationDueDate?: NexusGenScalars['DateTime'] | null; // DateTime
    thirteenWeekInspectionDueDate?: NexusGenScalars['DateTime'] | null; // DateTime
    type: NexusGenEnums['VehicleType']; // VehicleType!
  }
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  Defect: { // field return type
    dateCompleted: NexusGenScalars['DateTime'] | null; // DateTime
    dateReported: NexusGenScalars['DateTime']; // DateTime!
    description: string; // String!
    id: string; // ID!
    status: string | null; // String
  }
  Depot: { // field return type
    fuelCards: Array<NexusGenRootTypes['FuelCard'] | null>; // [FuelCard]!
    id: string; // ID!
    name: string; // String!
    tollTags: Array<NexusGenRootTypes['TollTag'] | null>; // [TollTag]!
    vehicles: Array<NexusGenRootTypes['Vehicle'] | null>; // [Vehicle]!
  }
  FuelCard: { // field return type
    cardNumber: string; // String!
    cardProvider: string; // String!
    depot: NexusGenRootTypes['Depot'] | null; // Depot
    id: string; // ID!
    vehicle: NexusGenRootTypes['Vehicle'] | null; // Vehicle
  }
  Mutation: { // field return type
    addDefect: NexusGenRootTypes['Defect']; // Defect!
    addDepot: NexusGenRootTypes['Depot']; // Depot!
    addFuelCard: NexusGenRootTypes['FuelCard']; // FuelCard!
    addTollTag: NexusGenRootTypes['TollTag']; // TollTag!
    addVehicle: NexusGenRootTypes['Vehicle']; // Vehicle!
    deleteDepot: NexusGenRootTypes['Depot']; // Depot!
    deleteFuelCard: NexusGenRootTypes['FuelCard']; // FuelCard!
    deleteTollTag: NexusGenRootTypes['TollTag']; // TollTag!
    deleteVehicle: NexusGenRootTypes['Vehicle']; // Vehicle!
    login: NexusGenRootTypes['UserLoginPayload']; // UserLoginPayload!
    register: NexusGenRootTypes['UserRegisterPayload']; // UserRegisterPayload!
    updateDepot: NexusGenRootTypes['Depot']; // Depot!
    updateFuelCard: NexusGenRootTypes['FuelCard']; // FuelCard!
    updateTollTag: NexusGenRootTypes['TollTag']; // TollTag!
    updateVehicle: NexusGenRootTypes['Vehicle']; // Vehicle!
  }
  Query: { // field return type
    defectsForVehicle: Array<NexusGenRootTypes['Defect'] | null> | null; // [Defect]
    depots: Array<NexusGenRootTypes['Depot'] | null> | null; // [Depot]
    fuelCards: Array<NexusGenRootTypes['FuelCard'] | null> | null; // [FuelCard]
    fuelCardsNotAssigned: Array<NexusGenRootTypes['FuelCard'] | null> | null; // [FuelCard]
    tollTags: Array<NexusGenRootTypes['TollTag'] | null> | null; // [TollTag]
    tollTagsNotAssigned: Array<NexusGenRootTypes['TollTag'] | null> | null; // [TollTag]
    vehicle: NexusGenRootTypes['Vehicle'] | null; // Vehicle
    vehicles: Array<NexusGenRootTypes['Vehicle'] | null> | null; // [Vehicle]
    vehiclesInDepot: Array<NexusGenRootTypes['Vehicle'] | null> | null; // [Vehicle]
  }
  TollTag: { // field return type
    depot: NexusGenRootTypes['Depot'] | null; // Depot
    id: string; // ID!
    tagNumber: string; // String!
    tagProvider: string; // String!
    vehicle: NexusGenRootTypes['Vehicle'] | null; // Vehicle
  }
  User: { // field return type
    depot: NexusGenRootTypes['Depot'] | null; // Depot
    email: string; // String!
    id: string; // ID!
    name: string; // String!
    password: string; // String!
    role: NexusGenEnums['Role']; // Role!
  }
  UserLoginPayload: { // field return type
    token: string | null; // String
    user: NexusGenRootTypes['User'] | null; // User
  }
  UserRegisterPayload: { // field return type
    token: string | null; // String
    user: NexusGenRootTypes['User'] | null; // User
  }
  Vehicle: { // field return type
    cvrtDueDate: NexusGenScalars['DateTime'] | null; // DateTime
    defects: Array<NexusGenRootTypes['Defect'] | null>; // [Defect]!
    depot: NexusGenRootTypes['Depot'] | null; // Depot
    fuelCard: NexusGenRootTypes['FuelCard'] | null; // FuelCard
    id: string; // ID!
    make: string; // String!
    model: string; // String!
    owner: string; // String!
    registration: string; // String!
    tachoCalibrationDueDate: NexusGenScalars['DateTime'] | null; // DateTime
    thirteenWeekInspectionDueDate: NexusGenScalars['DateTime'] | null; // DateTime
    tollTag: NexusGenRootTypes['TollTag'] | null; // TollTag
    type: NexusGenEnums['VehicleType']; // VehicleType!
  }
}

export interface NexusGenFieldTypeNames {
  Defect: { // field return type name
    dateCompleted: 'DateTime'
    dateReported: 'DateTime'
    description: 'String'
    id: 'ID'
    status: 'String'
  }
  Depot: { // field return type name
    fuelCards: 'FuelCard'
    id: 'ID'
    name: 'String'
    tollTags: 'TollTag'
    vehicles: 'Vehicle'
  }
  FuelCard: { // field return type name
    cardNumber: 'String'
    cardProvider: 'String'
    depot: 'Depot'
    id: 'ID'
    vehicle: 'Vehicle'
  }
  Mutation: { // field return type name
    addDefect: 'Defect'
    addDepot: 'Depot'
    addFuelCard: 'FuelCard'
    addTollTag: 'TollTag'
    addVehicle: 'Vehicle'
    deleteDepot: 'Depot'
    deleteFuelCard: 'FuelCard'
    deleteTollTag: 'TollTag'
    deleteVehicle: 'Vehicle'
    login: 'UserLoginPayload'
    register: 'UserRegisterPayload'
    updateDepot: 'Depot'
    updateFuelCard: 'FuelCard'
    updateTollTag: 'TollTag'
    updateVehicle: 'Vehicle'
  }
  Query: { // field return type name
    defectsForVehicle: 'Defect'
    depots: 'Depot'
    fuelCards: 'FuelCard'
    fuelCardsNotAssigned: 'FuelCard'
    tollTags: 'TollTag'
    tollTagsNotAssigned: 'TollTag'
    vehicle: 'Vehicle'
    vehicles: 'Vehicle'
    vehiclesInDepot: 'Vehicle'
  }
  TollTag: { // field return type name
    depot: 'Depot'
    id: 'ID'
    tagNumber: 'String'
    tagProvider: 'String'
    vehicle: 'Vehicle'
  }
  User: { // field return type name
    depot: 'Depot'
    email: 'String'
    id: 'ID'
    name: 'String'
    password: 'String'
    role: 'Role'
  }
  UserLoginPayload: { // field return type name
    token: 'String'
    user: 'User'
  }
  UserRegisterPayload: { // field return type name
    token: 'String'
    user: 'User'
  }
  Vehicle: { // field return type name
    cvrtDueDate: 'DateTime'
    defects: 'Defect'
    depot: 'Depot'
    fuelCard: 'FuelCard'
    id: 'ID'
    make: 'String'
    model: 'String'
    owner: 'String'
    registration: 'String'
    tachoCalibrationDueDate: 'DateTime'
    thirteenWeekInspectionDueDate: 'DateTime'
    tollTag: 'TollTag'
    type: 'VehicleType'
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    addDefect: { // args
      data: NexusGenInputs['AddDefectInput']; // AddDefectInput!
    }
    addDepot: { // args
      data: NexusGenInputs['AddDepotInput']; // AddDepotInput!
    }
    addFuelCard: { // args
      data: NexusGenInputs['AddFuelCardInput']; // AddFuelCardInput!
    }
    addTollTag: { // args
      data: NexusGenInputs['AddTollTagInput']; // AddTollTagInput!
    }
    addVehicle: { // args
      data: NexusGenInputs['AddVehicleInput']; // AddVehicleInput!
    }
    deleteDepot: { // args
      data: NexusGenInputs['DeleteDepotInput']; // DeleteDepotInput!
    }
    deleteFuelCard: { // args
      data: NexusGenInputs['DeleteFuelCardInput']; // DeleteFuelCardInput!
    }
    deleteTollTag: { // args
      data: NexusGenInputs['DeleteTollTagInput']; // DeleteTollTagInput!
    }
    deleteVehicle: { // args
      data: NexusGenInputs['DeleteVehicleInput']; // DeleteVehicleInput!
    }
    login: { // args
      data: NexusGenInputs['LoginInput']; // LoginInput!
    }
    register: { // args
      data: NexusGenInputs['RegisterInput']; // RegisterInput!
    }
    updateDepot: { // args
      data: NexusGenInputs['UpdateDepotInput']; // UpdateDepotInput!
    }
    updateFuelCard: { // args
      data: NexusGenInputs['UpdateFuelCardInput']; // UpdateFuelCardInput!
    }
    updateTollTag: { // args
      data: NexusGenInputs['UpdateTollTagInput']; // UpdateTollTagInput!
    }
    updateVehicle: { // args
      data: NexusGenInputs['UpdateVehicleInput']; // UpdateVehicleInput!
    }
  }
  Query: {
    defectsForVehicle: { // args
      vehicleId: string; // ID!
    }
    vehicle: { // args
      vehicleId: string; // ID!
    }
    vehiclesInDepot: { // args
      depotId: string; // ID!
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = keyof NexusGenEnums;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: Context;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}