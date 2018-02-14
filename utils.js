module.exports.buildResponse = ( statusCode, bodyJson ) => {
    return {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin' : '*',
            'Access-Control-Allow-Methods' : 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
            'Access-Control-Allow-Headers' : 'tenantid,Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
            'Access-Control-Allow-Credentials' : true
         },
         body: JSON.stringify( bodyJson )
    };
}
