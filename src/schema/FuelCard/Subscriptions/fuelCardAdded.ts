import { subscriptionField } from 'nexus';
import { Context, PubSubChannels } from 'src/context';
import { FuelCard } from '../FuelCard';

// export const FuelCardAdded = subscriptionField('fuelCardAdded', {
//   type: FuelCard,
//   subscribe: (_, __, context: Context) => context.pubsSub.asyncIterator('fuelCardAdded'),
//   resolve: (payload: PubSubChannels['fuelCardAdded'][0]) => payload.createdCard,
// });
