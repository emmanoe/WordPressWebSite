#!/bin/sh
LDFLAGS="-L/home/emmanoe/App/wordpress-5.6-0/common/lib $LDFLAGS"
export LDFLAGS
CFLAGS="-I/home/emmanoe/App/wordpress-5.6-0/common/include/ImageMagick -I/home/emmanoe/App/wordpress-5.6-0/common/include $CFLAGS"
export CFLAGS
CXXFLAGS="-I/home/emmanoe/App/wordpress-5.6-0/common/include $CXXFLAGS"
export CXXFLAGS
		    
PKG_CONFIG_PATH="/home/emmanoe/App/wordpress-5.6-0/common/lib64/pkgconfig:/home/emmanoe/App/wordpress-5.6-0/common/lib/pkgconfig"
export PKG_CONFIG_PATH
