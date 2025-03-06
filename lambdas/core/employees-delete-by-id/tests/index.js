const { handler } = require('../index');
async function test() {
    const event = {
        headers: {
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lMyIsImtleWlkIjoiMzgzMjE5MjIzMiIsImlhdCI6MTcyMTc1NDI1NCwiZXhwIjoxNzUzMjkwMjU0LCJhdWQiOiJhcHBtYSIsImlzcyI6ImZpcnN0TmFtZSIsInN1YiI6InVzZXJuYW1lMyIsImp0aSI6IjU2Njk0MWQ5LWUzMTYtNGYzZS1iZmU4LTQ5MzQxNGZmOTFiOCJ9.HkWOOh3tt_rHDK4NOffp67e2Ilu3wm1t3pKdbXyLbu0"
        },
        pathParameters: {
            id: '3832192232'
        }
    };
    const context = {
        awsRequestId: "1"
    };
    const result = await handler(event, context);
    console.log(">>>", result);
}
test();