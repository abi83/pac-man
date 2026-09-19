.PHONY: test build

test: node_modules
	npm test

build: node_modules
	npm run build

# Coding agents can only run `make test`/`make build`, not a bare `npm
# install` — keep dependency install inside these targets so both stay
# self-sufficient on a fresh checkout.
node_modules: package.json
	npm install
	@touch node_modules
