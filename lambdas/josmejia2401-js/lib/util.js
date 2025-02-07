const { commonUtils, globalException } = require("..");

/**
 * Genera un número único de n dígitos sin almacenar estado entre invocaciones.
 * Se combina una parte derivada del timestamp actual y una parte aleatoria.
 * Se garantiza que el número tenga exactamente n dígitos y que no comience con 0.
 *
 * @param {number} n - Cantidad total de dígitos deseados (n debe ser un entero >= 6).
 * @returns {string} Número único de n dígitos.
 */
function generateUniqueNumber(n) {
    if (typeof n !== 'number' || n < 6 || !Number.isInteger(n)) {
        throw new Error("El parámetro n debe ser un entero mayor o igual a 6.");
    }
    // Dividir la longitud: usar la mitad (redondeada hacia arriba) para la parte epoch,
    // y el resto para la parte aleatoria.
    const epochDigits = Math.ceil(n / 2);
    const randomDigits = n - epochDigits;
    // Parte epoch: se toma el timestamp actual en milisegundos y se extraen los últimos epochDigits dígitos.
    const epochStr = Date.now().toString();
    let epochPart = epochStr.slice(-epochDigits).padStart(epochDigits, '0');
    // Parte aleatoria: generar un entero aleatorio en el rango [0, 10^(randomDigits))
    // y formatearlo con ceros a la izquierda.
    const maxRandom = Math.pow(10, randomDigits);
    const randomInt = Math.floor(Math.random() * maxRandom);
    let randomPart = randomInt.toString().padStart(randomDigits, '0');
    // Concatenar ambas partes
    let result = epochPart + randomPart;
    // Ajustar en caso de que la concatenación exceda o no alcance n dígitos
    if (result.length > n) {
        result = result.slice(result.length - n);
    } else if (result.length < n) {
        result = result.padStart(n, '0');
    }
    // Si el primer dígito es "0", reemplazarlo por un dígito aleatorio entre 1 y 9.
    if (result[0] === '0') {
        const newFirstDigit = (Math.floor(Math.random() * 9) + 1).toString();
        result = newFirstDigit + result.slice(1);
    }
    return result;
}

exports.buildUuid = function () {
    return generateUniqueNumber(10);
}

exports.getTraceID = function (headers) {
    return headers["x-amzn-trace-id"] || headers["X-Amzn-Trace-Id"] || "unset";
}

exports.getAuthorization = function (event) {
    return event.headers?.Authorization || event.headers?.authorization || event.authorizationToken;
}

exports.isEmpty = function (value) {
    // Comprobar si el valor es undefined, null o vacío
    if (value === undefined || value === null) {
        return true;
    }

    // Si es una cadena, comprobar si está vacía
    if (typeof value === 'string' && value.trim() === '') {
        return true;
    }
    // Si es un array, comprobar si está vacío
    if (Array.isArray(value) && value.length === 0) {
        return true;
    }
    // Si es un objeto, comprobar si tiene propiedades (no vacío)
    if (typeof value === 'object' && Object.keys(value).length === 0) {
        return true;
    }
    return false;
}

const mapToDynamoDBFormat = function (obj) {
    const dynamoItem = {};
    for (const key in obj) {
        const value = obj[key];
        if (typeof value === 'number') {
            dynamoItem[key] = { N: value.toString() }; // DynamoDB almacena números como strings
        } else if (typeof value === 'string') {
            dynamoItem[key] = { S: value };
        } else if (typeof value === 'boolean') {
            dynamoItem[key] = { BOOL: value };
        } else if (value === null) {
            dynamoItem[key] = { NULL: true };
        } else if (Array.isArray(value)) {
            dynamoItem[key] = { L: value.map(item => mapToDynamoDBFormat({ temp: item }).temp) }; // Convertir listas
        } else if (typeof value === 'object') {
            dynamoItem[key] = { M: mapToDynamoDBFormat(value) }; // Convertir objetos/mapas
        }
    }
    return dynamoItem;
}
exports.mapToDynamoDBFormat = mapToDynamoDBFormat;


const parseDynamoDBItem = function (dynamoItem) {
    const parsedItem = {};
    for (const key in dynamoItem) {
        const valueObj = dynamoItem[key];
        if ('N' in valueObj) {
            parsedItem[key] = Number(valueObj.N); // Convertir a número
        } else if ('S' in valueObj) {
            parsedItem[key] = valueObj.S; // Asignar string
        } else if ('BOOL' in valueObj) {
            parsedItem[key] = valueObj.BOOL; // Asignar booleano
        } else if ('NULL' in valueObj) {
            parsedItem[key] = null; // Asignar null
        } else if ('L' in valueObj) {
            parsedItem[key] = valueObj.L.map(item => parseDynamoDBItem({ temp: item }).temp); // Convertir lista recursivamente
        } else if ('M' in valueObj) {
            parsedItem[key] = parseDynamoDBItem(valueObj.M); // Convertir objeto/mapa recursivamente
        }
    }
    return parsedItem;
}
exports.parseDynamoDBItem = parseDynamoDBItem;


/**
 * Función auxiliar que convierte un valor de JavaScript al formato de atributo de DynamoDB.
 * @param {any} value - Valor a convertir.
 * @returns {Object} Objeto en el formato esperado por DynamoDB.
 */
function convertValueToDynamoDBFormat(value) {
    if (value === null || value === undefined) {
        return { NULL: true };
    }
    const type = typeof value;
    if (type === 'number') {
        // DynamoDB requiere que los números se envíen como strings.
        return { N: value.toString() };
    }
    if (type === 'string') {
        return { S: value };
    }
    if (type === 'boolean') {
        return { BOOL: value };
    }
    if (Array.isArray(value)) {
        // Convertir cada elemento del array recursivamente.
        return { L: value.map(item => convertValueToDynamoDBFormat(item)) };
    }
    if (type === 'object') {
        // Convertir cada propiedad del objeto recursivamente.
        const mappedObj = {};
        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                mappedObj[key] = convertValueToDynamoDBFormat(value[key]);
            }
        }
        return { M: mappedObj };
    }
    // Si el tipo no es reconocido, lo convertimos a string.
    return { S: String(value) };
}

/**
 * Construye la estructura de actualización para DynamoDB a partir de un payload.
 * Se tienen en cuenta diferentes tipos de valores: números, strings, booleanos, listas, nulos y objetos.
 *
 * @param {Object} payload - Objeto con los campos y valores a actualizar.
 * @returns {Object} Objeto que contiene UpdateExpression, ExpressionAttributeNames y ExpressionAttributeValues.
 */
exports.buildUpdateExpression = function (payload, ignoreKeys = []) {
    let updateExpression = 'SET';
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    // Obtener todas las claves del payload.
    const keys = Object.keys(payload);
    keys.forEach((key, index) => {
        if (!ignoreKeys.includes(key)) {
            // Se define un alias para el nombre y para el valor.
            const attrName = `#${key}`;
            const attrValue = `:${key}`;
            // Construir la UpdateExpression, separando los atributos con comas.
            updateExpression += ` ${attrName}=${attrValue}${index < keys.length - 1 ? ',' : ''}`;
            // Mapear el alias al nombre real del atributo.
            expressionAttributeNames[attrName] = key;
            // Convertir el valor al formato que DynamoDB espera.
            expressionAttributeValues[attrValue] = convertValueToDynamoDBFormat(payload[key]);
        }
    });
    return {
        updateExpression: updateExpression,
        expressionAttributeNames: expressionAttributeNames,
        expressionAttributeValues: expressionAttributeValues
    };
}

exports.validateUserIdWithToken = function (event, userId) {
    const authorization = commonUtils.getAuthorization(event);
    const tokenDecoded = JWT.decodeToken(authorization);
    logger.info({ requestId: traceID, message: { keyid: tokenDecoded.keyid, id: Number(userId) } });
    if (Number(tokenDecoded?.keyid) !== Number(userId)) {
        return globalException.buildBadRequestError('Al parecer la solicitud no es permitida. Intenta nuevamente, por favor.');
    }
    return undefined;
}

/**
 * Construye la estructura para realizar un Scan en DynamoDB a partir de un objeto de filtros.
 * Genera FilterExpression, ExpressionAttributeNames y ExpressionAttributeValues.
 *
 * @param {Object} filter - Objeto con los atributos y valores para filtrar.
 *                          Ejemplo: { status: "ACTIVE", category: "ELECTRONICS", price: 100 }
 * @returns {Object} Objeto que contiene FilterExpression, ExpressionAttributeNames y ExpressionAttributeValues.
 */
exports.buildScanFilterExpression = function (filter, ignoreKeys = [], keysWithContains = []) {
    const conditions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    for (const key in filter) {
        if (!ignoreKeys.includes(key) && Object.prototype.hasOwnProperty.call(filter, key)) {
            const attrName = `#${key}`;
            const attrValue = `:${key}`;
            // Se construye la condición de igualdad para cada atributo.
            if (keysWithContains.includes(key)) {
                conditions.push(`contains(${attrName},${attrValue})`);
            } else {
                conditions.push(`${attrName}=${attrValue}`);
            }
            expressionAttributeNames[attrName] = key;
            expressionAttributeValues[attrValue] = convertValueToDynamoDBFormat(filter[key]);
        }
    }
    // Se unen las condiciones con "AND".
    const FilterExpression = conditions.join(' AND ');
    return {
        filterExpression: FilterExpression,
        expressionAttributeNames: expressionAttributeNames,
        expressionAttributeValues: expressionAttributeValues
    };
}