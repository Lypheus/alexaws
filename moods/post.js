'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); 
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const utils = require('../utils.js');
const tableName = process.env.DYNAMODB_TABLE + "-moods";

module.exports.handler = ( event, context, callback ) => {
    var response;
    var payload = JSON.parse( event[ "body" ] );

    // check that tenantid is valid
    var tenantId = event.headers[ "tenantid" ];
    if( !tenantId ) {
        callback( null, utils.buildResponse( 400, { error : "The 'tenantid' was not found in header, cannot proceed." } ) );
        return;        
    }

    var result = { 
        id : uuid(),
        tenantid : tenantId,
        owner : payload[ "owner" ],
        timestamp : new Date().toISOString(),
        mood : payload[ "mood" ]
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