const APP_NAME = `${process.env.APP_NAME || 'celeste'}`;
const ENVIRONMENT = `${process.env.ENVIRONMENT || 'dev'}`;
const CONSTANTS = {
    ENVIRONMENT: ENVIRONMENT,
    LOGGER_LEVEL: `${process.env.LOGGER_LEVEL || "INFO"}`,
    REGION: `${process.env.REGION || 'us-east-1'}`,
    APP_NAME: APP_NAME,
    JWT: {
        SECRET_VALUE: `${process.env.JTW_SECRET_VALUE || 'secret'}`,
        TOKEN_LIFE: `${process.env.JWT_TOKEN_LIFE || '365d'}`,
    },
    TABLES: {
        users: `tbl-${APP_NAME}-users-${ENVIRONMENT}`,
        token: `tbl-${APP_NAME}-token-${ENVIRONMENT}`,
        customers: `tbl-${APP_NAME}-customers-${ENVIRONMENT}`,
        transactionHistory: `tbl-${APP_NAME}-transaction-history-${ENVIRONMENT}`,
        employees: `tbl-${APP_NAME}-employees-${ENVIRONMENT}`,
        suppliers: `tbl-${APP_NAME}-suppliers-${ENVIRONMENT}`,
        inventories: `tbl-${APP_NAME}-inventories-${ENVIRONMENT}`,
    }
};
exports.constants = Object.freeze(CONSTANTS);
exports.CONSTANTS = Object.freeze(CONSTANTS);