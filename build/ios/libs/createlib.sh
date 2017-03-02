DIR="$(dirname "${BASH_SOURCE[0]}" )"
cd $DIR
find . -name "*.zip" | sed 's/.\///' | xargs -n 1 unzip
find . -name "*.a" | sed 's/.\///' |  xargs -n4 libtool -o libcloudbridge.a -static
rm *.zip
find . -not -name "libcloudbridge.a" -name "*.a" | xargs rm
