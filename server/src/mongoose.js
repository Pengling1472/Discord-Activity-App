import mongoose from 'mongoose';
import Chance from 'chance';
import dotenv from "dotenv";
dotenv.config( { path: '../.env' } );

await mongoose.connect( process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true
} )

const reqString = { type: String, required: true }
const reqDecimal = { type: mongoose.Types.Decimal128, required: true }

const personalModel = mongoose.Schema( {
    _id: reqString,
    name: reqString,
    message: reqString,
    amount: reqDecimal,
    levels: {
        type: Array,
        default: []
    }
} )

const profileModel = mongoose.Schema( {
    _id: reqString,
	user: {
		type: Object,
		default: {
			score: {
				type: Number,
				default: 0
			},
			coins: {
				type: Number,
				default: 0
			},
			level: {
				type: Number,
				default: 1
			},
			xp: {
				type: Number,
				default: 0
			},
			items: {
				type: Array
			}
		}
	},
	orientation: {
		type: Object,
		default: {
			asexuality: reqDecimal,
			straight:   reqDecimal,
			gay:        reqDecimal
		}
	},
	waifu: {
		type: Object,
		default: {
			attractive: reqDecimal,
			teasing:    reqDecimal,
			fashion:    reqDecimal,
			loving:     reqDecimal,
			horny:      reqDecimal,
			cute:       reqDecimal,
			text:       reqString
		}
	},
	games: {
		type: Object,
		default: {}
	}
} )

export const profileSchema = mongoose.model( 'members', profileModel, 'members' )
export const personalSchema = mongoose.model( 'personal', personalModel, 'personal' )

export async function getUserData( userId ) {
    let response = await profileSchema.findById( userId )

    if ( !response ) {
        let straight = Math.floor( Math.random() * 101 );
        let gay = Math.floor( Math.random() * ( 100 - straight ) );
        let asexuality = 100 - ( straight + gay );
        let waifu = new Array();
        let waifuText = [ [
            'is a radiant',
            'is an S-tier',
            'is an A-grade',
            'is a jealousy-inducing',
            'is an underrated',
            'is a cultured',
            'is a perfect',
            'is a tasteful',
            'is an ABSOLUTE',
            'is an EXALTED'
        ], [
            'for being cute online all day',
            'for being a fucking badass',
            'for bashing simps',
            'for being everyone\'s mom',
            'for loving anime',
            'for their sheer babie energy',
            'for being a violent tsundere',
            'for deserving all of the world\'s headpats',
            'for being DUMMY thicc',
            'for kissing their friends',
            'for posting lewds',
            'for being a cuddlebug',
            'for their "activities" on a private account'
        ] ];

        for ( let i = 0; i < 6; i++ ) waifu.push( Chance().weighted( [ 0, 1 ], [ 10, 90 ] ) == 0 ? 30 + ( Math.floor( Math.random() * 5 ) * 10 ) : ( Math.random() * 10 ).toFixed( 1 ) )

        waifu = Chance().shuffle( waifu );
        response = await membersSchema.create( {
            _id: userId,
            user: {
                items: [],
                coins: 50,
                level: 1,
                score: 0,
                xp: 0
            },	
            orientation: {
                asexuality: asexuality,
                straight: straight,
                gay: gay,
                text: straight > 85 ? 'Very Straight'
                    : gay > 85 ? 'Very Gay'
                    : asexuality > 70 ? 'Asexual'
                    : straight > 75 ? 'Pretty Straight'
                    : gay > 75 ? 'Pretty Gay'
                    : straight > 55 ? 'Little Straight'
                    : gay > 55 ? 'Little Gay'
                    : straight > 45 && gay > 45 ? 'Bisexual'
                    : straight > gay ? 'Bisexual but also a little straight'
                    : 'Bisexual but also a little gay'
            },
            waifu: {
                attractive: waifu[ 0 ],
                teasing:    waifu[ 1 ],
                fashion:    waifu[ 2 ],
                loving:     waifu[ 3 ],
                horny:      waifu[ 4 ],
                cute:       waifu[ 5 ],
                text:       `${waifuText[ 0 ][ Math.floor( Math.random() * waifuText.length ) ]} waifu known ${waifuText[ 1 ][ Math.floor( Math.random() * waifuText[ 1 ].length ) ]}.`
            },
            games: {}
        } );

        response.save();
    };

    return response
}

export async function saveDonation( data ) {
    const { from_name, message, amount } = data;

    await personalSchema.findByIdAndUpdate( 0, {
        name: from_name,
        message,
        amount
    }, { upsert: true } )
}

export async function saveLevel( data ) {
    await personalSchema.findByIdAndUpdate( 0, {
        $push: {
            "levels": data
        }
    }, { upsert: true } )
}