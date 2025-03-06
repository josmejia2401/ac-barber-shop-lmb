const { handler } = require('../index');
async function test() {
    const event = {
        body: JSON.stringify({
            username: 'username',
            password: 'password'
        })
    };
    const context = {
        awsRequestId: "1"
    };
    const result = await handler(event, context);
    console.log(">>>", result);
}
test();