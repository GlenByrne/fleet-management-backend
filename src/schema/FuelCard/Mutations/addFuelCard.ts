import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { FuelCard } from '@/schema/schemaExports';

export const AddFuelCardInput = inputObjectType({
  name: 'AddFuelCardInput',
  definition(t) {
    t.nonNull.string('cardNumber');
    t.nonNull.string('cardProvider');
    t.nonNull.string('organisationId');
  },
});

export const addFuelCard = mutationField('addFuelCard', {
  type: nonNull(FuelCard),
  args: {
    data: nonNull(
      arg({
        type: AddFuelCardInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const userId = verifyAccessToken(context);

    if (!userId) {
      throw new Error('Unable to add fuel card. You are not logged in.');
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
        'Unable to add fuel card. You are not a member of this organisation'
      );
    }

    const existingCard = await context.prisma.fuelCard.findUnique({
      where: {
        cardNumber: args.data.cardNumber,
      },
    });

    if (existingCard) {
      throw new Error('Card already exists with this registration');
    }

    const newCard = await context.prisma.fuelCard.create({
      data: {
        cardNumber: args.data.cardNumber,
        cardProvider: args.data.cardProvider,
        organisation: {
          connect: {
            id: args.data.organisationId,
          },
        },
      },
    });

    context.pubSub.publish('FUEL_CARD_ADDED', newCard);

    return newCard;
  },
});
