export const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
        return "Email address is required";
    }
    if (!emailRegex.test(email)) {
        return "Please enter a valid email address";
    }
    return null;
};

export const validatePassword = (password: string, isLogin = false): string | null => {
    if (!password) {
        return "Password is required";
    }
    if (!isLogin && password.length < 8) {
        return "Password must be at least 8 characters long";
    }
    return null;
};

export const validateName = (name: string): string | null => {
    if (!name.trim()) {
        return "Full name is required";
    }
    return null;
};

export const validateSubdomain = (subdomain: string): string | null => {
    if (!subdomain.trim()) {
        return "Store subdomain is required";
    }
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
        return "Subdomain can only contain lowercase letters, numbers, and hyphens";
    }
    return null;
};

export const validateOtp = (otp: string[]): string | null => {
    const code = otp.join("");
    if (code.length < 6) {
        return "Please enter all 6 digits of the verification code";
    }
    return null;
};

export interface SignupErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    [key: string]: string | undefined;
}

export const validateSignup = (
    email: string,
    password: string,
    confirmPassword: string
): SignupErrors => {
    const errors: SignupErrors = {};
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password, false);

    if (emailErr) errors.email = emailErr;
    if (passwordErr) errors.password = passwordErr;

    if (!confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    }

    return errors;
};

export interface SigninErrors {
    email?: string;
    password?: string;
    [key: string]: string | undefined;
}

export const validateSignin = (email: string, password: string): SigninErrors => {
    const errors: SigninErrors = {};
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password, true);

    if (emailErr) errors.email = emailErr;
    if (passwordErr) errors.password = passwordErr;

    return errors;
};

export interface ForgotPasswordErrors {
    email?: string;
    [key: string]: string | undefined;
}

export const validateForgotPassword = (email: string): ForgotPasswordErrors => {
    const errors: ForgotPasswordErrors = {};
    const emailErr = validateEmail(email);

    if (emailErr) errors.email = emailErr;

    return errors;
};

export const validateVerifyOtp = (otp: string[]): string | null => {
    return validateOtp(otp);
};
