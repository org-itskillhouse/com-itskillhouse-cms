import * as migration_20260226_133500 from './20260226_133500';
import * as migration_20260226_140500 from './20260226_140500';
import * as migration_20260226_141900 from './20260226_141900';
import * as migration_20260226_152427_remove_intro_from_selected_globals from './20260226_152427_remove_intro_from_selected_globals';
import * as migration_20260226_160000 from './20260226_160000';
import * as migration_20260226_222525_reset_mcp_api_keys from './20260226_222525_reset_mcp_api_keys';
import * as migration_20260226_222928_fix_mcp_enable_api_key_column from './20260226_222928_fix_mcp_enable_api_key_column';
import * as migration_20260226_223912_remove_home_page_unused_fields from './20260226_223912_remove_home_page_unused_fields';

export const migrations = [
  {
    up: migration_20260226_133500.up,
    down: migration_20260226_133500.down,
    name: '20260226_133500',
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
    up: migration_20260226_152427_remove_intro_from_selected_globals.up,
    down: migration_20260226_152427_remove_intro_from_selected_globals.down,
    name: '20260226_152427_remove_intro_from_selected_globals',
  },
  {
    up: migration_20260226_160000.up,
    down: migration_20260226_160000.down,
    name: '20260226_160000'
  },
  {
    up: migration_20260226_222525_reset_mcp_api_keys.up,
    down: migration_20260226_222525_reset_mcp_api_keys.down,
    name: '20260226_222525_reset_mcp_api_keys',
  },
  {
    up: migration_20260226_222928_fix_mcp_enable_api_key_column.up,
    down: migration_20260226_222928_fix_mcp_enable_api_key_column.down,
    name: '20260226_222928_fix_mcp_enable_api_key_column',
  },
  {
    up: migration_20260226_223912_remove_home_page_unused_fields.up,
    down: migration_20260226_223912_remove_home_page_unused_fields.down,
    name: '20260226_223912_remove_home_page_unused_fields',
  },
];
