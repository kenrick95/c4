# Deployment notes

## To GitHub Pages
```
git checkout gh-pages
git merge master
yarn
yarn workspace @kenrick95/c4-browser run build-gh-pages
rm index.html
rm -rf dist/
mv browser/dist/ dist/
mv dist/index.html index.html
```

## To Heroku

No action needed. Automatically deployed on master branch

## To npm

Publishing [@kenrick95/c4](https://www.npmjs.com/package/@kenrick95/c4)

```
yarn workspace @kenrick95/c4 run build
yarn workspace @kenrick95/c4 publish
```
