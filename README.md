### `Install scripts for docker`

force git to use https
```shell
git config --global url."https://".insteadOf git+ssh:// &&
git config --global url."https://".insteadOf git:// &&
git config --global url."https://".insteadOf ssh:// &&
git config --global url."https://github.com/".insteadOf git@github.com
```


Nodejs
```shell
# Using Ubuntu
curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
sudo apt-get install -y nodejs

npm config set prefix ~/npm
export PATH="$PATH:$HOME/npm/bin"

# Using Debian, as root
curl -sL https://deb.nodesource.com/setup_13.x | bash -
apt-get install -y nodejs
```

offical script
```shell
curl -fsSL get.docker.com -o get-docker.sh
curl -sL https://get.docker.com | sudo -E bash -
```
own version for ubuntu
```shell
curl -sL https://raw.githubusercontent.com/anzerr/deploy/master/docker.sh | sudo -E bash -
```
docker-compose
```shell
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```
fast setup
```shell
curl -sL https://raw.githubusercontent.com/anzerr/deploy/master/tool.sh | sudo -E bash -
```

### `use git token on npm`
```shell
GITHUB_AUTH_TOKEN='cat' && \
git config --global --add url."https://$GITHUB_AUTH_TOKEN:x-oauth-basic@github.com".insteadOf https://git@github.com && \
git config --global --add url."https://$GITHUB_AUTH_TOKEN:x-oauth-basic@github.com".insteadOf ssh://git@github.com
```

### `Bootstrap project`
```shell
curl -sL https://raw.githubusercontent.com/anzerr/deploy/master/project.sh | bash -
```

### `Install scripts for kube`
```shell
curl -sL https://raw.githubusercontent.com/anzerr/deploy/master/kube.sh | sudo -E bash -
```

### `Create cluster`
```shell
sudo kubeadm init --pod-network-cidr=10.244.0.0/16
```

create flannel network layer
```shell
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/v0.10.0/Documentation/kube-flannel.yml
```

deploy dashboard
```shell
kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/recommended/kubernetes-dashboard.yaml
kubectl describe services kubernetes-dashboard --namespace=kube-system
kubectl proxy
```

create user
```shell
curl -sL https://raw.githubusercontent.com/anzerr/deploy/master/admin.sh | bash -
```
