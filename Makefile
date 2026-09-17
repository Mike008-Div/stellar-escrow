.PHONY: help test build clippy fmt all

help:
	@echo "make test   - run contract tests"
	@echo "make build  - build release wasm"
	@echo "make clippy - run clippy"
	@echo "make fmt    - check formatting"
	@echo "make all    - fmt + clippy + test + build"

test:
	cd contracts/escrow && cargo test

build:
	cd contracts/escrow && cargo build --target wasm32v1-none --release

clippy:
	cd contracts/escrow && cargo clippy --all-targets -- -D warnings

fmt:
	cd contracts/escrow && cargo fmt --check

verify:
	bash scripts/verify-build.sh

all: fmt clippy test build
