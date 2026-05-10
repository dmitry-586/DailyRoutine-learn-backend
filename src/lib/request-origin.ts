import type { Request } from 'express';

function getRequestOrigin(request: Request): string {
  const forwardedProto = request.get('x-forwarded-proto');
  const protocol = forwardedProto?.split(',')[0]?.trim() || request.protocol;

  return `${protocol}://${request.get('host')}`;
}

export { getRequestOrigin };
