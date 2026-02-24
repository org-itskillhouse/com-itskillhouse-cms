import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260224_153854 from './20260224_153854';
import * as migration_20260224_175421 from './20260224_175421';
import * as migration_20260224_181301 from './20260224_181301';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260224_153854.up,
    down: migration_20260224_153854.down,
    name: '20260224_153854',
  },
  {
    up: migration_20260224_175421.up,
    down: migration_20260224_175421.down,
    name: '20260224_175421',
  },
  {
    up: migration_20260224_181301.up,
    down: migration_20260224_181301.down,
    name: '20260224_181301'
  },
];
