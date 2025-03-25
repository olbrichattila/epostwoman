start:
	npm run electron-start
package:
	npm run electron-build
	npm run dist
ubuntu-purge:
	sudo dpkg --purge postwoman

