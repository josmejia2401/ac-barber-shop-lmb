const { handler } = require('../index');
async function test() {
    const event = {
        "version": "2.0",
        "type": "REQUEST",
        "routeArn": "arn:aws:execute-api:us-east-1:233925838033:u83oit2sq6/dev/GET/api/v1/employees",
        "identitySource": [
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwia2V5aWQiOiIzODcxNzA5MTkxIiwiaWF0IjoxNzQxMjk4MjY4LCJleHAiOjE3NzI4MzQyNjgsImF1ZCI6ImNlbGVzdGUiLCJpc3MiOiJub21icmUgZGUgbGEgZW1wcmVzYSBvIGFkbWluaXN0cmFkb3IiLCJzdWIiOiJ1c2VybmFtZSIsImp0aSI6IjY4NzM4MTU4MjgifQ.-t0JxJhvkXE5D1KtRmNjS43us6rHD4x5eKxkA9D8Qr4"
        ],
        "routeKey": "GET /api/v1/employees",
        "rawPath": "/dev/api/v1/employees",
        "rawQueryString": "",
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "es-US,es;q=0.9,en-US;q=0.8,en;q=0.7",
            "access-control-allow-origin": "*",
            "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwia2V5aWQiOiIzODcxNzA5MTkxIiwiaWF0IjoxNzQxMjk4MjY4LCJleHAiOjE3NzI4MzQyNjgsImF1ZCI6ImNlbGVzdGUiLCJpc3MiOiJub21icmUgZGUgbGEgZW1wcmVzYSBvIGFkbWluaXN0cmFkb3IiLCJzdWIiOiJ1c2VybmFtZSIsImp0aSI6IjY4NzM4MTU4MjgifQ.-t0JxJhvkXE5D1KtRmNjS43us6rHD4x5eKxkA9D8Qr4",
            "cache-control": "no-cache",
            "content-length": "0",
            "host": "u83oit2sq6.execute-api.us-east-1.amazonaws.com",
            "origin": "http://localhost:3000",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "referer": "http://localhost:3000/",
            "x-amzn-trace-id": "Root=1-67ca15dd-2c0a817c66bc51170d41e490",
            "x-forwarded-for": "200.118.62.44",
            "x-forwarded-port": "443",
            "x-forwarded-proto": "https"
        },
        "requestContext": {
            "accountId": "233925838033",
            "apiId": "u83oit2sq6",
            "domainName": "u83oit2sq6.execute-api.us-east-1.amazonaws.com",
            "domainPrefix": "u83oit2sq6",
            "http": {
                "method": "GET",
                "path": "/dev/api/v1/employees",
                "protocol": "HTTP/1.1",
                "sourceIp": "200.118.62.44",
                "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
            },
            "requestId": "HBhapgCqoAMEJ0w=",
            "routeKey": "GET /api/v1/employees",
            "stage": "dev",
            "time": "06/Mar/2025:21:38:37 +0000",
            "timeEpoch": 1741297117303
        }
    };
    const context = {
        awsRequestId: "1"
    };
    const result = await handler(event, context);
    console.log(">>>", result);
}
test();