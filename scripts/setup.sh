openssl req -x509 -newkey rsa:4096 -days 365 \
  -nodes \
  -keyout localhost-key.pem \
  -out localhost.pem \
  -subj "/CN=localhost"
