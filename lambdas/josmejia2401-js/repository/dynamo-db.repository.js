const {
    DynamoDBClient,
    PutItemCommand,
    GetItemCommand,
    ScanCommand,
    UpdateItemCommand,
    DeleteItemCommand,
    QueryCommand
} = require("@aws-sdk/client-dynamodb");
const constants = require('../lib/constants');
const logger = require('../lib/logger');
const client = new DynamoDBClient({ apiVersion: "2012-08-10", region: constants.constants.REGION });

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
        const response = await client.send(new GetItemCommand(params));
        logger.info({
            requestId: options.requestId,
            message: response.Item !== undefined
        });
        return {
            data: response.Item,
            metadata: {
                totalScannedCount: 1,
                totalItemsMatched: 1,
                totalConsumedCapacity: response.ConsumedCapacity,
                lastEvaluatedKey: undefined
            }
        };
    } catch (err) {
        logger.error({
            requestId: options.requestId,
            message: err
        });
        throw err;
    }
}


async function query(payload = {
    keyConditionExpression: undefined,
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
            KeyConditionExpression: payload.keyConditionExpression,
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
        let results = [];
        let totalScannedCount = 0;
        let totalItemsMatched = 0;
        let totalConsumedCapacity = 0;
        let lastEvaluatedKey = undefined;
        if (payload.limit !== undefined && payload.limit !== null) {
            let response;
            do {
                response = await client.send(new QueryCommand(params));
                if (response.Items && response.Items.length > 0) {
                    results.push(...response.Items);
                }
                totalScannedCount += response.ScannedCount;
                totalItemsMatched += response.Count;
                totalConsumedCapacity += response.ConsumedCapacity;
                lastEvaluatedKey = response.LastEvaluatedKey;
                params.ExclusiveStartKey = lastEvaluatedKey;
            } while (typeof lastEvaluatedKey !== "undefined" && results.length < payload.limit);
        } else {
            const response = await client.send(new ScanCommand(params));
            if (response.Items && response.Items.length > 0) {
                results.push(...response.Items);
            }
            totalScannedCount += response.ScannedCount;
            totalItemsMatched += response.Count;
            totalConsumedCapacity += response.ConsumedCapacity;
            lastEvaluatedKey = response.LastEvaluatedKey;
        }
        logger.info({
            requestId: options.requestId,
            message: {
                size: results.length,
                lastEvaluatedKey: lastEvaluatedKey,
            },
        });
        return {
            data: results,
            metadata: {
                totalScannedCount: totalScannedCount,
                totalItemsMatched: totalItemsMatched,
                totalConsumedCapacity: totalConsumedCapacity,
                lastEvaluatedKey: lastEvaluatedKey
            }
        };
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
        let results = [];
        let totalScannedCount = 0;
        let totalItemsMatched = 0;
        let totalConsumedCapacity = 0;
        let lastEvaluatedKey = undefined;
        if (payload.limit !== undefined && payload.limit !== null) {
            let response;
            do {
                response = await client.send(new ScanCommand(params));
                if (response.Items && response.Items.length > 0) {
                    results.push(...response.Items);
                }
                totalScannedCount += response.ScannedCount;
                totalItemsMatched += response.Count;
                totalConsumedCapacity += response.ConsumedCapacity;
                lastEvaluatedKey = response.LastEvaluatedKey;
                params.ExclusiveStartKey = lastEvaluatedKey;
            } while (typeof lastEvaluatedKey !== "undefined" && results.length < payload.limit);
        } else {
            const response = await client.send(new ScanCommand(params));
            if (response.Items && response.Items.length > 0) {
                results.push(...response.Items);
            }
            totalScannedCount += response.ScannedCount;
            totalItemsMatched += response.Count;
            totalConsumedCapacity += response.ConsumedCapacity;
            lastEvaluatedKey = response.LastEvaluatedKey;
        }
        logger.info({
            requestId: options.requestId,
            message: {
                size: results.length,
                lastEvaluatedKey: lastEvaluatedKey,
            },
        });
        return {
            data: results,
            metadata: {
                totalScannedCount: totalScannedCount,
                totalItemsMatched: totalItemsMatched,
                totalConsumedCapacity: totalConsumedCapacity,
                lastEvaluatedKey: lastEvaluatedKey
            }
        };
    } catch (err) {
        logger.error({
            requestId: options.requestId,
            message: err
        });
        throw err;
    }
}

async function scanCount(payload = {
    expressionAttributeValues: {},
    expressionAttributeNames: {},
    projectionExpression: undefined,
    filterExpression: undefined,
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
            Select: 'COUNT'
        };
        logger.debug({
            requestId: options.requestId,
            message: JSON.stringify(params)
        });
        let results = [];
        let totalScannedCount = 0;
        let totalItemsMatched = 0;
        let totalConsumedCapacity = 0;
        let lastEvaluatedKey = undefined;
        let response;
        do {
            response = await client.send(new ScanCommand(params));
            if (response.Items && response.Items.length > 0) {
                results.push(...response.Items);
            }
            totalScannedCount += response.ScannedCount;
            totalItemsMatched += response.Count;
            totalConsumedCapacity += response.ConsumedCapacity;
            lastEvaluatedKey = response.LastEvaluatedKey;
            params.ExclusiveStartKey = lastEvaluatedKey;
        } while (typeof lastEvaluatedKey !== "undefined");
        logger.info({
            requestId: options.requestId,
            message: {
                size: results.length,
                lastEvaluatedKey: lastEvaluatedKey,
            },
        });
        return {
            data: results,
            metadata: {
                totalScannedCount: totalScannedCount,
                totalItemsMatched: totalItemsMatched,
                totalConsumedCapacity: totalConsumedCapacity,
                lastEvaluatedKey: lastEvaluatedKey
            }
        };
    } catch (err) {
        logger.error({
            requestId: options.requestId,
            message: err
        });
        throw err;
    }
}

async function parallelScan(payload = {
    expressionAttributeValues: {},
    expressionAttributeNames: {},
    projectionExpression: undefined,
    filterExpression: undefined,
    limit: undefined,
    lastEvaluatedKey: undefined,
    tableName: undefined,
    totalSegments: 4,
    segment: 1,
    limit: undefined
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
            Segment: payload.segment,
            TotalSegments: payload.totalSegments,
        };
        logger.debug({
            requestId: options.requestId,
            message: JSON.stringify(params)
        });
        let results = [];
        let totalScannedCount = 0;
        let totalItemsMatched = 0;
        let totalConsumedCapacity = 0;
        let segment = 1;
        let lastEvaluatedKey = undefined;
        let response;
        do {
            response = await client.send(new ScanCommand(params));
            if (response.Items && response.Items.length > 0) {
                results.push(...response.Items);
            }
            totalScannedCount += response.ScannedCount;
            totalItemsMatched += response.Count;
            totalConsumedCapacity += response.ConsumedCapacity;
            lastEvaluatedKey = response.LastEvaluatedKey;
            params.ExclusiveStartKey = lastEvaluatedKey;
            if (payload.limit && results.length >= payload.limit) {
                break;
            }
            if (typeof lastEvaluatedKey === "undefined") {
                segment++;
            }
        } while (typeof lastEvaluatedKey !== "undefined" && segment < payload.totalSegments);
        logger.info({
            requestId: options.requestId,
            message: {
                size: results.length,
                lastEvaluatedKey: lastEvaluatedKey,
            },
        });
        return {
            data: results,
            metadata: {
                totalScannedCount: totalScannedCount,
                totalItemsMatched: totalItemsMatched,
                totalConsumedCapacity: totalConsumedCapacity,
                lastEvaluatedKey: lastEvaluatedKey,
                totalSegments: payload.totalSegments,
                segment: segment
            }
        };
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
        const response = await client.send(new UpdateItemCommand(params));
        logger.info({
            requestId: options.requestId,
            message: response
        });
        return {
            data: undefined,
            metadata: {
                totalScannedCount: 1,
                totalItemsMatched: 1,
                totalConsumedCapacity: response.ConsumedCapacity,
                lastEvaluatedKey: undefined
            }
        };
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
        const response = await client.send(new DeleteItemCommand(params));
        logger.info({
            requestId: options.requestId,
            message: response
        });
        return {
            data: undefined,
            metadata: {
                totalScannedCount: 1,
                totalItemsMatched: 1,
                totalConsumedCapacity: response.ConsumedCapacity,
                lastEvaluatedKey: undefined
            }
        };
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
        const response = await client.send(new PutItemCommand(params));
        logger.info({
            requestId: options.requestId,
            message: response
        });
        return {
            data: undefined,
            metadata: {
                totalScannedCount: 1,
                totalItemsMatched: 1,
                totalConsumedCapacity: response.ConsumedCapacity,
                lastEvaluatedKey: undefined
            }
        };
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
    updateItem: updateItem,
    scanCount: scanCount,
    parallelScan: parallelScan,
    query: query
}