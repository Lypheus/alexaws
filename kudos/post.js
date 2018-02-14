'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); 
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const utils = require('../utils.js');
const tableName = process.env.DYNAMODB_TABLE + "-kudos";

module.exports.handler = ( event, context, callback ) => {
    var response;
    var payload = JSON.parse( event[ "body" ] );

    // check that payload is valid
    if( !payload[ "name" ] || !payload[ "image" ] || !payload[ "description" ] ) {
        callback( null, utils.buildResponse( 400,{ error : "Must always include name, description and image." } ) );
        return;
    }

    // check that tenantid is valid
    var tenantId = event.headers[ "tenantid" ];
    if( !tenantId ) {
        callback( null, utils.buildResponse( 400, { error : "The 'tenantid' was not found in header, cannot proceed." } ) );
        return;        
    }

    var result = { 
        id : uuid(),
        tenantid : tenantId,
        name : payload[ "name" ],
        description : payload[ "description" ],
        image : payload[ "image" ]
    };

    const params = {
        TableName: tableName,
        Item: result
    };

    dynamoDb.put(params, (error) => {
        if( error ) {
            callback( null, utils.buildResponse( 400, { error : error } ) );
        }
        else {
            callback( null, utils.buildResponse( 200, result ) );
        }
    });
}