#remote

the remote node.js API server


## API Documentation

All commands are prefaced with /api/v1.

##### /device/:device-id/:outlet (POST)

Set the state of an outlet.

    {
        state: 1
    }
    
##### /device/:device-id/:outlet (GET)

Get the state of an outlet.

