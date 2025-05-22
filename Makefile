
clean:
	@rm -rf \
		*.log \
		dist

reset:
	@rm -rf \
		node_modules \
		yarn.lock \
		api/node_modules \
		api/yarn.lock
	
	yarn install
	cd api && yarn install

purge: clean
	@docker compose down

install:
	yarn global add prisma
	npm --global install prisma

certs:
	@# You should plan to run this in bash!
	@cd api && openssl req -x509 -newkey rsa:4096 -days 365 \
		-nodes \
		-keyout localhost-key.pem \
		-out localhost.pem \
		-subj "/CN=localhost"

setup:
	cd api && \
		yarn install && \
		yarn prisma generate

push-db: setup
	@docker run \
		--rm \
		--network banking_banking \
		--env-file .env \
		-v $(PWD)/api:/app \
		-w /app \
		node:latest \
		sh -c "npx prisma db push"

build:
	@docker compose down
	@docker compose build

up: clean
	@touch app.log
	@docker compose up -d database
	@docker compose up api | tee -a app.log

down:
	@docker compose down

prisma: setup push-db
reup: build up push-db
