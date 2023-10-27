"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTValidation = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function JWTValidation(req, res, next) {
    const token = req.headers["authorization"]?.replace('Bearer ', "");
    const privateKey = process.env.JWT_SECRET;
    if (!token) {
        return res.status(401).json({
            message: "Token não encontrado.",
            success: false
        });
    }
    jsonwebtoken_1.default.verify(token, privateKey, (err, payload) => {
        if (err || payload === undefined) {
            return res.status(401).end();
        }
        req.userId = payload.sub;
        return next();
    });
}
exports.JWTValidation = JWTValidation;
