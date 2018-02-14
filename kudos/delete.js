'use strict';

const AWS = require('aws-sdk'); 
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const utils = require('../utils.js');
const tableName = process.env.DYNAMODB_TABLE + "-kudos";

module.exports.handler = ( event, context, callback ) => {
    var response;
    var parms = event[ "pathParameters" ];
    
    // check if parameters exist, if so store the {id}
    var id = null;
    if( parms && parms[ "id" ] ) {
        id = parms[ "id" ];
        console.log( "Found parameter for id: ", id );
    }

    // check that tenantid is valid
    var tenantId = event.headers[ "tenantid" ];
    if( !tenantId ) {
        callback( null, utils.buildResponse( 400, { error : "The 'tenantid' was not found in header, cannot proceed." } ) );
        return;        
    }   
 
    // locate the profile with this id, otherwise we send back the list of goals
    if( id ) {
        var params = {
            TableName: tableName,
            Key: {
                "id" : id
            },
            ConditionExpression: "#tid = :tid and #id = :id",
            ExpressionAttributeNames: {
                "#tid" : "tenantid",
                "#id" : "id"
            },
            ExpressionAttributeValues: {
                ":tid": tenantId,
                ":id" : id
            }
        };
        
        dynamoDb.delete(params, (error, result) => {
            if( error ) {
                callback( null,  utils.buildResponse( 400, error ) );
            }
            else {
                callback( null, utils.buildResponse( 200, { id : id, message : "Kudos has been deleted successfully." } ) );
            }
        });              
    }
    else {
        callback( null, utils.buildResponse( 404, { id : id, message : "Kudos was not found, DELETE has not removed an item from datastore." } ) );
    }
}
