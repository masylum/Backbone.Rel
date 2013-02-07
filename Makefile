NODE = node

test:
	./node_modules/.bin/mocha --reporter spec test/test

.PHONY: test
