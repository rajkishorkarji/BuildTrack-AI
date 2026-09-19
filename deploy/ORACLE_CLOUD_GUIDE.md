# Deploying BuildTrack AI on Oracle Cloud Free Tier (Step-by-Step Guide)

Oracle Cloud Infrastructure (OCI) offers one of the most generous **Always Free** tiers in the industry, including up to **4 ARM Ampere OCPUs and 24 GB of RAM**, 200 GB SSD storage, and 10 TB/month free outbound data transfer. This is more than enough to run the complete BuildTrack AI stack (PostgreSQL 16, Kafka, Backend, Gateway, and Frontend).

---

## Prerequisites

1. An Oracle Cloud Infrastructure account ([Sign up for OCI Free Tier](https://www.oracle.com/cloud/free/)).
2. An SSH client on your local computer (e.g. PowerShell `ssh`, Terminal, or PuTTY).

---

## Step 1: Create Your Always-Free Compute Instance

1. Log in to the [Oracle Cloud Console](https://cloud.oracle.com/).
2. In the navigation menu (top-left hamburger), go to **Compute** > **Instances**.
3. Click **Create Instance**.
4. Configure the instance:
   - **Name**: `buildtrack-ai-server`
   - **Compartment**: Select your default root compartment.
   - **Placement**: Leave default Availability Domain.
   - **Image and Shape**:
     - Click **Change Image**: Select **Canonical Ubuntu** > **Ubuntu 22.04 LTS (aarch64)** or **Ubuntu 24.04**.
     - Click **Change Shape**:
       - Select **Ampere (Arm-based Processor)**.
       - Choose **VM.Standard.A1.Flex**.
       - Allocate: **2 to 4 OCPUs** and **12 to 24 GB RAM** (marked with the green *"Always Free Eligible"* badge).
   - **Networking**:
     - Select **Create new virtual cloud network (VCN)** (or use an existing one).
     - Ensure **Assign a public IPv4 address** is set to **Yes**.
   - **Add SSH Keys**:
     - Choose **Generate a key pair for me** and click **Save private key** (save it as `oracle_key.pem` on your PC).
   - **Boot Volume**:
     - Default is 50 GB (Always Free allows up to 200 GB across instances).
5. Click **Create**.
6. Wait 1–2 minutes until the instance state changes to **RUNNING**. Copy your **Public IP Address**.

---

## Step 2: Open Ports 80 & 443 in Oracle Cloud Security List

By default, Oracle Cloud VCN firewalls block all inbound traffic except SSH (Port 22). We must allow HTTP (80) and HTTPS (443):

1. On your instance details page, under **Instance Information**, click your **Subnet** link (e.g. `subnet-xxxx`).
2. Click on the **Default Security List for...**.
3. Under **Ingress Rules**, click **Add Ingress Rules**.
4. Add the following rule for HTTP:
   - **Source Type**: CIDR
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: TCP
   - **Destination Port Range**: `80`
   - **Description**: `Allow HTTP traffic for BuildTrack AI`
5. Click **+ Another Ingress Rule** to add HTTPS:
   - **Source Type**: CIDR
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: TCP
   - **Destination Port Range**: `443`
   - **Description**: `Allow HTTPS traffic for BuildTrack AI`
6. Click **Add Ingress Rules**.

---

## Step 3: Connect to Your Instance via SSH

Open PowerShell (Windows) or Terminal (Mac/Linux) on your computer:

```bash
# Set proper permissions on your private key (Windows PowerShell: skip chmod, Mac/Linux: run chmod)
chmod 400 path/to/oracle_key.pem

# Connect to the instance (replace <PUBLIC_IP> with your Oracle VM's public IP)
ssh -i path/to/oracle_key.pem ubuntu@<PUBLIC_IP>
```

---

## Step 4: Clone & Deploy with 1 Command

Once logged into your Oracle VM terminal:

```bash
# 1. Clone your project repository
git clone https://github.com/<your-username>/BuildTrack-AI.git
cd BuildTrack-AI

# 2. Make the automated setup script executable
chmod +x deploy/oracle-setup.sh

# 3. Run the deployment script
./deploy/oracle-setup.sh
```

### What `oracle-setup.sh` does automatically:
1. Installs OpenJDK 21, Maven, Git, Docker, and Docker Compose plugin.
2. Configures the internal Ubuntu `iptables` firewall to allow traffic through ports 80 and 443.
3. Automatically detects your VM's public IP and generates a `.env` file with a secure random JWT secret.
4. Compiles the Java backend and gateway JARs.
5. Launches all 5 Docker containers (`backend`, `gateway`, `frontend`, `database`, `kafka`).

---

## Step 5: Verify Deployment

Check that all containers are healthy:
```bash
docker compose ps
```

You should see:
- `buildtrack-ai-backend-1` (healthy)
- `buildtrack-ai-frontend-1` (running on port 80)
- `buildtrack-ai-gateway-1` (healthy)
- `buildtrack_ai_db` (healthy)
- `buildtrack_ai_kafka` (healthy)

Now open your web browser and navigate to:
```
http://<YOUR_ORACLE_PUBLIC_IP>
```

### Default Credentials:
- **Email**: `admin@buildtrack.ai`
- **Password**: `ChangeMeNow!123` (or the password configured in your `.env`)

---

## Step 6: Configure Google OAuth2 for Production (Optional)

If you want users to log in with Google on your Oracle Cloud server:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) > **APIs & Services** > **Credentials**.
2. Select your OAuth 2.0 Client ID.
3. Under **Authorized JavaScript origins**, add:
   - `http://<YOUR_ORACLE_PUBLIC_IP>` (or `https://yourdomain.com`)
4. Under **Authorized redirect URIs**, add:
   - `http://<YOUR_ORACLE_PUBLIC_IP>/login/oauth2/code/google` (or `https://yourdomain.com/login/oauth2/code/google`)
5. Click **Save**.
6. On your Oracle VM, edit `.env` and set:
   ```bash
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```
7. Restart the backend container:
   ```bash
   docker compose up -d backend
   ```

---

## Step 7: Adding a Custom Domain & Free HTTPS / SSL (Optional)

To secure your installation with free Let's Encrypt SSL (`https://yourdomain.com`):

1. Point your domain's DNS `A` record to your Oracle VM's Public IP.
2. Install Certbot on the VM:
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   ```
3. Follow the standard Let's Encrypt setup or use Certbot in standalone mode to generate certificates and mount them into Nginx.
