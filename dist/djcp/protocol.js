"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isResponse = exports.isRequest = void 0;
function isRequest(command, request) {
    return request.command === command;
}
exports.isRequest = isRequest;
function isResponse(command, response) {
    return response.command === command;
}
exports.isResponse = isResponse;
//# sourceMappingURL=protocol.js.map