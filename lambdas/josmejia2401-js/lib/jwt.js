const { sign, decode, verify } = require("jsonwebtoken");
const constants = require('./constants');

class JWT {

    static decodeToken(token) {
        const newToken = JWT.getOnlyToken(token);
        const dec = decode(newToken, {
            json: true
        });
        delete dec?.username;
        return dec;
    }

    static isValidToken(token) {
        try {
            const newToken = JWT.getOnlyToken(token);
            JWT.validateToken(newToken);
            return true;
        } catch (_err) {
            return false;
        }
    }

    static parseJwt(token) {
        token = JWT.getOnlyToken(token);
        return JSON.parse(atob(token.split('.')[1]));
    };

    static getOnlyToken(token) {
        return String(token).replace("Bearer ", "").replace("bearer ", "");
    }





    static refreshToken(token) {
        const newToken = JWT.getOnlyToken(token);
        const decodedPayload = verify(newToken, constants.constants.JWT.SECRET_VALUE, {
            audience: constants.constants.APP_NAME,
            algorithms: ['HS256'],
        });
        const value = {
            username: decodedPayload.username,
            password: decodedPayload.password,
        };
        return this.sign(value);
    }

    static sign(value) {
        const options = {
            expiresIn: constants.constants.JWT.TOKEN_LIFE,
            algorithm: 'HS256',
            audience: constants.constants.APP_NAME,
            subject: value.username,
            jwtid: value.tokenId,
            issuer: value.name,
        };
        console.log("signing with data", options);
        const accessToken = sign({ username: value.username, keyid: value.id }, constants.constants.JWT.SECRET_VALUE, options);
        return accessToken;
    }

    static validateToken(token) {
        const newToken = JWT.getOnlyToken(token);
        verify(newToken, constants.constants.JWT.SECRET_VALUE, {
            audience: constants.constants.APP_NAME,
            algorithms: ['HS256'],
        });
    }
}

module.exports = {
    JWT
};
//exports.JWT = JWT;