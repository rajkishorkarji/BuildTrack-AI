#!/usr/bin/env bash
# ==============================================================================
# BuildTrack AI - Oracle Cloud Infrastructure (OCI) Free Tier Deployment Script
# ==============================================================================
set -e

echo "=========================================================="
echo " Starting BuildTrack AI Deployment on Oracle Cloud Free Tier"
echo "=========================================================="

# 1. Update package lists
echo "[1/6] Updating system packages..."
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release iptables-persistent openjdk-21-jdk maven git

# 2. Open Local Firewall Ports (Port 80 & 443)
# Oracle Cloud Ubuntu images include strict local iptables rules by default.
echo "[2/6] Configuring OS firewall rules for HTTP (80) and HTTPS (443)..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 1 -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save 2>/dev/null || true

# 3. Install Docker and Docker Compose plugin if not already installed
echo "[3/6] Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    sudo usermod -aG docker "$USER"
    echo "Docker installed successfully."
fi

# Ensure docker service is running
sudo systemctl enable --now docker

# 4. Prepare .env file if it doesn't exist
echo "[4/6] Setting up environment configuration..."
if [ ! -f .env ]; then
    cp .env.example .env
    # Generate a secure random JWT secret
    RANDOM_JWT=$(openssl rand -base64 48 | tr -d '\n')
    sed -i "s|replace-with-a-strong-base64-secret|${RANDOM_JWT}|g" .env
    
    # Detect public IP
    PUBLIC_IP=$(curl -s https://ifconfig.me || curl -s https://api.ipify.org || echo "localhost")
    sed -i "s|http://localhost|http://${PUBLIC_IP}|g" .env
    echo ".env created with auto-detected Public IP: http://${PUBLIC_IP}"
fi

# 5. Build Backend & Gateway JARs
echo "[5/6] Building Backend and Gateway JAR packages..."
echo "--> Building Backend..."
mvn clean package -DskipTests -f backend/pom.xml

echo "--> Building Gateway..."
mvn clean package -DskipTests -f gateway/pom.xml

# 6. Start Docker Containers
echo "[6/6] Launching BuildTrack AI with Docker Compose..."
# Use sudo docker if user group isn't reloaded yet in this session
if docker info >/dev/null 2>&1; then
    DOCKER_CMD="docker"
else
    DOCKER_CMD="sudo docker"
fi

$DOCKER_CMD compose up --build -d

echo ""
echo "=========================================================="
echo " BuildTrack AI deployed successfully!"
echo " Containers status:"
$DOCKER_CMD compose ps
echo "=========================================================="
echo " Access your application at:"
PUBLIC_IP=$(curl -s https://ifconfig.me 2>/dev/null || echo "<YOUR_ORACLE_PUBLIC_IP>")
echo "   URL: http://${PUBLIC_IP}"
echo "   Super Admin: admin@buildtrack.ai"
echo "=========================================================="
