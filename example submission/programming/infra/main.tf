locals {
  env                 = terraform.workspace
  name                = "${local.env}-${var.app_name}"
  project_id          = var.project_id
  database_name       = var.database_name
  database_username   = var.database_username
  database_password   = var.database_password
  database_auto_pause = var.database_auto_pause
  region              = var.region
  zone                = var.zone
  rsa                 = var.ssh_rsa
  user_ssh            = var.ssh_rsa_user
  tags = {
    App         = local.name
    Environment = local.env
    Terraform   = true
  }
}

provider "google" {
  credentials = file("gcp.json")
  project     = local.project_id
  region      = local.region
}

# resource "google_compute_project_metadata" "ssh-gcp" {
#   metadata {
#     ssh-keys = "${local.user_ssh}:${local.rsa}"
#   }
# }

resource "google_compute_network" "api_network" {
  name                    = "api-network"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "api_subnetwork" {
  name          = "api-subnetwork"
  ip_cidr_range = "10.0.0.0/24"
  region        = local.region
  network       = google_compute_network.api_network.name
}

resource "google_compute_firewall" "api_firewall" {
  name      = "api-firewall"
  network   = google_compute_network.api_network.name
  direction = "INGRESS"
  priority  = 1000

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "9999","22","9079"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["api-server"]
}

resource "google_compute_address" "api_static_ip" {
  name   = "api-static-ip"
  region = local.region
}

# resource "google_compute_forwarding_rule" "api_forwarding_rule" {
#   name = "api-forwarding-rule"
#   region = local.region
#   ip_address = google_compute_address.api_static_ip.address
#   target = google_compute_target_http_proxy.api_target_http_proxy.self_link
#   port_range = "80"
# }


resource "google_compute_instance" "gci" {
  name         = "be-instance"
  machine_type = "f1-micro"
  zone         = local.zone
  tags         = ["api-server"]

  boot_disk {
    initialize_params {
      image = "ubuntu-1804-bionic-v20230112"
    }
  }

  metadata = {
    ssh-keys = "${local.user_ssh}:${local.rsa}"
  }

  # metadata_startup_script = "sudo apt-get update; sudo apt-get install cmdtest; sudo apt-get install -y build-essential libssl-dev; curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash; source ~/.bashrc; nvm install 16; nvm use 16; sudo apt-get install -y nodejs; sudo apt-get install -y npm; npm i -g ts-node; git clone https://github.com/sr4p/be-chomchob.git; cd be-chomchob; git checkout dev; rm package-lock.json; npm install; npx kill-port 9999 -f; npm run start"
  network_interface {
    subnetwork = google_compute_subnetwork.api_subnetwork.name

    access_config {
      nat_ip = google_compute_address.api_static_ip.address
    }
  }
}

resource "google_sql_database_instance" "gsql-test" {
  name              = "be-postgresql"
  database_version  = "POSTGRES_12"
  region            = local.region
  settings {
    tier = "db-f1-micro"
    ip_configuration {
      authorized_networks {
        value = "0.0.0.0/0"
      }
      ipv4_enabled = true
    }
    # ip_configuration {
    #   ipv4_enabled    = true
    #   private_network = google_compute_network.api_network.id
    # }
  }
  
  root_password = local.database_password

}

resource "google_sql_database" "chomchob_db" {
  name     = local.database_name
  instance = google_sql_database_instance.gsql-test.name
}
