import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  @Get('verify')
  @UseGuards(AuthGuard)
  verify(@Req() req: any) {
    return {
      userId: req.userId,
      email: req.email,
      firebaseUid: req.firebaseUid,
    };
  }
}
