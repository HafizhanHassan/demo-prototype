"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
exports.validateRegister = (options) => {
    if (!options.email.includes("@")) {
        return [{
                field: 'email',
                message: 'Invalid Email',
            },];
    }
    if (options.username.length <= 6) {
        return [
            {
                field: 'username',
                message: 'Username must be greater than 6',
            },
        ];
    }
    if (options.username.includes('@')) {
        return [
            {
                field: 'username',
                message: 'Cannot include @',
            },
        ];
    }
    if (options.password.length <= 6) {
        return [{
                field: 'password',
                message: 'Password must be greater than 6',
            },];
    }
    return null;
};
//# sourceMappingURL=validateRegister.js.map