export class BlackScreen {
    constructor() {
        this.baseTime = 80;
        this.time = 80;
        this.fade = false;
        this.await = false;
        this.script = 'menu';
    }
    async update() {
        ctx.save()
        ctx.globalAlpha = this.time / this.baseTime
        ctx.fillStyle = '#1b1b1f'
        ctx.fillRect( 0, 0, canvas.width, canvas.height )
        ctx.restore()

        if ( this.await ) return
        if ( this.fade && this.time == this.baseTime ) {
            this.await = true;

            const awaitScript = await script.get( this.script )()
            
            for ( const key of [ ...game.keys() ] ) if ( key != 'blackscreen' ) game.delete( key )
            
            awaitScript.execute()
            canvas.onmousedown = awaitScript.onMouseDown
            
            this.fade = false;
            this.await = false;
            return
        }
        if ( this.fade ) this.time += 1
        if ( !this.fade && this.time > 0 ) this.time -= 1
    }
}

export class Button {
    constructor( x, y, stroke, text, anchor = 'top-left' ) {
        const width = ctx.measureText( text ).width + 40
        const height = 60 + stroke

        this.x = anchor == 'top-left' || anchor == 'bottom-left' ? x :
        anchor == 'top-right' || anchor == 'bottom-right' ? x + width : x - width / 2
        this.y = anchor == 'top-left' || anchor == 'top-right' ? y :
        anchor == 'bottom-left' || anchor == 'bottom-right' ? y + height : y - height / 2
        this.stroke = stroke
        this.text = text
        this.width = width
        this.height = height
    }
    update() {
        ctx.fillStyle = 'white'
        ctx.beginPath();
        ctx.roundRect( this.x, this.y, this.width, this.height, [ this.height / 2 / 2 ] )
        ctx.fill();

        ctx.fillStyle = 'black'
        ctx.beginPath();
        ctx.roundRect( this.x + this.stroke / 2, this.y + this.stroke / 2, this.width - this.stroke, this.height - this.stroke, [ ( this.height - this.stroke ) / 2 / 2 ] );
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.roundRect( this.x + this.stroke / 2, this.y + this.stroke / 2, this.width - this.stroke, this.height - this.stroke, [ ( this.height - this.stroke ) / 2 / 2 ] );
        ctx.clip();
        ctx.fillStyle = 'white'
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx.fillText( this.text, this.x + this.width / 2, this.y + this.height / 2 )
        ctx.restore();
    }
}

export class Background {
    constructor( id ) {
        this.id = id
        this.isBackground = false
        if ( document.getElementById( id ) ) this.isBackground = true
    }
    update() {        
        if ( this.isBackground ) return ctx.drawImage( document.getElementById( this.id ), 0, 0, canvas.width, canvas.height )
        
        ctx.fillStyle = this.id
        ctx.fillRect( 0, 0, canvas.width, canvas.height )
    }
}

export class Title {
    constructor( x, y, text, color = 'white', size = 50, align = 'left', baseline = 'top' ) {
        this.x = x
        this.y = y
        this.text = text
        this.size = size
        this.color = color
        this.align = align
        this.baseline = baseline
    }
    update() {
        ctx.save();
        ctx.font = `${this.size}px Itim`
        ctx.fillStyle = this.color
        ctx.textAlign = this.align
        ctx.textBaseline = this.baseline

        ctx.fillText( this.text, this.x, this.y )
        ctx.restore();
    }
}

import { DiscordSDK } from "@discord/embedded-app-sdk";
import "./style.css";

const script = new Map( Object.entries( import.meta.glob( './src/*.js' ) ).map( ( [ key, item ] ) =>
    [ key.split( '/' ).at( -1 ).split( '.' )[ 0 ], item ]
) )

export const member = new Map();
export let game = new Map();
export let tick = new Number();

export const canvas = document.getElementById( 'canvas' );
export const ctx = canvas.getContext( '2d' );

canvas.width = 1920;
canvas.height = 1080;

canvas.oncontextmenu = event => event.preventDefault()

ctx.font = "50px Itim";

game.set( 'blackscreen', new BlackScreen() )

getAssets( 'fish' )
getAssets( 'merchant/diana' )
getAssets( 'merchant/background' )
ticks()

let auth;

const discordSdk = new DiscordSDK( import.meta.env.VITE_DISCORD_CLIENT_ID );

setupDiscordSdk().then( getUser );

// test() 

async function setupDiscordSdk() {
    await discordSdk.ready();

    const { code } = await discordSdk.commands.authorize( {
        client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
        response_type: 'code',
        state: '',
        prompt: 'none',
        scope: [ 'identify' ]
    } );

    const response = await fetch( `${import.meta.env.VITE_URL}/api/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify( { code } )
    } );

    const { access_token } = await response.json();

    auth = await discordSdk.commands.authenticate( {
        access_token,
    } );

    if ( !auth ) throw new Error( 'Authenticate command failed' );
}

async function getUser() {
    const response = await fetch( `${VITE_URL}/getUserData`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify( auth.user )
    } );

    const { data, user } = await response.json();

    member.set( 'data', data )
    member.set( 'user', user )

    document.getElementById( 'img' ).insertAdjacentHTML( 'beforeend', `<img id="avatar" src="${user.avatar}" style="visibility: hidden;">` )

    switchScript( 'menu' );
}

function test() {    
    const data = {
        _id: '404398972095037451',
        user: { items: [Array], coins: 50, level: 3, score: 764, xp: 763 },
        orientation: { asexuality: 22, straight: 0, gay: 78, text: 'Pretty Gay' },
        waifu: {
            attractive: '6.7',
            teasing: '1.9',
            fashion: '8.6',
            loving: '5.0',
            horny: '2.4',
            cute: '6.1',
            text: "is an S-tier waifu known for deserving all of the world's headpats."
        }
    }
    const user = {
        username: 'pingu1472',
        discriminator: '0',
        id: '404398972095037451',
        avatar: 'https://cdn.discordapp.com/avatars/404398972095037451/f4395eacf8748c53c5cd5a6b1853064e.png?size=4096',
        public_flags: 4194368,
        global_name: 'Pingu1472'
    }

    member.set( 'data', data )
    member.set( 'user', user )

    document.getElementById( 'img' ).insertAdjacentHTML( 'beforeend', `<img id="avatar" src="${user.avatar}" style="visibility: hidden;">` )

    switchScript( 'menu' );
}

function ticks() {
    requestAnimationFrame( ticks );

    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    for ( const key of [ ...game.keys() ] ) if ( key != 'blackscreen' && game.has( key ) ) {
        if ( game.get( key ) instanceof Map ) { for ( const button of [ ...game.get( key ).values() ] ) button.update(); continue; }
        game.get( key ).update();
    }
    game.get( 'blackscreen' ).update()
    tick++;
}

export function switchScript( name ) {
    canvas.onmousedown = () => {}

    game.get( 'blackscreen' ).fade = true;
    game.get( 'blackscreen' ).script = name;
}

export function getAssets( url ) {
    let images;

    switch ( url ) {
        case 'merchant/background': images = import.meta.glob( './assets/merchant/background/*.png', { eager: true, as: 'url' } ); break;
        case 'merchant/diana':      images = import.meta.glob( './assets/merchant/diana/*.png', { eager: true, as: 'url' } ); break;
        case 'merchant/nancy':      images = import.meta.glob( './assets/merchant/nancy/*.png', { eager: true, as: 'url' } ); break;
        case 'fish':                images = import.meta.glob( './assets/fish/*.png', { eager: true, as: 'url' } ); break;
    }

    document.getElementById( 'img' ).insertAdjacentHTML( 'beforeend', Object.keys( images ).map( url => `<img id=${url.split( '/' ).at( -1 ).split( '.' )[ 0 ]} src="${new URL( `${url}`, import.meta.url ).href }" style="visibility: hidden;">` ).join( '' ) )
}