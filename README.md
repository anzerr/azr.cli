### `Install scripts for docker`

offical script
```shell
curl -fsSL get.docker.com -o get-docker.sh
```
own version for ubuntu
```shell
curl -sL https://raw.githubusercontent.com/anzerr/deploy/master/docker.sh | sudo -E bash -
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
