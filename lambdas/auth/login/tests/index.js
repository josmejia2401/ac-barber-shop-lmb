const { handler } = require('../index');
async function test() {
    const event = {
        body: JSON.stringify({
            username: '3105397699',
            password: '1'
        })
    };
    const context = {
        awsRequestId: "1"
    };
    const result = await handler(event, context);
    console.log(">>>", result);
}
test();