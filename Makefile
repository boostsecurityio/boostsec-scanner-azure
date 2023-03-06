PROJECT_ROOT ?= $(shell git rev-parse --show-toplevel)

include ${PROJECT_ROOT}/.makefiles/Makefile

#
# variables
#
CI               ?=
CI_PULL_REQUEST  ?=
CIRCLE_BRANCH    ?=
CIRCLE_TAG       ?=

SRCDIR ?= source
DSTDIR ?= BoostSecurityScan

build: ## build release package
build: .phony clean
	mkdir -p ${DSTDIR}
	pushd ${SRCDIR} > /dev/null && npx tsc
	mkdir -p ${DSTDIR}/dist
	cp -r ${SRCDIR}/dist/src ${DSTDIR}/dist/
	cp -r ${SRCDIR}/task.json ${DSTDIR}/
	cp -r ${SRCDIR}/package* ${DSTDIR}/
	pushd ${DSTDIR} > /dev/null && npm install --omit=dev

package.dev: ## package dev release
package.dev:
	npx tfx-cli extension create --manifest-globs vss-extension.dev.json --rev-version

package.prod: ## package prod release
package.prod:
	npx tfx-cli extension create --manifest-globs vss-extension.json --rev-version

test: ## run tests
test:
	pushd ${SRCDIR} > /dev/null && npm run test

test.ci: ## run tests in ci
test.ci:
	pushd ${SRCDIR} > /dev/null && npm run test-ci

clean: ## clean dist
clean: .phony
	rm -rf ${SRCDIR}/dist
	rm -rf ${DSTDIR}
	rm -rf tmp
	rm -rf *.vsix

unpack: ## unpack package
unpack: clean
	mkdir -p tmp
	mv BoostSecurity.BoostSecurityScan-*.vsix tmp/data.zip
	cd tmp && unzip data.zip
