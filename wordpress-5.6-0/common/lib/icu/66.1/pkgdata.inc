GENCCODE_ASSEMBLY_TYPE=-a gcc
SO=so
SOBJ=so
A=a
LIBPREFIX=lib
LIB_EXT_ORDER=.66.1
COMPILE=gcc -DAI_ADDRCONFIG=0 -I/bitnami/lamp74stack-linux-x64/output/sqlite/include -I/bitnami/lamp74stack-linux-x64/output/mysql/include -I/home/emmanoe/App/wordpress-5.6-0/common/include -I/home/emmanoe/App/wordpress-5.6-0/common/include/sasl -I/home/emmanoe/App/wordpress-5.6-0/common/include -D_REENTRANT  -DU_HAVE_ELF_H=1 -DU_HAVE_STRTOD_L=1 -DU_HAVE_XLOCALE_H=1  -DU_ATTRIBUTE_DEPRECATED= -I/bitnami/lamp74stack-linux-x64/output/mysql/include -I/home/emmanoe/App/wordpress-5.6-0/common/include -fPIC -m64 -std=c11 -Wall -pedantic -Wshadow -Wpointer-arith -Wmissing-prototypes -Wwrite-strings   -c
LIBFLAGS=-I/home/emmanoe/App/wordpress-5.6-0/common/include -DPIC -fPIC
GENLIB=gcc -I/bitnami/lamp74stack-linux-x64/output/mysql/include -I/home/emmanoe/App/wordpress-5.6-0/common/include -fPIC -m64 -std=c11 -Wall -pedantic -Wshadow -Wpointer-arith -Wmissing-prototypes -Wwrite-strings   -L/bitnami/lamp74stack-linux-x64/output/sqlite/lib -L/bitnami/lamp74stack-linux-x64/output/mysql/include -L/home/emmanoe/App/wordpress-5.6-0/common/lib  -shared -Wl,-Bsymbolic
LDICUDTFLAGS=-nodefaultlibs -nostdlib
LD_SONAME=-Wl,-soname -Wl,
RPATH_FLAGS=
BIR_LDFLAGS=-Wl,-Bsymbolic
AR=ar
ARFLAGS=r
RANLIB=ranlib
INSTALL_CMD=/bin/install -c
