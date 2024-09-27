cd ../node_modules
echo "Creating symlinks for composaic-demo"
echo "Current folder: $(pwd)"
ln -s ../../composaic-demo/node_modules/react react
ln -s ../../composaic-demo/node_modules/react-dom react-dom
ln -s ../../composaic-demo/node_modules/react-router react-router
ln -s ../../composaic-demo/node_modules/react-router-dom react-router-dom
cd ..