const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const util = require('../utils/util');
const bcrypt = require('bcryptjs');
// api key: BMZXVt1Sdt6jz4hKN7Ix25oHWlo30BTZGLvVwKnd
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'bit465-final-users';

async function register(userInfo) {
    const name = userInfo.name;
    const username = userInfo.name;
    const email = userInfo.email;
    const password = userInfo.password;
    // check if required fields are present
    if (!name || !username || !email || !password) {
        return util.buildResponse(401, {
            message: 'Missing required fields'
        })
    }
    // check if username already exists in our database
    const dynamoUser = await getUser(username);
    if (dynamoUser && dynamoUser.username) {
        return util.buildResponse(401, {
            message: 'Username already exists in our database, please try another username'
        })
    }
    // if username is available, encrypt password and save user to database
    const encryptedPassword = await bcrypt.hashSync(password.trim(), 10);
    const user = {
        name: name,
        username: username.toLowerCase().trim(), // lowercased and trimmed for simplicity
        email: email,
        password: encryptedPassword
    }
    // save user to database
    const saveUserResponse = await saveUser(user);
    // if error saving user, return error
    if (!saveUserResponse) {
        return util.buildResponse(503, {
            message: 'Server Error. Please try again later.'
        });
    }
    // if evthing successful, return user object
    return util.buildResponse(200, { username: username });
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

async function saveUser(user) {
    const params = {
        TableName: userTable,
        Item: user
    }
    return await dynamodb.put(params).promise().then(() => {
        return true;
    }, error => {
        console.error('There is an error saving user: ', error)
    });
}

// export the function
module.exports = { register };