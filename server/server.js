import { getUserData, saveDonation, saveLevel } from "./src/mongoose.js";
import { createServer } from 'http';
import { Server } from 'socket.io';

import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import fetch from "node-fetch";
dotenv.config( { path: '../.env' } );

const app = express();
const server = createServer( app );
const io = new Server( server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: [ 'GET', 'POST' ]
    }
 } );
const port = process.env.PORT || 3000;

app.use( express.urlencoded( { extended: true } ) );
app.use( express.json() );

async function checkAvatarUrl( userId, avatarId, format = 'png', size = 500 ) {
    const url = `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.${format}?size=${size}`;
    
    try {
        const response = await fetch( url, { method: 'HEAD' } );
        const finalUrl = response.url;

        console.log( response )
  
        if ( finalUrl.startsWith( 'https://images-ext-1.discordapp.net/external/' ) ) {
            return 'External avatar';
        } else {
            return 'Internal avatar';
        }
    } catch ( error ) {
        return 'Error'
    }
}

app.post( '/api/token', async ( req, res ) => {
    const response = await fetch( `https://discord.com/api/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams( {
            client_id: process.env.VITE_DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: "authorization_code",
            code: req.body.code
        } )
    } );

    const { access_token } = await response.json();

    res.send( { access_token } );
} );

app.post( '/getUserData', async ( req, res ) => {
    const user = req.body

    user.avatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=4096`

    const avatar = await fetch( user.avatar )

    if ( !avatar.ok ) user.avatar = 'https://cdn.discordapp.com/embed/avatars/1.png'

    res.send( { data: await getUserData( user.id ), user } );
} );

app.post( '/donation', async ( req, res ) => {
    res.sendStatus( 200 );

    const { data } = req.body
    const { type } = data

    if ( type == 'Donation' ) saveDonation( JSON.parse( data ) )
} );

io.on( 'connection', socket => {
    console.log( `A client connected ${socket.id}` );
    socket.emit( 'message', 'Hello from server' );

    socket.on( 'export', async data => {
        saveLevel( data )
    } )
} );

server.listen( port, () => console.log( `Server is running on port ${port}` ) );