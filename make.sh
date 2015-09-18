#!/bin/env sh
#npm install
rm -r build testbuild
mkdir build -p
cp src/* build/ -R
cp node_modules/angular/angular.min.js build/js/lib/
cp node_modules/angular-route/angular-route.min.js build/js/lib
pushd build > /dev/null
zip ONotes.zip * -r > /dev/null
popd > /dev/null
cp build testbuild -R
sed 's/O Notes/O Notes-testing/' testbuild/manifest.webapp -i
echo "#header {\
	background: red;\
}" >> testbuild/css/main.css
#for  x in testbuild/icons/icon*; do
#	mogrify -annotate 200x200 hoj $x
#done
