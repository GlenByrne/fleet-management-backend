import { subscriptionField } from 'nexus';
import { Context, PubSubChannels } from 'src/context';
import { FuelCard } from '../FuelCard';

export const FuelCardAdded = subscriptionField('newCard', {
  type: FuelCard,
  subscribe: (_, __, context: Context) =>
    context.pubsSub.asyncIterator('newCard'),
  resolve: (payload: PubSubChannels['newCard'][0]) => payload.createdCard,
});
