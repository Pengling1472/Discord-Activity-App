import { InteractionResponseType, InteractionType, verifyKeyMiddleware } from 'discord-interactions'
import { getUserData, saveDonation, saveLevel } from "./src/mongoose.js";
import { createServer } from 'http';
import { Server } from 'socket.io';

import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from 'fs';
dotenv.config( { path: '../.env' } );

const port = process.env.PORT || 3000;
const app = express();
const server = createServer( app ).listen( port, () => console.log( `Server is running on port ${port}` ) );
const io = new Server( server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: [ 'GET', 'POST' ]
    }
 } );

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

app.post( '/interactions', verifyKeyMiddleware( process.env.CLIENT_PUBLIC_KEY ), async ( req, res ) => {
    const message = req.body;
    if ( message.type == InteractionType.APPLICATION_COMMAND ) {
        res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: 'Hello world',
            },
        } )
    }
} )

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

    socket.on( 'export', async data => {
        saveLevel( data )
    } )

    socket.on( 'dialogue', async data => {
        const { name, type } = data
        const dialogues = JSON.parse( fs.readFileSync( './src/assets/merchant.json' ) );

        io.to( socket.id ).emit( 'dialogue', ( i => i[ Math.floor( Math.random() * i.length ) ] )( dialogues[ name ][ type ] ).split( '/' ) )
    } )
} );