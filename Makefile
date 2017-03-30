build:
	npm run build
deploy:
	cp -a ./_site/* ../remote/; \
	cd ../remote; \
	git add -A; \
	git cm -am 'deploy'; \
	git push -u origin master; \
	cd ../static/; \
	git add -A; \
	git cm -am 'update'; \
	git push -u origin master
