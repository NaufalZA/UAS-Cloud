kubectl run -i --tty load-generator --rm --image=busybox:1.28 --restart=Never -- /bin/sh -c "while true; do wget -q -O- http://uascloud-backend-service > /dev/null 2>&1; done"

kubectl get hpa uascloud-backend-hpa --watch
