# andrisaniAdminApp


WEBPACK 

>npm run build
(to run Webpack)


https://github.com/marmelab/ng-admin


CLI
---

The code used for custom fields needs to be processed by browserify and babelify, so in root folder of repo run this command: 

`watchify main.js -t babelify -o build/bundle.js --poll=true`