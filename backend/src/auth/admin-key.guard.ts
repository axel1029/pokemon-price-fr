import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AdminKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    const incoming =
      (req.headers['x-admin-key'] as string | undefined) ||
      (req.query?.key as string | undefined); // optionnel si tu veux aussi par query

    const expected = process.env.ADMIN_KEY;

    if (!expected) {
      // Si ADMIN_KEY n'est pas défini en prod, on bloque tout
      throw new UnauthorizedException('ADMIN_KEY missing on server');
    }

    if (!incoming || incoming !== expected) {
      throw new UnauthorizedException('Invalid admin key');
    }

    return true;
  }
}
