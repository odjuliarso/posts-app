const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });
// x-api-key: BMZXVt1Sdt6jz4hKN7Ix25oHWlo30BTZGLvVwKnd
const bcrypt = require('bcryptjs');
const auth = require('../utils/auth');
const util = require('../utils/util');
// import bcrypt

const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'bit465-final-users';

async function login(user) {
    const username = user.username;
    const password = user.password;
    // check if required fields are present
    if (!username || !password) {
        return util.buildResponse(401, {
            message: 'Missing required fields'
        })
    }

    const dynamoUser = await getUser(username.toLowerCase().trim());
    if (!dynamoUser || !dynamoUser.username) {
        return util.buildResponse(403, {
            message: 'Username does not exist in our database'
        })
    }

    if (!bcrypt.compareSync(password, dynamoUser.password)) {
        return util.buildResponse(403, {
            message: 'Incorrect password'
        })
    }

    const userInfo = {
        username: dynamoUser.username,
        name: dynamoUser.name
    }

    const token = auth.generateToken(userInfo);
    const response = {
        user: userInfo,
        token: token
    }
    return util.buildResponse(200, response);
}

async function getUser(username) {
    const params = {
        TableName: userTable,
        Key: {
            username: username
        }
    }
    return await dynamodb.get(params).promise().then(
        response => {
            return response.Item;
        },
        error => {
            console.log('There is an error: ', error);
        }
    )
}
// export the function
module.exports = { login }; 