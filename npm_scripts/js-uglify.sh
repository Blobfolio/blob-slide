#!/bin/bash
#
# NPM: Uglify Tasks
#
# These are a little too cumbersome to deal with inside NPM.
##



# Check dependencies.
command -v uglifyjs >/dev/null 2>&1 || {
	echo -e "\033[31;1mError:\033[0m uglifyjs must be in \$PATH."
	echo -e "\033[96;1mFix:\033[0m npm i uglify-es -g"
	exit 1
}



# Just one file.
uglifyjs -c --ecma 6 -o "blob-slide.min.js" -- "src/blob-slide.js"
echo -e "\033[2mminifying:\033[0m blob-slide.min.js"



# We're done!
echo -e "\033[32;1mSuccess:\033[0m Uglification has completed!"
exit 0
