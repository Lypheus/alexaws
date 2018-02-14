'use strict';

const AWS = require('aws-sdk'); 
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const utils = require('../utils.js');
const tableName = process.env.DYNAMODB_TABLE + "-moods";

module.exports.handler = ( event, context, callback ) => {
    var response;
    var parms = event[ "pathParameters" ];
    var id = null;
  
    // check that tenantid is valid
    var tenantId = event.headers[ "tenantid" ];
    if( !tenantId ) {
        callback( null, utils.buildResponse( 400, { error : "The 'tenantid' was not found in header, cannot proceed." } ) );
        return;        
    }   

    // populate pagination parameter if found
    var page = null;
    if( parms && event.queryStringParameters && event.queryStringParameters[ "page" ] ) {
        page = event.queryStringParameters[ "page" ];
        console.log( "Found parameter for page: ", page );
    }

    // check if parameters exist, if so store the {id}
    if( parms && parms[ "id" ] ) {
        id = parms[ "id" ];
        console.log( "Found parameter for id: ", id );
    }

    if( !id ) {
        callback( null, utils.buildResponse( 404, { error : "Get must include an id to filter the results to the correct moods." } ) );
        return;
    }

    // locate the goal with this id, otherwise we send back the list of goals
    var dbParms = {
        TableName : tableName,
        FilterExpression: "#tid = :tid and #owner = :owner",
        ProjectionExpression: "#timestamp, #mood",
        ExpressionAttributeNames: {
            "#tid" : "tenantid",
            "#owner" : "owner",
            "#timestamp" : "timestamp",
            "#mood" : "mood"
        },
        ExpressionAttributeValues: {
            ":tid": tenantId,
            ":owner": id
        }
    };

    // if paginating, caller will include an id for page
    if( page ) {
        dbParms[ "ExclusiveStartKey" ] = { "id" : page };
    }
    
    console.log( "Specific GET request by OWNER (ID) for owner=%s, tid=%s", id, tenantId );

    dynamoDb.scan( dbParms, (error, result) => {
        if( error ) {
            console.log( 'db error: ', error );
            callback( null, utils.buildResponse( 400, { error : error } ) );
        }
        else {
            if( Object.keys(result.Items).length < 1 ) {
                console.log( "Empty result list, object not found for id: ", id );
                callback( null, utils.buildResponse( 404, { message : "Empty list found, nothing to return." } ) );
            }
            else {
                console.log( "Found object with id: %s, returning object to caller.", id );
                callback( null, utils.buildResponse( 200, result ) );
            }
        }
    });              
}