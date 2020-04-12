# Deployment notes

## To GitHub Pages
```
git checkout gh-pages
git merge master
yarn
yarn workspace @kenrick95/c4-browser run build-gh-pages
mv browser/dist/ dist/
mv dist/index.html index.html
```

## To Heroku

No action needed. Automatically deployed on master branch
