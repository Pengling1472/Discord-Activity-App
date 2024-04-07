import { defineConfig } from 'vite';

export default defineConfig( {
	envDir: '../',
	server: {
		proxy: {
			'/api': {
				target: 'https://discord-activity-app.onrender.com:3000',
				changeOrigin: true,
				secure: false,
				ws: true
			},
			'/getUserData': {
				target: 'https://discord-activity-app.onrender.com:3000',
				changeOrigin: true,
				secure: false,
				ws: true
			}
		},
		hmr: false
	}
} );