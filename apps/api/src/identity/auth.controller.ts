import { Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ApiErrorSchema,
  EmailVerificationRequestSchema,
  SignInRequestSchema,
  SignUpRequestSchema,
  type EmailVerificationRequest,
  type SignInRequest,
  type SignUpRequest,
} from '@omniva/schemas';
import type { Request, Response } from 'express';
import { ApiZodResponse } from '../platform/http/api-zod-response.js';
import { ApiZodBody, ZodBody } from '../platform/http/zod-body.js';
import { Authentication, type SessionCookies } from './authentication.js';
import { Public } from './public.decorator.js';
import { requestHeaders } from './signed-in-request.js';

/** Signing up, verifying an email address, signing in and out. */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authentication: Authentication) {}

  @Public()
  @Post('sign-up')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ operationId: 'signUp', summary: 'Sign up with an email address and password' })
  @ApiZodBody(SignUpRequestSchema)
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'A verification link is on its way, whether or not the address was new',
  })
  @ApiZodResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input',
    schema: ApiErrorSchema,
  })
  async signUp(
    @ZodBody(SignUpRequestSchema) body: SignUpRequest,
    @Req() request: Request,
  ): Promise<void> {
    await this.authentication.signUp(body, requestHeaders(request));
  }

  @Public()
  @Post('email-verification')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'verifyEmail',
    summary: 'Confirm an email address with the emailed token, and sign in',
  })
  @ApiZodBody(EmailVerificationRequestSchema)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Verified and signed in' })
  @ApiZodResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'The token is invalid or expired',
    schema: ApiErrorSchema,
  })
  async verifyEmail(
    @ZodBody(EmailVerificationRequestSchema) { token }: EmailVerificationRequest,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    passOn(await this.authentication.verifyEmail(token, requestHeaders(request)), response);
  }

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ operationId: 'signIn', summary: 'Sign in with email address and password' })
  @ApiZodBody(SignInRequestSchema)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Signed in' })
  @ApiZodResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The email address or password is not right',
    schema: ApiErrorSchema,
  })
  @ApiZodResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'The email address is not verified yet; a new link has been sent',
    schema: ApiErrorSchema,
  })
  async signIn(
    @ZodBody(SignInRequestSchema) body: SignInRequest,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    passOn(await this.authentication.signIn(body, requestHeaders(request)), response);
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ operationId: 'signOut', summary: 'End the current session' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Signed out' })
  async signOut(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    passOn(await this.authentication.signOut(requestHeaders(request)), response);
  }
}

function passOn(cookies: SessionCookies, response: Response): void {
  if (cookies.length > 0) response.append('Set-Cookie', [...cookies]);
}
