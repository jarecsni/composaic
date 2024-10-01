cd ../node_modules
echo "Creating symlinks for composaic-demo"
echo "Current folder: $(pwd)"
echo "erasing folders"
rm -rf react
rm -rf react-dom
rm -rf react-router
rm -rf react-router-dom
echo "Creating symlinks"
ln -s ../../composaic-demo/node_modules/react react
ln -s ../../composaic-demo/node_modules/react-dom react-dom
ln -s ../../composaic-demo/node_modules/react-router react-router
ln -s ../../composaic-demo/node_modules/react-router-dom react-router-dom
cd ..
echo "Symlinks created"