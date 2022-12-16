# How to deploy this to Google Cloud

If you want to deploy this app, you have many options. I chose [Google Cloud](https://cloud.google.com/). This is how I did(Obviously, you can chose other way even on this very platform).

To be short, my setup works like:

1. Cloud Build runs when triggered by pre-defined repository events.
2. Builders run unit/integration tests before image build.
3. If passed the tests, builders build frontend/api app images and push them to Container Registry in Artifact Registry.
4. When images built successfully, Cloud Function update deployment manifest of Google Kubernetes Engine containers on which frontend/api apps run, and Kubernetes schedules and execute the update(Cloud Build events are notified to Cloud Function through Sub/Pub).
5. Some services on Kubernetes take care of required chores to make this project work, like: securely connect api to database / expose frontend/api to the internet through HTTPS protocol.

*This setup is based on a great article: [A Better Approach to Google Cloud Continuous Deployment](https://www.toptal.com/devops/better-google-cloud-continuous-deployment)*

## Table of contents

- [How to deploy this to Google Cloud](#how-to-deploy-this-to-google-cloud)
  - [Table of contents](#table-of-contents)
  - [Steps](#steps)
    - [Create project](#create-project)
    - [Setup database](#setup-database)
      - [Create Cloud SQL Instance](#create-cloud-sql-instance)
      - [Connect to the database](#connect-to-the-database)
      - [Initialize database](#initialize-database)
    - [Setup image builders](#setup-image-builders)
      - [Setup Container Registry in Artifact Registry](#setup-container-registry-in-artifact-registry)
      - [Setup Cloud Build](#setup-cloud-build)
      - [Create trigger for frontend](#create-trigger-for-frontend)
      - [Create trigger for api](#create-trigger-for-api)
      - [Try first run](#try-first-run)
    - [Deploy app images on kubernetes cluster](#deploy-app-images-on-kubernetes-cluster)
      - [Create kubernetes cluster to which the apps will be deployed](#create-kubernetes-cluster-to-which-the-apps-will-be-deployed)
      - [Try first deploy](#try-first-deploy)
        - [Frontend first deployment](#frontend-first-deployment)
        - [API first deployment](#api-first-deployment)
          - [Set Secrets for API using Kubernetes Secrets](#set-secrets-for-api-using-kubernetes-secrets)
          - [Give api the permission to access database](#give-api-the-permission-to-access-database)
      - [Expose services](#expose-services)
        - [Get domain](#get-domain)
        - [Create access control policy](#create-access-control-policy)
        - [Apply services to expose](#apply-services-to-expose)
        - [Redirect HTTP access to HTTPS](#redirect-http-access-to-https)
    - [Setup Cloud Functions to deploy built images automatically](#setup-cloud-functions-to-deploy-built-images-automatically)
      - [Create Pub/Sub topic](#create-pubsub-topic)
      - [Get updater code to run on Cloud Functions](#get-updater-code-to-run-on-cloud-functions)
      - [Create Cloud Functions for frontend/api](#create-cloud-functions-for-frontendapi)
  - [Wrap up](#wrap-up)

## Steps

*I fixed some names to avoid making explanation more complex than needed. You can change them as you want, but you need to be careful to make everything works.*

### Create project

Just create new project. No tricks here.

### Setup database

#### Create Cloud SQL Instance

Create a Cloud SQL Instance. Make sure:

- Choose `MySQL` as database engine.
- Enable the Compute Engine API.
- Enter `db` as `Instance ID` and `<your-mysql-server-root-password>` as `MYSQL_ROOT_PASSWORD`.
- Make sure `Public IP` to be checked in `Connections` section.

#### Connect to the database

Connect to the remote database from your local terminal through Cloud SQL Auth proxy. When the proxy runs, you can access remote database like local one.
See [this document](https://cloud.google.com/sql/docs/mysql/connect-admin-proxy).

#### Initialize database

When you are connecting to the Cloud SQL instance, run following commands in order:

```sh
mysql> source ./db/init/1-init-database.sql
```

```sql
mysql> CREATE USER markdown_editor_app IDENTIFIED BY '<password-for-app-as-a-database-user>';
```

```sql
mysql> GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE \
  ON markdown_editor.* \
  TO markdown_editor_app;
```

*This is granting required privileges to the app as a database user.*

```sh
mysql> source ./db/init/3-init-tables.sql
```

```sh
mysql> source ./db/init/4-init-user-procedures.sql
```

```sh
mysql> source ./db/init/5-init-document-procedures.sql
```

### Setup image builders

We are setting up image builders to build frontend/api app images to run on Google Kubernetes Engine.

#### Setup Container Registry in Artifact Registry

Setup the place where we store built frontend/api app images.

- Enable Artifact Registry API.
- Create gcr.io repositories in Artifact Registry.
- Click `ROUTE TO ARTIFACT REGISTRY`(If the button is disabled and the message appears on hover says you need permissions, get permissions following [this instruction](https://cloud.google.com/artifact-registry/docs/transition/setup-gcr-repo#redirect-permissions)).

#### Setup Cloud Build

You need to `Enable Cloud Build API` beforehand as always.
Then create 2 triggers like `build-frontend` for frontend and `build-api` for api. Beforehand, fork this repository to your github account.

#### Create trigger for frontend

- Create `build-frontend` trigger.
- Connect your forked repository as `Source`.
- Use `/frontend/cloudbuild.yaml` in this repository as Cloud Build configuration file.

Set Substitution variables below.

- `_API_DOMAIN`: Your domain like `markdown.com`.(This is required by frontend app to work. You need to get this with the service like [Google Domains](https://domains.google/).)
- `_REPOSITORY_PATH`: Your repository path like `github.com/yourusername/markdowneditor`(This will be used as store path of built images to container registry).
- `_WEB_VERSION_URL`: Your web frontend URL like `https://markdown.com`(This is required by frontend app to work).

#### Create trigger for api

- Create `build-api` trigger.
- Select connected repository as `Source`.
- Use `/api/cloudbuild.yaml` in this repository as Cloud Build configuration file.

Set Substitution variables below.

- `_REPOSITORY_PATH`: Your repository path like `github.com/yourusername/markdowneditor`(This will be used as store path of built images to container registry).

#### Try first run

Run triggers manually from Code Build/Triggers specifying the last commit hash.
If everything goes well, you can see built images inside `gcr.io` directory on `Artifact Registry` when the builds finished.

### Deploy app images on kubernetes cluster

#### Create kubernetes cluster to which the apps will be deployed

- Go to Kubernetes Engine/Clusters and enable Kubernetes Engine API(if asked).
- Create `Autopilot` Cluster named `app-cluster`(make sure `Network access` to be `Public cluster`).

#### Try first deploy

##### Frontend first deployment

- Go to Kubernetes Engine/Workloads.
- Create new deployment.
- Select built frontend image from your artifact registry.
- Set `frontend` as `Application name` and `Value` for `Key: app` for `Label`.
- Leave name space as `default`.
- Select `app-cluster` for `Cluster`.

Deploy with settings above.

##### API first deployment

- Go to Kubernetes Engine/Workloads.
- Create new deployment.
- Select built api image from your artifact registry.

Set environment variables below.

- `USE_SECURE_PROTOCOL`: Just set `true`.
- `FRONTEND_DOMAIN`: Just set `localhost`.
- `API_PORT`: Just set `3000`.
- `WS_PORT`: Just set `3001`.
- `DATABASE_HOST`: Just set `127.0.0.1`.
- `MYSQL_DATABASE`: Just set `markdown_editor`.
- `MYSQL_USER`: Just set `markdown_editor_app`.
- `SENDER_EMAIL`: Sender email of confirmation emails like `your-email-address-to-send-confirmation-emails@your-email-service-provider.com`.
- `CONFIRMATION_EMAIL_SERVER_TYPE`: You can choose from `StandardMailServer | SendGrid | Gmail`.

*We will set secrets later.*

- Set `api` as `Application name` and `Value` for `Key: app` for `Label`.
- Leave name space as `default`.
- Select `app-cluster` for `Cluster`.

Deploy with settings above.

###### Set Secrets for API using Kubernetes Secrets

Set API secrets using [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/).

To use kubectl commands to the cluster, run below:

```sh
gcloud container clusters get-credentials app-cluster \
  --project=${YOUR_PROJECT_ID} \
  --region=${YOUR_REGION}
```

Then, to create api secrets named `api-secret`, run below from Cloud Shell.

If you choose `StandardMailServer` as `CONFIRMATION_EMAIL_SERVER_TYPE`:

```sh
kubectl create secret generic api-secret \
  --from-literal=JWT_SECRET_KEY=<secret-key-for-api-to-verify-json-web-tokens> \
  --from-literal=MYSQL_PASSWORD=<password-for-app-as-a-database-user> \
  --from-literal=STANDARD_MAIL_SERVER_HOST=<your-email-service-provider.com> \
  --from-literal=STANDARD_MAIL_SERVER_USER=<your-email-user-name> \
  --from-literal=STANDARD_MAIL_SERVER_PASS=<your-email-user-password>
```

If you choose `SendGrid` as `CONFIRMATION_EMAIL_SERVER_TYPE`:

```sh
kubectl create secret generic api-secret \
  --from-literal=JWT_SECRET_KEY=<secret-key-for-api-to-verify-json-web-tokens> \
  --from-literal=MYSQL_PASSWORD=<password-for-app-as-a-database-user> \
  --from-literal=SENDGRID_API_KEY=<api-key-you-obtain-from-SendGrid>
```

If you choose `Gmail` as `CONFIRMATION_EMAIL_SERVER_TYPE`:

```sh
kubectl create secret generic api-secret \
  --from-literal=JWT_SECRET_KEY=<secret-key-for-api-to-verify-json-web-tokens> \
  --from-literal=MYSQL_PASSWORD=<password-for-app-as-a-database-user> \
  --from-literal=OAUTH_USER=<your_oAuth_user> \
  --from-literal=OAUTH_CLIENT_ID=<your_oAuth_client_id> \
  --from-literal=OAUTH_CLIENT_SECRET=<your-oauth-client-secret> \
  --from-literal=OAUTH_REFRESH_TOKEN=<your-oauth-refresh-token>
```

Then you need to add below to `spec.template.spec.containers[0].env` of Deployment manifest of `api`.

If you choose `StandardMailServer` as `CONFIRMATION_EMAIL_SERVER_TYPE`:

```yaml
        - name: JWT_SECRET_KEY
          valueFrom:
            secretKeyRef:
              key: JWT_SECRET_KEY
              name: api-secret
        - name: MYSQL_PASSWORD
          valueFrom:
            secretKeyRef:
              key: MYSQL_PASSWORD
              name: api-secret
        - name: STANDARD_MAIL_SERVER_HOST
          valueFrom:
            secretKeyRef:
              key: STANDARD_MAIL_SERVER_HOST
              name: api-secret
        - name: STANDARD_MAIL_SERVER_USER
          valueFrom:
            secretKeyRef:
              key: STANDARD_MAIL_SERVER_USER
              name: api-secret
        - name: STANDARD_MAIL_SERVER_PASS
          valueFrom:
            secretKeyRef:
              key: STANDARD_MAIL_SERVER_PASS
              name: api-secret
```

If you choose `SendGrid` as `CONFIRMATION_EMAIL_SERVER_TYPE`:

```yaml
        - name: JWT_SECRET_KEY
          valueFrom:
            secretKeyRef:
              key: JWT_SECRET_KEY
              name: api-secret
        - name: MYSQL_PASSWORD
          valueFrom:
            secretKeyRef:
              key: MYSQL_PASSWORD
              name: api-secret
        - name: SENDGRID_API_KEY
          valueFrom:
            secretKeyRef:
              key: SENDGRID_API_KEY
              name: api-secret
```

If you choose `Gmail` as `CONFIRMATION_EMAIL_SERVER_TYPE`:

```yaml
        - name: JWT_SECRET_KEY
          valueFrom:
            secretKeyRef:
              key: JWT_SECRET_KEY
              name: api-secret
        - name: MYSQL_PASSWORD
          valueFrom:
            secretKeyRef:
              key: MYSQL_PASSWORD
              name: api-secret
        - name: OAUTH_USER
          valueFrom:
            secretKeyRef:
              key: OAUTH_USER
              name: api-secret
        - name: OAUTH_CLIENT_ID
          valueFrom:
            secretKeyRef:
              key: OAUTH_CLIENT_ID
              name: api-secret
        - name: OAUTH_CLIENT_SECRET
          valueFrom:
            secretKeyRef:
              key: OAUTH_CLIENT_SECRET
              name: api-secret
        - name: OAUTH_REFRESH_TOKEN
          valueFrom:
            secretKeyRef:
              key: OAUTH_REFRESH_TOKEN
              name: api-secret
```

Leave editing yaml not applied as we need bit more edit.

###### Give api the permission to access database

API needs permission to access Cloud SQL.
We are going to use [GKE's Workload Identity feature](https://cloud.google.com/sql/docs/mysql/connect-kubernetes-engine#workload-identity).

- Enable `Cloud SQL Admin API`.
- Create a Google Service Account named `connect-db@<YOUR_PROJECT_ID>.iam.gserviceaccount.com` with `roles/cloudsql.editor`/`roles/cloudsql.client`/`roles/cloudsql.instanceUser`(See [here](https://cloud.google.com/sql/docs/mysql/iam-roles) to check Cloud SQL roles).

Then apply Kubernetes Service Account with following command:

```sh
kubectl apply -f ./gke-manifests/workload-identity-user.yaml
```

Then bind the Kubernetes Service Account with Google Service Account with the following command:

```sh
gcloud iam service-accounts add-iam-policy-binding \
--role="roles/iam.workloadIdentityUser" \
--member="serviceAccount:<YOUR_PROJECT_ID>.svc.id.goog[default/workload-identity-user]" \
connect-db@<YOUR_PROJECT_ID>.iam.gserviceaccount.com
```

*You can choose different namespace from `default` if you have set something else when creating frontend/api deployments.*

*You might need to set project here with the following command to run the previous command successfully:*

```sh
gcloud config set project ${PROJECT}
```

Then add an annotation to your kubernetes service account name to complete the binding:

```sh
kubectl annotate serviceaccount \
workload-identity-user \
iam.gke.io/gcp-service-account=connect-db@<YOUR_PROJECT_ID>.iam.gserviceaccount.com
```

Then you need to add below to `spec.template.spec` of Deployment manifest of `api`.

```yaml
      serviceAccountName: workload-identity-user
```

And add below to `spec.template.spec.containers` of Deployment manifest of `api`.

```yaml
      - name: cloud-sql-proxy
        image: gcr.io/cloudsql-docker/gce-proxy:1.28.0
        command:
        - /cloud_sql_proxy
        - -log_debug_stdout
        - -instances=<CONNECTION-NAME-OF-YOUR-CLOUD-SQL-DATABASE>=tcp:3306
        securityContext:
          runAsNonRoot: true
```

*This is a sidecar container to access database through Cloud SQL Proxy.*

Save the Deployment manifest of `api` and wait minutes to let Kubernetes update the deployment.
After that, every workload's status should be `OK` at this point.

#### Expose services

Finally, we are exposing the apps to the internet with the address like `https://markdown.com`.

##### Get domain

Get static IP address as `markdown-static-ip`(this will be listed on VPC network/IP addresses).

Run:

```sh
gcloud compute addresses create markdown-static-ip --global
```

Then you can see the IP with the following command:

```sh
gcloud compute addresses describe markdown-static-ip --global
```

It will show you the static ip address like:

```sh
address: 203.0.113.32
...
```

So set this ip to your DNS record of your domain.

##### Create access control policy

You can control the access from the internet with client's global IP address.
We are going to create access policies for frontend and api, then will apply them to Kubernetes services to expose apps.

- Go Network Security/Cloud Armor.
- Create policy: `ip-access-policy-frontend` for frontend and `ip-access-policy-backend` for api.
- Policy type: `Backend security policy`
- Set any rules you want. You can allow/deny access from configured specific IP addresses or range of IP addresses.

##### Apply services to expose

We are exposing the apps by applying the services with the following command:

```sh
kubectl apply \
-f ./gke-manifests/ingress-static-ip.yaml \
-f ./gke-manifests/backend-service-frontend-app.yaml \
-f ./gke-manifests/backend-service-api-app.yaml \
-f ./gke-manifests/http-backend-config-frontend.yaml \
-f ./gke-manifests/http-backend-config-api.yaml \
-f ./gke-manifests/http-backend-config-ws.yaml \
-f ./gke-manifests/managed-cert.yaml
```

At this point, you should be able to access our frontend app from your browser with the address like `https://<YOUR-DOMAIN>` and you can see Signup/Login feature is working as API also works publicly.

##### Redirect HTTP access to HTTPS

If you try to access the same domain with HTTP protocol(e.g. accessing `http://<YOUR-DOMAIN>`), you cannot access the app as access using HTTP protocol is blocked by ingress as defined on `ingress-static-ip.yaml`.
Ideally, access using HTTP protocol should be redirected to HTTPS protocol.

- Go Network services/Load balancing.
- Create a load balancer using `HTTP(S) Load Balancing`.
- Internet facing or internal only: `From Internet to my VMs or serverless services`
- Global or Regional: `Global HTTP(S) Load Balancer (classic)`
- Name: `http-redirect`

Frontend configuration

- Name: `http-redirect-frontend`
- Protocol: `HTTP`
- Network Service Tier: `Premium`
- IP version: `IPv4`
- IP address: `markdown-static-ip`
- Port: `80`

Backend configuration

- Skip this section.

Host and path rules

- Mode: `Advanced host and path rule (URL redirect, URL rewrite)`

Edit host and path rules

For ` (Default) Host and path rule for any unmatched `:

- Action: `Redirect the client to different host/path`
- HTTPS redirect: Check `Enable`

After create this load balancer, you will see the access to `http://<YOUR-DOMAIN>` is redirected to `https://<YOUR-DOMAIN>`.

### Setup Cloud Functions to deploy built images automatically

Updating images after new one built is a labor, so we want more CD like way.
We are going to let Cloud Functions do this repetitive job.

#### Create Pub/Sub topic

- Go Pub/Sub/Topics.
- Create a topic with Topic ID: `cloud-builds` to Pub/Sub.

Now you can subscribe to events from Cloud Build.

#### Get updater code to run on Cloud Functions

- Fork [this repository](https://github.com/crevetor/update-k8s-deployment-cloudfunc) to your github account.
- Go Cloud Source Repositories and add a repository.
- Select `Connect external repository`.
- Select your project.
- Select `GitHub` as Git provider.
- Check the checkbox and click `Connect to GitHub`.
- Select `update-k8s-deployment-cloudfunc` repository you forked in your github account.
- Click `Connect selected repository`.

Now you have source code on your project to run on Cloud Functions.

#### Create Cloud Functions for frontend/api

- Enable required APIs to use Cloud Functions.
- Create function for frontend/api deployment:
- Environment: Select `1st gen`
- Function name: `update-k8s-deployment-cloudfunc-frontend` for frontend / `update-k8s-deployment-cloudfunc-api` for api.
- Region: Select your region.
- Trigger type: `Cloud Pub/Sub`
- Select a Cloud Pub/Sub topic: Select the topic you created, and save it.

Set Runtime environment variables:

- PROJECT: `<YOUR-PROJECT-ID>`
- ZONE: `<YOUR-ZONE>`
- CLUSTER: `app-cluster`
- DEPLOYMENT: Deployment name. `frontend` for frontend deployment / `api` for api deployment.
- CONTAINER: Container name like `frontend-sha256-1` for frontend / `api-sha256-1` for api.
- IMAGE: Image name like `frontend` for frontend / `api` for api.

Set source code:

- Runtime: `Python 3.7`
- Entry Point: `onNewImage`
- Source Code: Select `Cloud Source repository`
- Project ID: `<YOUR-PROJECT-ID>`
- Repository: `github_yourgithubaccountname_update-k8s-deployment-cloudfunc`
- Select `Branch`/`master`.
- Directory with source code: `/`

Then deploy.

Try running triggers on Cloud Build, and when new images are pushed at the last of build process, you will see on Cloud Functions log section and Kubernetes Engine deployment details page of frontend/api that new images are applied to the new revision.

## Wrap up

Congratulations!
Now you can develop this project on CI/CD based environment.
