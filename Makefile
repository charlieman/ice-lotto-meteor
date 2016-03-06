.PHONY: build

build:
	rm -rf ./.build
	mkdir ./.build
	meteor build ./.build --directory
