exports.successResponse = function (payload) {
    return {
        statusCode: 200,
        isBase64Encoded: false,
        headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            code: 200,
            message: "Successful operation",
            ...payload
        }),
    };
}