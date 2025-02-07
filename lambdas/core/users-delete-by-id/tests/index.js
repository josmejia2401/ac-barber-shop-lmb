const { handler } = require('../index');
async function test() {
    const event = {
        pathParameters: {
            id: "3772832d-6ca0-4659-890e-fd55c3296cda"
        }
    };
    const context = {
        awsRequestId: "1"
    };
    const result = await handler(event, context);
    console.log(">>>", result);
}
test();