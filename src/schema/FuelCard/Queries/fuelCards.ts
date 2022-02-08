import {
  inputObjectType,
  queryField,
  nonNull,
  arg,
  list,
  objectType,
} from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { FuelCard } from '@/schema/schemaExports';
import { connectionFromArraySlice, cursorToOffset } from 'graphql-relay';

// export const Edge = objectType({
//   name: 'Edge',
//   definition(t) {
//     t.string('cursor');
//     t.field('node', {
//       type: FuelCard,
//     });
//   },
// });

// export const PageInfo = objectType({
//   name: 'PageInfo',
//   definition(t) {
//     t.string('endCursor');
//     t.boolean('hasNextPage');
//   },
// });

// export const Response = objectType({
//   name: 'Response',
//   definition(t) {
//     t.field('pageInfo', { type: PageInfo });
//     t.list.field('edges', {
//       type: Edge,
//     });
//   },
// });

// export const FuelCardInputFilter = inputObjectType({
//   name: 'FuelCardInputFilter',
//   definition(t) {
//     t.string('searchCriteria');
//     t.nonNull.string('organisationId');
//   },
// });

// export const fuelCards = queryField('fuelCards', {
//   type: list(FuelCard),
//   args: {
//     data: nonNull(
//       arg({
//         type: FuelCardInputFilter,
//       })
//     ),
//   },
//   resolve: async (_, args, context: Context) => {
//     const userId = verifyAccessToken(context);

//     if (!userId) {
//       throw new Error('Unable to retrieve fuel cards. You are not logged in.');
//     }

//     const isInOrganisation =
//       await context.prisma.usersOnOrganisations.findUnique({
//         where: {
//           userId_organisationId: {
//             userId,
//             organisationId: args.data.organisationId,
//           },
//         },
//       });

//     if (!isInOrganisation) {
//       throw new Error(
//         'Unable to retrieve fuel cards. You are not a member of this organisation'
//       );
//     }

//     return context.prisma.fuelCard.findMany({
//       where: {
//         AND: [
//           { organisationId: args.data.organisationId },
//           {
//             cardNumber: {
//               contains:
//                 args.data?.searchCriteria != null
//                   ? args.data.searchCriteria
//                   : undefined,
//               mode: 'insensitive',
//             },
//           },
//         ],
//       },
//       orderBy: {
//         cardNumber: 'asc',
//       },
//     });
//   },
// });

export const FuelCardsInput = inputObjectType({
  name: 'FuelCardsInput',
  definition(t) {
    t.string('searchCriteria');
    t.nonNull.string('organisationId');
  },
});

// export const fuelCards = queryField('fuelCards', {
//   type: Response,
//   args: {
//     data: nonNull(
//       arg({
//         type: FuelCardInputFilter,
//       })
//     ),
//   },
//   resolve: async (_, args, context: Context) => {
//     const userId = verifyAccessToken(context);

//     if (!userId) {
//       throw new Error('Unable to retrieve fuel cards. You are not logged in.');
//     }

//     const isInOrganisation =
//       await context.prisma.usersOnOrganisations.findUnique({
//         where: {
//           userId_organisationId: {
//             userId,
//             organisationId: args.data.organisationId,
//           },
//         },
//       });

//     if (!isInOrganisation) {
//       throw new Error(
//         'Unable to retrieve fuel cards. You are not a member of this organisation'
//       );
//     }

//     let queryResults = null;

//     if (args.data.after) {
//       queryResults = await context.prisma.fuelCard.findMany({
//         take: args.data.first,
//         skip: 1,
//         cursor: {
//           id: args.data.after,
//         },
//         where: {
//           AND: [
//             { organisationId: args.data.organisationId },
//             {
//               cardNumber: {
//                 contains:
//                   args.data?.searchCriteria != null
//                     ? args.data.searchCriteria
//                     : undefined,
//                 mode: 'insensitive',
//               },
//             },
//           ],
//         },
//         orderBy: {
//           cardNumber: 'asc',
//         },
//       });
//     } else {
//       queryResults = await context.prisma.fuelCard.findMany({
//         take: args.data.first,
//         where: {
//           AND: [
//             { organisationId: args.data.organisationId },
//             {
//               cardNumber: {
//                 contains:
//                   args.data?.searchCriteria != null
//                     ? args.data.searchCriteria
//                     : undefined,
//                 mode: 'insensitive',
//               },
//             },
//           ],
//         },
//         orderBy: {
//           cardNumber: 'asc',
//         },
//       });
//     }

//     if (queryResults.length > 0) {
//       // get last element in previous result set
//       const lastLinkInResults = queryResults[queryResults.length - 1];
//       // cursor we'll return in subsequent requests
//       const myCursor = lastLinkInResults.id;

//       // query after the cursor to check if we have nextPage
//       const secondQueryResults = await context.prisma.fuelCard.findMany({
//         take: args.data.first,
//         cursor: {
//           id: myCursor,
//         },
//         where: {
//           AND: [
//             { organisationId: args.data.organisationId },
//             {
//               cardNumber: {
//                 contains:
//                   args.data?.searchCriteria != null
//                     ? args.data.searchCriteria
//                     : undefined,
//                 mode: 'insensitive',
//               },
//             },
//           ],
//         },
//         orderBy: {
//           cardNumber: 'asc',
//         },
//       });
//       // return response
//       const result = {
//         pageInfo: {
//           endCursor: myCursor,
//           hasNextPage: secondQueryResults.length >= args.data.first,
//         },
//         edges: queryResults.map((fuelCard) => ({
//           cursor: fuelCard.id,
//           node: fuelCard,
//         })),
//       };

//       return result;
//     }
//     return {
//       pageInfo: {
//         endCursor: null,
//         hasNextPage: false,
//       },
//       edges: [],
//     };
//   },
// });

export const fuelCards = queryField((t) => {
  t.connectionField('fuelCards', {
    type: FuelCard,
    additionalArgs: {
      data: nonNull(
        arg({
          type: FuelCardsInput,
        })
      ),
    },
    resolve: async (_, args, context: Context) => {
      const userId = verifyAccessToken(context);

      if (!userId) {
        throw new Error(
          'Unable to retrieve fuel cards. You are not logged in.'
        );
      }

      const isInOrganisation =
        await context.prisma.usersOnOrganisations.findUnique({
          where: {
            userId_organisationId: {
              userId,
              organisationId: args.data.organisationId,
            },
          },
        });

      if (!isInOrganisation) {
        throw new Error(
          'Unable to retrieve fuel cards. You are not a member of this organisation'
        );
      }

      const offset = args.after ? cursorToOffset(args.after) + 1 : 0;

      if (Number.isNaN(offset)) {
        throw new Error('Cursor is invalid');
      }

      const [totalCount, items] = await Promise.all([
        context.prisma.fuelCard.count(),
        context.prisma.fuelCard.findMany({
          take: args.first,
          skip: offset,
          where: {
            AND: [
              { organisationId: args.data.organisationId },
              {
                cardNumber: {
                  contains:
                    args.data?.searchCriteria != null
                      ? args.data.searchCriteria
                      : undefined,
                  mode: 'insensitive',
                },
              },
            ],
          },
          orderBy: {
            cardNumber: 'asc',
          },
        }),
      ]);

      return connectionFromArraySlice(
        items,
        { first: args.first, after: args.after },
        { sliceStart: offset, arrayLength: totalCount }
      );
    },
  });
});
