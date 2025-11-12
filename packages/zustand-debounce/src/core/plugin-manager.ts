import type { Plugin } from '../types';

export class PluginManager {
  private plugins: Plugin[] = [];

  register(plugins: Plugin[]): void {
    for (const plugin of plugins) {
      // Validate plugin has a name
      if (!plugin.name || typeof plugin.name !== 'string') {
        throw new Error('Plugin must have a valid name property');
      }

      this.plugins.push(plugin);
    }
  }

  applyBeforeSetItem(value: string): string {
    let result = value;

    for (const plugin of this.plugins) {
      if (plugin.beforeSetItem) {
        try {
          const transformed = plugin.beforeSetItem(result);
          // If plugin returns a value, use it; otherwise keep the current result
          if (transformed !== undefined) {
            result = transformed;
          }
        } catch (error) {
          // Log error but don't break the chain - resilient by design
          console.error(
            `[zustand-debounce] Plugin "${plugin.name}" beforeSetItem hook failed:`,
            error,
          );
        }
      }
    }

    return result;
  }

  applyAfterGetItem(value: string | null): string | null {
    let result = value;

    for (const plugin of this.plugins) {
      if (plugin.afterGetItem) {
        try {
          const transformed = plugin.afterGetItem(result);
          // If plugin returns a value (including null), use it; otherwise keep current result
          if (transformed !== undefined) {
            result = transformed;
          }
        } catch (error) {
          // Log error but don't break the chain
          console.error(
            `[zustand-debounce] Plugin "${plugin.name}" afterGetItem hook failed:`,
            error,
          );
          // On error reading, return null to indicate failure
          return null;
        }
      }
    }

    return result;
  }

  getPlugins(): Plugin[] {
    return [...this.plugins];
  }
}
