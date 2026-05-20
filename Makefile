.PHONY: start stop restart dev cv-pdf

start:
	./start_app.sh

stop:
	./end_app.sh

restart:
	./end_app.sh
	./start_app.sh

dev: start

cv-pdf:
	npm run cv:pdf
