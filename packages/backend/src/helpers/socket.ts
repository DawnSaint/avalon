import type { ServerSocket } from '@avalon/types';

// Disabled: Complex TypeScript types issue with socket.io wrapper
// For miniprogram-only deployment, error handling is done at handler level
export const handleSocketErrors = (socket: ServerSocket) => {
  // Do nothing - errors will be handled in individual handlers
  return;
};
