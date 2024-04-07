import { game, switchScript, Button, Title } from '../main.js'

export function execute() {
    game.set( 'buttons', new Map( [
        [ 'merchant', new Button( canvas.width / 2, canvas.height * 0.4, 10, '💰Shop', 'center' ) ],
        [ 'fish', new Button( canvas.width / 2, canvas.height * 0.5, 10, '🎣Fish', 'center' ) ],
        [ 'pengsweep', new Button( canvas.width / 2, canvas.height * 0.6, 10, '🐧Pengsweep', 'center' ) ]
    ] ) )
    game.set( 'title', new Title( canvas.width / 2, canvas.height * 0.1, 'Pingu\'s Games!', 'white', 80, 'center', 'middle' ) )
}

export function onMouseDown( event ) {
    for ( const key of [ ...game.get( 'buttons' ).keys() ] ) {
        const rect = canvas.getBoundingClientRect()
        const button = game.get( 'buttons' ).get( key )

        const x = ( event.clientX - rect.left ) * 1920 / rect.width
        const y = ( event.clientY - rect.top ) * 1080 / rect.height

        if ( x > button.x && x < button.x + button.width && y > button.y && y < button.y + button.height ) switchScript( key )
    }
}