const {
    DynamoDBClient,
    PutItemCommand,
    GetItemCommand,
    ScanCommand,
    UpdateItemCommand,
    DeleteItemCommand
} = require("@aws-sdk/client-dynamodb");
const constants = require('../lib/constants');
const logger = require('../lib/logger');
const client = new DynamoDBClient({ apiVersion: "2012-08-10", region: constants.constants.REGION });

function buildItem(element, schema) {
    if (element === undefined || element === null) {
        return undefined;
    }
    if (schema === undefined || schema === null) {
        return element;
    }
    const output = {};
    const schemaKeys = Object.keys(schema);
    for (const schemaKey of schemaKeys) {
        output[`${schemaKey}`] = element[`${schemaKey}`];
    }
    return output;
}

function buildItems(elements, schema) {
    if (elements === undefined || elements === null) {
        return undefined;
    }
    if (schema === undefined || schema === null) {
        return elements;
    }
    const output = [];
    for (const element of elements) {
        output.push(buildItem(element));
    }
    return output;
}

async function getItem(payload = {
    key: {},
    projectionExpression: undefined,
    tableName: undefined
}, options = {
    requestId: undefined,
    schema: undefined,
}) {
    try {
        const params = {
            TableName: payload.tableName,
            Key: payload.key,
            ProjectionExpression: payload.projectionExpression,
        };
        logger.debug({
            requestId: options.requestId,
            message: params
        });
        const resultData = await client.send(new GetItemCommand(params));
        logger.info({
            requestId: options.requestId,
            message: resultData.Item !== undefined
        });
        return buildItem(resultData.Item, options.schema);
    } catch (err) {
        logger.error({
            requestId: options.requestId,
            message: err
        });
        throw err;
    }
}



async function scan(payload = {
    expressionAttributeValues: {},
    expressionAttributeNames: {},
    projectionExpression: undefined,
    filterExpression: undefined,
    limit: undefined,
    lastEvaluatedKey: undefined,
    tableName: undefined
}, options = {
    requestId: undefined,
    schema: undefined,
}) {
    try {
        const params = {
            ExpressionAttributeValues: payload.expressionAttributeValues,
            ExpressionAttributeNames: payload.expressionAttributeNames,
            ProjectionExpression: payload.projectionExpression,
            FilterExpression: payload.filterExpression,
            TableName: payload.tableName,
            Limit: payload.limit,
            ExclusiveStartKey: payload.lastEvaluatedKey,
        };
        logger.debug({
            requestId: options.requestId,
            message: JSON.stringify(params)
        });
        const resultData = {
            results: [],
            lastEvaluatedKey: null
        };
        if (payload.limit !== undefined && payload.limit !== null) {
            let items;
            do {
                items = await client.send(new ScanCommand(params));
                if (items.Items && items.Items.length > 0) {
                    resultData.results.push(...buildItems(items.Items, options.schema));
                }
                params.ExclusiveStartKey = items.LastEvaluatedKey;
                resultData.lastEvaluatedKey = items.LastEvaluatedKey;
            } while (typeof items.LastEvaluatedKey !== "undefined" && resultData.results.length < payload.limit);
        } else {
            const items = await client.send(new ScanCommand(params));
            if (items.Items && items.Items.length > 0) {
                resultData.results.push(...buildItems(items.Items, options.schema));
            }
            resultData.lastEvaluatedKey = items.LastEvaluatedKey;
        }
        logger.info({
            requestId: options.requestId,
            message: {
                size: resultData.results.length,
                lastEvaluatedKey: resultData.lastEvaluatedKey,
            },
        });
        return resultData;
    } catch (err) {
        logger.error({
            requestId: options.requestId,
            message: err
        });
        throw err;
    }
}

async function updateItem(payload = {
    key: {},
    updateExpression: undefined,
    expressionAttributeNames: {},
    expressionAttributeValues: {},
    conditionExpression: undefined,
    filterExpression: undefined,
    returnValues: 'ALL_NEW',
    tableName: undefined
}, options = {
    requestId: undefined,
    schema: undefined
}) {
    try {
        const params = {
            TableName: payload.tableName,
            Key: payload.key,
            UpdateExpression: payload.updateExpression,
            ExpressionAttributeNames: payload.expressionAttributeNames,
            ExpressionAttributeValues: payload.expressionAttributeValues,
            ConditionExpression: payload.conditionExpression,
            FilterExpression: payload.filterExpression,
            ReturnValues: payload.returnValues
        };
        logger.info({
            requestId: options.requestId,
            message: JSON.stringify(params)
        });
        const resultData = await client.send(new UpdateItemCommand(params));
        logger.info({
            requestId: options.requestId,
            message: resultData
        });
        return resultData;
    } catch (err) {
        logger.error({
            requestId: options.requestId,
            message: err
        });
        throw err;
    }
}


async function deleteItem(payload = {
    key: {},
    tableName: undefined
}, options = {
    requestId: undefined,
    schema: undefined
}) {
    try {
        const params = {
            TableName: payload.tableName,
            Key: payload.key
        };
        logger.info({
            requestId: options.requestId,
            message: JSON.stringify(params)
        });
        const resultData = await client.send(new DeleteItemCommand(params));
        logger.info({
            requestId: options.requestId,
            message: resultData
        });
        return resultData;
    } catch (err) {
        logger.error({
            requestId: options.requestId,
            message: err
        });
        throw err;
    }
}


async function putItem(payload = {
    item: {},
    tableName: undefined
}, options = {
    requestId: undefined, schema: undefined
}) {
    try {
        const params = {
            TableName: payload.tableName,
            Item: payload.item
        };

        logger.info({
            requestId: options.requestId,
            message: params
        });

        const resultData = await client.send(new PutItemCommand(params));

        logger.info({
            requestId: options.requestId,
            message: resultData
        });

        return buildItem(params.Item, options.schema);
    } catch (err) {
        logger.error({
            requestId: options.requestId,
            message: err
        });
        throw err;
    }
}


module.exports = {
    putItem: putItem,
    getItem: getItem,
    scan: scan,
    deleteItem: deleteItem,
    updateItem: updateItem
}