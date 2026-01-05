declare module "mysql2/promise" {
  // Minimal types to satisfy the compiler in the dev environment.
  export function createPool(config: any): {
    query: (sql: string, params?: any[]) => Promise<[any[], any]>;
    end: () => Promise<void>;
  };
  export default { createPool };
}


