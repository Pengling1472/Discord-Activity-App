class Minesweeper {
    constructor( difficulty ) {
        this.width = [ 16, 24, 32, 40 ][ difficulty ]
        this.height = [ 16, 24, 32, 40 ][ difficulty ]
        this.markers = [ 40, 100, 240, 400 ][ difficulty ]
        this.firstClick = false
        this.flag = false
        this.mines = []
        this.board = []
        this.over = false
        
        for ( let i = 0; i < this.height; i++ ) {
            this.board.push( [] ) 
            for ( let j = 0; j < this.width; j++ ) this.board[ i ].push( new Tile( j, i, this.height ) )
        }
    }
    bombs() {
        marker: for ( let i = 0; i < this.markers; ) {
            const x = Math.floor( Math.random() * this.width )
            const y = Math.floor( Math.random() * this.height )

            const [ k, j ] = this.firstClick 

            if ( this.board[ y ][ x ].mine ) continue 
            for ( let dx = -1; dx <= 1; dx++ ) for ( let dy = -1; dy <= 1; dy++ ) if ( x == dx + k && y == dy + j ) continue marker
            for ( let dx = -1; dx <= 1; dx++ ) for ( let dy = -1; dy <= 1; dy++ ) if ( x + dx >= 0 && x + dx < this.width && y + dy >= 0 && y + dy < this.height ) this.board[ y + dy ][ x + dx ].int++
            this.board[ y ][ x ].mine = true
            this.mines.push( [ x, y ] )
            i++
        }

        game.get( 'buttons' ).set( 'flag', new SelectedTool( 1466, canvas.height * 0.5, `🚩 ${game.get( 'board' ).markers}` ) )
    }
    reveal( x, y ) {
        if ( this.over ) return
        const tile = this.board[ y ][ x ]
        let flagged = 0

        if ( this.flag ) if ( tile.hidden ) {
            tile.flag = !tile.flag
            this.markers += tile.flag ? -1 : 1
            return game.get( 'buttons' ).get( 'flag' ).text = `🚩${this.markers}`
        }

        if ( tile.flag ) return
        if ( tile.mine ) return this.gameOver()

        tile.hidden = false

        if ( tile.int == 0 ) for ( let dx = -1; dx <= 1; dx++ ) for ( let dy = -1; dy <= 1; dy++ ) if ( x + dx >= 0 && x + dx < this.width && y + dy >= 0 && y + dy < this.height ) if ( this.board[ y + dy ][ x + dx ].hidden ) this.reveal( x + dx, y + dy )
        if ( tile.int > 0 ) for ( let dx = -1; dx <= 1; dx++ ) for ( let dy = -1; dy <= 1; dy++ ) if ( x + dx >= 0 && x + dx < this.width && y + dy >= 0 && y + dy < this.height ) if ( this.board[ y + dy ][ x + dx ].flag ) flagged++

        if ( !this.flag && flagged == tile.int && tile.int != 0 ) for ( let dx = -1; dx <= 1; dx++ ) for ( let dy = -1; dy <= 1; dy++ ) if ( x + dx >= 0 && x + dx < this.width && y + dy >= 0 && y + dy < this.height ) {
            if ( this.board[ y + dy ][ x + dx ].mine && !this.board[ y + dy ][ x + dx ].flag ) return this.gameOver()
            if ( this.board[ y + dy ][ x + dx ].int == 0 ) { this.reveal( x + dx, y + dy ); continue }
            if ( !this.board[ y + dy ][ x + dx ].flag && this.board[ y + dy ][ x + dx ].hidden ) this.board[ y + dy ][ x + dx ].hidden = false 
        }
    }
    gameOver() {
        for ( const [ x, y ] of this.mines ) { this.board[ y ][ x ].hidden = false, this.board[ y ][ x ].flag = false}
        this.over = true
    }
    update() {
        for ( let i = 0; i < this.height; i++ ) for ( let j = 0; j < this.width; j++ ) this.board[ i ][ j ].update()
    }
}
class Tile {
    constructor( x, y, height ) {
        this.size = 952 / height
        this.x = 484 + this.size * x
        this.y = 64 + this.size * y
        this.hidden = true
        this.mine = false
        this.flag = false
        this.int = 0
    }
    update() {
        if ( this.hidden ) ctx.fillStyle = '#bfe17d'
        if ( this.mine && !this.hidden ) ctx.fillStyle = '#db3236'
        if ( !this.mine && !this.hidden ) ctx.fillStyle = '#e5c29f'
        
        ctx.fillRect( this.x + 1, this.y + 1, this.size - 2, this.size - 2 )

        ctx.font = `20px Itim`
        ctx.fillStyle = '#1976d2'
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'

        if ( this.flag ) ctx.fillText( '🚩', this.x + this.size / 2, this.y + this.size / 2 )
        if ( !this.mine && !this.hidden && this.int != 0 ) ctx.fillText( this.int, this.x + this.size / 2, this.y + this.size / 2 )
    }
}
class SelectedTool {
    constructor( x, y, text, selected = false ) {
        ctx.font = `50px Itim`

        this.selected = selected
        this.text = text
        this.x = x
        this.y = y
        this.width = ctx.measureText( text ).width + 40
        this.height = 70
        this.stroke = 10
    }
    update() {
        if ( this.selected ) {
            ctx.fillStyle = 'white'
            ctx.beginPath();
            ctx.roundRect( this.x, this.y, this.width, this.height, [ this.height / 2 / 2 ] )
            ctx.fill();
        }

        ctx.fillStyle = 'black'
        ctx.beginPath();
        ctx.roundRect( this.x + this.stroke / 2, this.y + this.stroke / 2, this.width - this.stroke, this.height - this.stroke, [ ( this.height - this.stroke ) / 2 / 2 ] );
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.roundRect( this.x + this.stroke / 2, this.y + this.stroke / 2, this.width - this.stroke, this.height - this.stroke, [ ( this.height - this.stroke ) / 2 / 2 ] );
        ctx.clip();
        ctx.font = `50px Itim`
        ctx.fillStyle = 'white'
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx.fillText( this.text, this.x + this.width / 2, this.y + this.height / 2 )
        ctx.restore();
    }
}

import { game, ctx, Button } from '../main.js'

export function execute() {
    game.set( 'board', new Minesweeper( 3 ) )
    game.set( 'buttons', new Map( [
        [ 'mining', new SelectedTool( 1466, canvas.height * 0.4, '⛏️', true ) ]
    ] ) )
    game.set( 'button', new Button( 30, 30, 10, 'Return' ) )
}

export function onMouseDown( event ) {
    event.preventDefault();
    
    const rect = canvas.getBoundingClientRect()

    const x = ( event.clientX - rect.left ) * 1920 / rect.width
    const y = ( event.clientY - rect.top ) * 1080 / rect.height

    if ( event.button == 2 ) {
        game.get( 'board' ).flag = true

        for ( let i = 0; i < game.get( 'board' ).height; i++ ) for ( let j = 0; j < game.get( 'board' ).width; j++ ) {
            const tile = game.get( 'board' ).board[ i ][ j ]
            
            if ( x > tile.x && x < tile.x + tile.size && y > tile.y && y < tile.y + tile.size ) {
                if ( !game.get( 'board' ).firstClick ) {
                    game.get( 'board' ).firstClick = [ j, i ]
                    game.get( 'board' ).bombs()
                }
                game.get( 'board' ).reveal( j, i )
            }
        }
    
        game.get( 'board' ).flag = false
        return
    }

    if ( game.get( 'buttons' ).has( 'flag' ) ) game.get( 'board' ).flag = game.get( 'buttons' ).get( 'flag' ).selected
    
    for ( const [ name, button ] of [ ...game.get( 'buttons' ).entries() ] ) if ( x > button.x && x < button.x + button.width && y > button.y && y < button.y + button.height ) {
        for ( const key of [ ...game.get( 'buttons' ).keys() ] ) if ( key != name ) game.get( 'buttons' ).get( key ).selected = false
        button.selected = true
    }
    for ( let i = 0; i < game.get( 'board' ).height; i++ ) for ( let j = 0; j < game.get( 'board' ).width; j++ ) {
        const tile = game.get( 'board' ).board[ i ][ j ]
        
        if ( x > tile.x && x < tile.x + tile.size && y > tile.y && y < tile.y + tile.size ) {
            if ( !game.get( 'board' ).firstClick ) {
                game.get( 'board' ).firstClick = [ j, i ]
                game.get( 'board' ).bombs()
            }
            game.get( 'board' ).reveal( j, i )
        }
    }
}