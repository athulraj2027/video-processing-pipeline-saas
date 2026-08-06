import { Router } from 'express';
import { authenticate } from '@saas-vod/auth-middleware';
import { getHealth } from '../controllers/health.controller.js';
import {
    signup,
    login,
    refresh,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendOtp
} from '../controllers/auth.controller.js';
import { getMe } from '../controllers/user.controller.js';
import { validateBody } from '../middlewares/middleware.js';
import {
    signupSchema,
    loginSchema,
    refreshSchema,
    logoutSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    resendOtpSchema
} from '../schemas/auth.schema.js';

const router = Router();

router.get('/health', getHealth);
router.post('/signup', validateBody(signupSchema), signup);
router.post('/verify-email', validateBody(verifyEmailSchema), verifyEmail);
router.post("/resend-otp", validateBody(resendOtpSchema), resendOtp)
router.post('/login', validateBody(loginSchema), login);
router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);
router.post('/refresh', validateBody(refreshSchema), refresh);
router.post('/logout', validateBody(logoutSchema), logout);
router.get('/me', authenticate, getMe);

export default router;
