# Deployment notes

## To npm

Publishing [@kenrick95/c4](https://www.npmjs.com/package/@kenrick95/c4)

NOTE:

0. Check for package.json fields error

   ```
   yarn workspace @kenrick95/c4 check-package-json
   ```

1. Bump version

   ```
   yarn workspace @kenrick95/c4 version <major|minor|patch>
   ```
2. Commit + tag
    ```
    git commit -m "vx.x.x"
    git tag vx.x.x
    ```
3. Publish to npm
   ```
   yarn workspace @kenrick95/c4 npm publish
   ```
