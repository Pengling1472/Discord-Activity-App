import { getUserData, saveDonation, saveLevel } from "./src/mongoose.js";
import { createServer } from 'http';;
import { Server } from 'socket.io';

import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import fetch from "node-fetch";
dotenv.config( { path: '../.env' } );

const app = express();
const server = createServer( app );
const io = new Server( server, {
    path: 'discord-activity-app.onrender.com',
    cors: {
        origin: [ process.env.CLIENT_URL ]
    }
} );
const port = 3000;

app.use( express.urlencoded( { extended: true } ) );
app.use( express.json() );
app.use( cors() );

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

    res.send( { data: await getUserData( user.id ), user } );
} );

app.post( '/donation', async ( req, res ) => {
    res.sendStatus( 200 );

    const { data } = req.body
    const { type } = data

    if ( type == 'Donation' ) saveDonation( JSON.parse( data ) )
} );

server.listen( port, () => console.log( `Server is running!` ) );

io.on( 'connection', socket => {
    console.log( `${socket.id} connected` )

    socket.on( 'export', async data => {
        saveLevel( data )
    } )
} )