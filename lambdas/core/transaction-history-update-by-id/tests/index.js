const { handler } = require('../index');
async function test() {
    const event = {
        headers: {
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lMyIsImtleWlkIjoiMzgzMjE5MjIzMiIsImlhdCI6MTcyMTc1NDI1NCwiZXhwIjoxNzUzMjkwMjU0LCJhdWQiOiJhcHBtYSIsImlzcyI6ImZpcnN0TmFtZSIsInN1YiI6InVzZXJuYW1lMyIsImp0aSI6IjU2Njk0MWQ5LWUzMTYtNGYzZS1iZmU4LTQ5MzQxNGZmOTFiOCJ9.HkWOOh3tt_rHDK4NOffp67e2Ilu3wm1t3pKdbXyLbu0"
        },
        body: JSON.stringify({ "contactInformation": { "phone": "", "email": "", "address": "" }, "documentTypeId": "CC", "genderId": "M", "lastName": "", "createdAt": "2025-03-13T20:53:44.285Z", "additionalInformation": { "description": "es un cliente nuevo" }, "firstName": "cliente 3", "statusId": "CLOSE", "birthdate": "2025-03-13", "userId": 3871709191, "segmentationAndTags": { "customerTypeId": "CI", "customerTags": [] }, "documentNumber": "12345", "nationalityId": "PE", "preferences": { "favoriteCategories": ["ninguna"], "communicationChannels": ["EM", "TL", "WS", "SMS"] }, "id": 2428521064 }),
        pathParameters: {
            id: 2428521064
        }
    };
    const context = {
        awsRequestId: "1"
    };
    const result = await handler(event, context);
    console.log(">>>", result);
}
test();