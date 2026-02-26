import * as migration_20260226_140500 from './20260226_140500';
import * as migration_20260226_133500 from './20260226_133500';

export const migrations = [
  {
    up: migration_20260226_133500.up,
    down: migration_20260226_133500.down,
    name: '20260226_133500'
  },
  {
    up: migration_20260226_140500.up,
    down: migration_20260226_140500.down,
    name: '20260226_140500',
  },
];
