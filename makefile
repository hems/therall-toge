setup:
	git submodule update --init
	npm install

watch: setup

	./node_modules/.bin/polvo -ws

release: setup
	./node_modules/.bin/polvo -r

publish:
	make release
	-cd public && git commit -am 'latest build'
	-cd public && git push origin gh-pages
	-git add public
	-git commit -m 'latest build'

	open https://hems.github.io/therall-toge/