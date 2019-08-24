curl -sL https://deb.nodesource.com/setup_11.x | bash -
apt-get install -y nodejs
curl -sL https://get.docker.com  | bash -
curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
echo "sudo usermod -aG docker $USER"