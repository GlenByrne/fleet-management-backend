import { subscriptionField } from 'nexus';
import { Context } from 'src/context';
import { FuelCard } from '../FuelCard';

const FuelCardAdded = subscriptionField('fuelCardAdded', {
  type: FuelCard,
  resolve: (payload) => payload,
  subscribe: (_, __, context: Context) =>
    context.pubSub.asyncIterator('FUEL_CARD_ADDED'),
});

export default FuelCardAdded;
