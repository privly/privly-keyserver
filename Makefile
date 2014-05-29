TESTS = test/*.js
STYLE = --reporter spec

MOCHA = node_modules/mocha/bin/mocha

.PHONY: test
test: all

.PHONY: all
all:
	${MOCHA} ${STYLE} ${TESTS}

.PHONY: helpers
helpers:
	${MOCHA} ${STYLE} test/test-helpers.js

.PHONY: index
index:
	${MOCHA} --timeout 5000 ${STYLE} test/test-index.js

.PHONY: search
search:
	${MOCHA} --timeout 5000 ${STYLE} test/test-search.js

.PHONY: store
store:
	${MOCHA} --timeout 5000 ${STYLE} test/test-store.js
