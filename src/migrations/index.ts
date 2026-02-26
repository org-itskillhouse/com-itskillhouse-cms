import * as migration_20260226_211559 from './20260226_211559';

export const migrations = [
  {
    up: migration_20260226_211559.up,
    down: migration_20260226_211559.down,
    name: '20260226_211559'
  },
];
