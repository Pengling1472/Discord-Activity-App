class Bar {
    constructor() {
        this.x = 600
        this.y = 80
        this.width = 720
        this.height = 50
        this.bar = 10
        this.barStroke = 20
    }
    update() {
        if ( tick % 5 == 0 ) this.bar -= 0.2
        
        this.bar = Math.min( Math.max( this.bar, 0 ), 100 )
        
        ctx.fillStyle = '#668c97';
        ctx.beginPath();
        ctx.roundRect( this.x, this.y, this.width, this.height, [ this.height / 2 ] );
        ctx.fill();

        ctx.fillStyle = '#2dd0e1';
        ctx.save();
        ctx.beginPath();
        ctx.roundRect( this.x + this.barStroke / 2, this.y + this.barStroke / 2, this.width - this.barStroke, this.height - this.barStroke, [ ( this.height - this.barStroke ) / 2 ] );
        ctx.clip();
        ctx.beginPath();
        ctx.roundRect( this.x - this.barStroke / 2, this.y + this.barStroke / 2, this.width * this.bar / 100, this.height - this.barStroke, [ 0, ( this.height - this.barStroke ) / 2, ( this.height - this.barStroke ) / 2, 0 ] )
        ctx.fill();
        ctx.restore();
    }
}
class Rod {
    draw() {
        ctx.strokeStyle = "grey";
        ctx.lineWidth = 5;
        
        ctx.beginPath()
        ctx.moveTo( this.hx - 245, this.hy + 188 )
        ctx.arcTo( this.cx, this.cy, this.x, this.y, this.rad )
        ctx.lineTo( this.x, this.y )
        ctx.stroke()
        
        // ctx.beginPath()
        // ctx.fillStyle = "red";
        // ctx.arc( this.cx, this.cy, 8, 0, 2 * Math.PI )
        // ctx.fill();
    }
    update() {
        this.x = game.get( 'line' ).x
        this.y = game.get( 'line' ).y
        
        this.hx = game.get( 'boat' ).x
        this.hy = game.get( 'boat' ).y

        this.rad = 300
        
        if ( game.get( 'line' ).caught ) {
            this.cx += 10
            this.cy -= 25
            
            this.hooked = true
        }
        if ( this.hooked ) return this.draw()

        this.cx = this.hx - 122.5
        this.cy = this.hy + 94
        
        this.draw()
    }
}
class Boat {
    constructor( x, y ) {
        this.startY = y
        this.x = x
        this.y = y
        this.isGoingUp = false
        this.dy = 0.5
        this.rotation = 0
    }
    draw() {
        ctx.save()

        const x = this.x - 528
        const y = this.y + 18

        if ( game.get( 'line' ).catching ) {
            ctx.translate( x + 529 / 2, y + 307 / 2 )
            ctx.rotate( - this.rotation )
            ctx.translate( -x - 529 / 2, -y - 307 / 2 )
            if ( this.rotation < Math.PI / 9 ) this.rotation += Math.PI / 90
        }

        ctx.drawImage( document.getElementById( game.get( 'line' ).catching ? 'reeling' : 'fishing' ), x, y, 529, 307 )
        ctx.restore()
    }
    update() {
        this.draw()

        if ( game.get( 'line' ).catching ) return
        if ( !this.isGoingUp ) if ( this.dy > 0.5 ) this.isGoingUp = true
        if ( this.isGoingUp ) if ( this.dy < -0.5 ) this.isGoingUp = false
        
        ctx.fillStyle = "brown";
        ctx.fillRect( this.x - 4, this.y - 2, 8, 4 )
        
        this.isGoingUp ? this.dy -= 0.005 : this.dy += 0.005
        
        this.y += this.dy
    }
}
class Line {
    constructor() {
        this.y = game.get( 'boat' ).y
        this.x = game.get( 'boat' ).x
        this.dy = 0
        this.cx = this.x + 100
        this.cy =  this.y + 300
        this.bx = this.x + 400
        this.by = this.y + 300
        this.rad = 410
        this.tick;
        
        this.tickCheck = false
        this.caught = false
        this.catching = false
    }
    update() {
        ctx.beginPath()
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.moveTo( this.x, this.y )
        ctx.arcTo( this.cx, this.cy, this.bx, this.by, this.rad )
        ctx.lineTo( this.bx, this.by )
        ctx.stroke()

        if ( !this.caught && !this.catching ) {
            this.x = game.get( 'boat' ).x
            this.y = game.get( 'boat' ).y
            this.dy = game.get( 'boat' ).dy
            
            this.cx += this.dy / 2
            this.cy += this.dy / 4

            this.by += this.dy / 4
        }
    
        // ctx.beginPath()
        // ctx.arc( this.cx, this.cy, 6, 0, 2 * Math.PI )
        // ctx.fill()

        if ( this.caught == true && !this.tickCheck ) { this.StartY = this.y, this.cx1 = this.cx , this.tick = tick + 4; this.tickCheck = true; game.delete( 'mfish' ); game.set( 'bar', new Bar() ) }
        if ( tick >= this.tick ) this.caught = false, this.catching = true
        if ( this.caught ) {    
            this.x += 10
            this.y += ( game.get( 'boat' ).startY - 50 - this.StartY ) / 4

            this.cx += ( this.x + 142.625 - this.cx1 ) / 4
            this.cy -= 43.75
            this.bx -= 25
        }
        if ( this.catching ) {
            this.dy = 0
            tick / 4 % 2 == 0 ? this.by += 2 : tick / 4 % 2 == 1 ? this.by -= 2 : this.by
            tick / 4 % 2 == 0 ? this.cy += 2 : tick / 4 % 2 == 1 ? this.cy -= 2 : this.cy
            tick / 6 % 4 - 2 < 0 ? this.y ++ : this.y --   
        }
    }
}

class Fish {
    constructor() {
        this.speed = 0.8
        this.opacity = 0
        this.bites = 0

        this.distance = Math.random() * 40 + 200
        this.rotation = Math.random() * Math.PI / 2 + 5 * Math.PI / 4
        this.x = this.distance * Math.cos( this.rotation - Math.PI ) + game.get( 'boat' ).x
        this.y = this.distance * Math.sin( this.rotation - Math.PI ) + game.get( 'boat' ).y

        ctx.strokeStyle = 'black'
        ctx.lineWidth = 2
    }
    draw() {        
        if ( !game.get( 'line' ).catching && !game.get( 'line' ).caught ) {
            ctx.beginPath()
            ctx.fillStyle = "red";
            ctx.arc( game.get( 'line' ).bx, game.get( 'line' ).by, 8, 0, 2 * Math.PI )
            ctx.fill();
        }

        ctx.save()
        
        ctx.globalAlpha = this.opacity / 100

        ctx.translate( this.x, this.y )
        ctx.rotate( this.rotation + Math.PI / 2 )
        ctx.translate( -this.x - 35 , -this.y - 35 )
        ctx.drawImage( document.getElementById( 'fish' ), this.x, this.y, 70, 70 )
        ctx.restore()
    }
    update() {
        this.draw()

        if ( this.opacity < 60 ) this.opacity++
        if ( this.bites == 5 ) return
        if ( this.bites == 4 ) { game.get( 'line' ).caught = true; this.bites++; return}
        if ( this.distance < 10 ) this.bite()

        this.distance -= this.speed
        this.rotation += Math.cos( tick / 16 ) / 128

        if ( this.distance < 50 ) this.speed = this.speed * ( this.distance ) / ( this.speed + this.distance )

        this.x = this.distance * Math.cos(this.rotation + Math.PI ) + game.get( 'line' ).bx
        this.y = this.distance * Math.sin(this.rotation + Math.PI ) + game.get( 'line' ).by
    }
    bite() {
        if ( Math.floor( Math.random() * ( 4 - this.bites ) ) == 0 ) return this.bites = 4
        for ( let i = 0; i < 20; i++ ) setTimeout( () => { this.distance += 5 }, i * 10 )

        setTimeout( () => { this.idle = true }, 200 )
        setTimeout( () => { this.speed = 0.8, this.idle = false }, ( 1 + Math.random() * 3 ) * 1000 )

        this.speed = 0.2
        this.bites++
    }
}

import { game, tick, canvas, ctx, switchScript, Button, Background } from '../main.js'

export function execute() {
    game.set( 'background', new Background( '#45bccc' ) )
    game.set( 'boat', new Boat( canvas.width / 2, canvas.height / 2 - 150 ) ) 
    game.set( 'line', new Line() )
    game.set( 'rod', new Rod() ) 
    game.set( 'button', new Button( 30, 30, 10, 'Return' ) )
}

export function onMouseDown( event ) {
    const rect = canvas.getBoundingClientRect()
    const button = game.get( 'button' )

    const x = ( event.clientX - rect.left ) * 1920 / rect.width
    const y = ( event.clientY - rect.top ) * 1080 / rect.height
    
    if ( x > button.x && x < button.x + button.width && y > button.y && y < button.y + button.height ) return switchScript( 'menu' )

    if ( game.get( 'line' ).catching ) game.get( 'bar' ).bar += 5
    if ( !game.get( 'line' ).catching ) game.set( 'mfish', new Fish() )
}