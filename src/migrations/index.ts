import * as migration_20260226_140500 from './20260226_140500';
import * as migration_20260226_141900 from './20260226_141900';
import * as migration_20260226_133500 from './20260226_133500';
import * as migration_20260226_160000 from './20260226_160000';

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
  {
    up: migration_20260226_141900.up,
    down: migration_20260226_141900.down,
    name: '20260226_141900',
  },
  {
    up: migration_20260226_160000.up,
    down: migration_20260226_160000.down,
    name: '20260226_160000',
  },
];
