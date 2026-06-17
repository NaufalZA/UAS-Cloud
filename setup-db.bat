@echo off
echo Mengatur VM Database...
call gcloud.cmd compute ssh vm-nops-db --zone=asia-southeast2-a --command="mkdir -p ~/uascloud/database"
call gcloud.cmd compute scp docker-compose.db.yaml vm-nops-db:~/uascloud/docker-compose.yaml --zone=asia-southeast2-a
call gcloud.cmd compute scp database/init.sql vm-nops-db:~/uascloud/database/init.sql --zone=asia-southeast2-a
call gcloud.cmd compute ssh vm-nops-db --zone=asia-southeast2-a --command="sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2 && cd ~/uascloud && sudo docker compose up -d"
echo Selesai mengatur VM Database!
