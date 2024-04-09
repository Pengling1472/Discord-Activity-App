import * as path from "path";
import { defineConfig } from 'vite';

export default defineConfig( {
	envDir: '../',
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false,
				ws: true
			},
			'/getUserData': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false,
				ws: true
			}
		},
		hmr: false
	},
	resolve: {
		alias: {
		  	"@assets": path.resolve( __dirname, "src/assets" ),
		}
	}
} );