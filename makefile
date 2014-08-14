setup:
	git submodule update --init
	npm install

watch: setup

	./node_modules/.bin/polvo -ws

release: setup
	./node_modules/.bin/polvo -r