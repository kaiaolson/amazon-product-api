"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("@mcrowe/result");
function parse(data) {
    try {
        if (isError(data)) {
            const msg = parseError(data).code;
            const error = normalizeAmazonError(msg);
            return result_1.Result.Error(error);
        }
        const cart = getCart(data);
        const inventory = getInventory(cart);
        return result_1.Result.OK({ inventory });
    }
    catch (e) {
        console.error('parse_error ' + e);
        return result_1.Result.Error('parse_error');
    }
}
exports.parse = parse;
function isError(data) {
    return data.CartCreateErrorResponse;
}
function getCart(data) {
    return data.CartCreateResponse.Cart;
}
function getInventory(data) {
    const q = data.CartItems.CartItem.Quantity;
    return q && parseInt(q);
}
function parseError(data) {
    const error = data.CartCreateErrorResponse.Error;
    return {
        code: error.Code,
        message: error.Message
    };
}
function normalizeAmazonError(msg) {
    switch (msg) {
        case 'AWS.InvalidAssociate':
            return 'invalid_associate';
        case 'InvalidClientTokenId':
        case 'SignatureDoesNotMatch':
            return 'invalid_key';
        case 'RequestThrottled':
            return 'aws_throttle';
        case 'AWS.ECommerceService.InvalidQuantity':
        case 'AWS.ECommerceService.CartInfoMismatch':
            return 'cart_error';
        case 'AWS.InternalError':
            return 'aws_server_error';
        default:
            throw new Error('Unexpected amazon error: ' + msg);
    }
}
