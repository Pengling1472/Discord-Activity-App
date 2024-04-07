class Merchant {
    constructor() {
        this.gravity = 0.3
        this.elasticity = 0.7
        this.dy = 0
        this.width = 800
        this.height = 800
        this.x = 311.1
        this.y = 0
        this.stretch = 0
        this.baseY = this.y
        this.bounces = 3

        
    }
    draw() {
        ctx.drawImage( document.getElementById( 'gui' ), 0, 0, 1920, 1080 )
        ctx.drawImage( document.getElementById( 'day' ), this.x, this.baseY, this.height, this.height )
        ctx.drawImage( document.getElementById( this.bounces >= 3 ? 'normal' : 'talking' ), this.x, this.y + this.stretch, this.width, this.height - this.stretch )
        
        ctx.save();
        ctx.beginPath();
        ctx.arc( 1492.2, 70, 40, 0, 2 * Math.PI );
        ctx.clip();
        ctx.drawImage( document.getElementById( 'avatar' ), 1452.2, 30, 80, 80 );
        ctx.restore();

        ctx.fillStyle = 'white'
        ctx.textBaseline = 'top'
        ctx.textAlign = 'left'

        ctx.fillText( member.get( 'user' ).global_name, 1542.2, 30 )
        ctx.fillText( member.get( 'data' ).user.coins + 'G', 1542.2, 80 )
    }
    update() {
        if ( this.bounces < 3 && this.dy != 0 ) {
            this.stretch += this.dy
            this.dy += this.gravity
            
            if ( this.stretch > this.baseY ) this.dy = this.dy * -this.elasticity, this.bounces++, this.stretch = this.baseY
        }
        
        this.draw()
    }
    bounce() {
        if ( this.bounces >= 3 && this.y == this.baseY ) {
            this.y = this.baseY
            this.dy = -5
            this.bounces = 0
        }
    }
}
class Dialogue {
    constructor() {
        this.column = 0
        this.row = 0
        this.dialogue = []

        this.newText = this.newDialogue( 'Hi, welcome to my shop! How can I help you?' )
    }
    newDialogue( text ) {
        const splitText = text.split( ' ' ).map( word => word + ' ' )
        const width = ctx.measureText( text ).width
        const newDialogue = []

        this.column = 0
        this.row = 0
        this.dialogue = []
        this.text = text

        for ( let i = 0; i < Math.round( width / 1362.2 ) + 1; i++ ) {
            let words = ''
            newDialogue.push( [] )

            for ( let j = 0; splitText.length > 0; j++ ) {
                if ( ctx.measureText( words ).width + ctx.measureText( splitText[ 0 ] ).width > 1362.2 ) break
                words += splitText.splice( 0, 1 )
            }

            newDialogue[ i ] = words
        }

        for ( let i = 0; i < newDialogue.length; i++ ) this.dialogue.push( '' )

        return newDialogue
    }
    update() {
        if ( tick % 3 == 0 ) if ( this.column < this.newText.length - 1 || this.column == 0 ) {
            this.dialogue[ this.column ] += this.newText[ this.column ].split( '' )[ this.row ]
            this.row++
            if ( this.row + 1 > this.newText[ this.column ].length ) { this.column++; this.row = 0 }
            game.get( 'merchant' ).bounce()
        }

        ctx.fillStyle = 'white'
        ctx.textBaseline = 'top'
        ctx.textAlign = 'left'

        for ( const [ index ] of Object.keys( this.dialogue ) ) ctx.fillText( this.dialogue[ index ], 30, 830 + ( index * 50 ) );
    }
}

import { game, tick, ctx, switchScript, Button, member } from '../main.js'

export function execute() {
    game.set( 'merchant', new Merchant() )
    game.set( 'dialogue', new Dialogue() )
    game.set( 'button', new Button( 30, 30, 10, 'Return' ) )
}

export function onMouseDown( event ) {
    const rect = canvas.getBoundingClientRect()
    const button = game.get( 'button' )

    const x = ( event.clientX - rect.left ) * 1920 / rect.width
    const y = ( event.clientY - rect.top ) * 1080 / rect.height

    if ( x > button.x && x < button.x + button.width && y > button.y && y < button.y + button.height ) switchScript( 'menu' )
}