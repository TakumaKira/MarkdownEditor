# How to deploy this to Amazon Web Service

## Table of contents

- [How to deploy this to Amazon Web Service](#how-to-deploy-this-to-amazon-web-service)
  - [Table of contents](#table-of-contents)
  - [Steps](#steps)
    - [Create a new Resource Group for this project](#create-a-new-resource-group-for-this-project)
    - [Setup image builders](#setup-image-builders)
      - [Create ECR repository](#create-ecr-repository)
      - [Setup a CodeBuild project](#setup-a-codebuild-project)
    - [Deploy apps on EKS](#deploy-apps-on-eks)
      - [Create a VPC](#create-a-vpc)
      - [Create security groups](#create-security-groups)
      - [Prepare database](#prepare-database)
        - [Create an instance of MySQL database with RDS](#create-an-instance-of-mysql-database-with-rds)
        - [Setup database](#setup-database)
          - [Setup bastion host](#setup-bastion-host)
      - [Create MemoryDB for Redis](#create-memorydb-for-redis)
        - [Try connecting Redis from bastion host](#try-connecting-redis-from-bastion-host)
      - [Create a cluster](#create-a-cluster)
      - [Deploy](#deploy)

## Steps

*You might be asked with error messages to get required permissions along the way. Please set required permissions on AWS's IAM page. If you stuck somewhere along the way, you would be able to avoid most of the problems using AWS root user as ambiguous problems during project setups are most likely rooted from permission settings in which root user has every one of them. If it was not problem with root user, then you can try tweaking permissions for your user.*

### Create a new Resource Group for this project

Create a new Resource Group with following information:

- Add a tag with Key - `Project` / Value - `MarkdownEditor`(Add this tag to all resources you will create along with this documentation. This makes resource cleanup easier.)
- Group name: `MarkdownEditor`

### Setup image builders

#### Create ECR repository

- Create repository with name `markdown-frontend` for frontend and `markdown-api` for api.

#### Setup a CodeBuild project

- Create a build project with name `build-frontend`.
- Connect (your forked) this repository as source 1.
- As environment, select `Managed image` as Environment image / `Ubuntu` as Operating System / `Standard` as Runtime / `aws/codebuild/standard:5.0` as Image / `Always use the latest...` as Image version / `Linux` as Environment type.
- Check `Privileged`.
- Create a role like below and select `Existing service role` and set the Role ARN.

```json
{
  "Statement": [
    ### BEGIN ADDING STATEMENT HERE ###
    {
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:CompleteLayerUpload",
        "ecr:GetAuthorizationToken",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart"
      ],
      "Resource": "*",
      "Effect": "Allow"
    },
    ### END ADDING STATEMENT HERE ###
    ...
  ],
  "Version": "2012-10-17"
}
```

- Set environment variables with name `API_DOMAIN` / value `<your-api-domain>` / type `Plantext`.
- Set environment variables with name `AWS_DEFAULT_REGION` / value `<your-project-region-id>` / type `Plantext`.
- Set environment variables with name `AWS_ACCOUNT_ID` / value `<your-project-account-id>` / type `Plantext`.
- Set environment variables with name `IMAGE_TAG` / value `latest` / type `Plantext`.
- Set environment variables with name `IMAGE_REPO_NAME` / value `markdown-frontend` / type `Plantext`.
- Select buildspec with `Use a buildspec file` and `frontend/buildspec.yaml` as Buildspec name.
- Select `No artifacts` as Artifacts/Type.

Now, you can run the builder by clicking `Start build with overrides` with specifying the source version in Source version section.
When the build is done successfully, you should see the output image in your ECR `markdown-frontend` repository.

### Deploy apps on EKS

#### Create a VPC

Create a VPC with the following attributes:

- Resources to create: `VPC and more`
- Name tag auto-generation: Check `Auto generate` with name `markdown`(This will make the name of the VPC `markdown-vpc` automatically)
- Tenancy: `Default`
- Number of Availability Zones (AZs): `2`
- Number of public subnets: `2`
- Number of private subnets: `2`
- NAT gateways: `None`
- VPC endpoints: `S3 Gateway`
- DNS options: Check both of `Enable DNS hostnames` and `Enable DNS resolution`

After successful creation of the VPC, delete Inbound and Outbound rules of default security groups.

#### Create security groups

Create 3 security groups for RDS instance, bastion host and MemoryDB for Redis(EKS cluster creates one for itself automatically during its creation).

For bastion host:

- Security group name: `ec2-vm-sg-markdown-bastion`
- Description: `Allows SSH access to developers`
- VPC: `<your-vpc-name>`
- Inbound rules: Type - `SSH` / Source - `My IP`(means your machine's IP address)
- Outbound rules: Type - `All traffic` / Source - `Anywhere IPv4`(means your machine's IP address)

For RDS instance:

- Security group name: `rds-sg-markdown-db`
- Description: `Allows querying to database`
- VPC: `<your-vpc-name>`
- Inbound rules: Type - `MYSQL/Aurora` / Source - `Custom` and select `ec2-vm-sg-markdown-bastion` and `eks-cluster-sg-markdown-cluster-...` from dropdown list
- Outbound rules: Type - `All traffic` / Source - `Anywhere IPv4`(means your machine's IP address)

For MemoryDB for Redis:

- Security group name: `mdb-sg-markdown-redis`
- Description: `Allows querying to MemoryDB`
- VPC: `<your-vpc-name>`
- Inbound rules: Type - `Custom TCP` with port range `6379` / Source - `Custom` and select `eks-cluster-sg-markdown-cluster-...` from dropdown list
- Outbound rules: Type - `All traffic` / Source - `Anywhere IPv4`(means your machine's IP address)

#### Prepare database

##### Create an instance of MySQL database with RDS

- Start with clicking `Create database`
- Choose a database creation method: `Standard create`
- Engine options: `MySQL`
- Templates: `Free tier`
- DB instance identifier: `markdown-db`
- Master username: `root`
- Check `Manage master credentials in AWS Secrets Manager`
- Compute resource: `Don’t connect to an EC2 compute resource`
- Virtual private cloud (VPC): Select `markdown-vpc`
- Public access: `No`
- VPC security group (firewall): `Choose existing`
- Existing VPC security groups: `rds-sg-markdown-db`

Then click `Create database`.

##### Setup database

To run setup queries on this repository, I'm going to use a bastion host(with which we can run command from our local terminal as if it is inside the VPC).

###### Setup bastion host

Create a new EC2 instance with the following configuration:

- Tag: Name: `markdown-vpc-bastion-vm`
- Tag: Project: `MarkdownEditor`
- Amazon Machine Image: `Amazon Linux`
- Click `Create new key pair` in Key pair (login) section and set following: Key pair name - `markdown-vpc-bastion-vm-key` / Key pair type - `RSA` / Private key file format - `.pem` and click `Create key pair`(Place your automatically downloaded `markdown-vpc-bastion-vm-key.pem` file into root directly of this project as you need it to login to your bastion host later.)
- Select `markdown-vpc` and use a subnet including `public` in the name which was automatically generated when creating VPC, and select `Enable` for Auto-assign public IP.
- Firewall (security groups): `Select existing security group` and select `ec2-vm-sg-markdown-bastion`

And click `Launch instance`

After the instance started up, you should be able to connect to the instance with messages something like below:

```sh
ssh -i markdown-vpc-bastion-vm-key.pem ec2-user@<your-bastion-vm-public-ip>
The authenticity of host 'xx.xx.xx.x (xx.xx.xx.xx)' can't be established.
ED25519 key fingerprint is SHA256:xxx.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'xx.xx.xx.xx' (...) to the list of known hosts.

ec2-user@ip-<your-bastion-vm-private-ip>.<your-aws-region>.compute.internal:~
```

Now you can use the bastion host from your local terminal.

To copy database initialization script files from bastion VM private to the VM, **on another new terminal**, from the root directory of this project, execute command like following:

```sh
scp -i markdown-vpc-bastion-vm-key.pem -rp db/init ec2-user@<your-bastion-vm-public-ip>:init
```

Then, **from the terminal you previously connected to the bastion host**, setup your database instance with the following commands in this order:

Install MySQL shell on your bastion host, following [this instructions](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ConnectToInstance.html).

*You should be able to get your RDS database from AWS secrets manager as you choose `Manage master credentials in AWS Secrets Manager` when creating the instance.s*

```sh
mysql -uroot -p'<your-database-root-password>' -h<endpoint-of-your-RDS-instance> < ./init/1-init-database.sql
```

```sh
mysql -uroot -p'<your-database-root-password>' -h<endpoint-of-your-RDS-instance> -e "CREATE USER markdown_api IDENTIFIED BY '<password-for-api>';"
```

```sh
mysql -uroot -p'<your-database-root-password>' -h<endpoint-of-your-RDS-instance> -e "GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON markdown_db.* TO markdown_api;"
```

*This is granting required privileges to the app as a database user.*

```sh
mysql -uroot -p'<your-database-root-password>' -h<endpoint-of-your-RDS-instance> < ./init/3-init-tables.sql
```

```sh
mysql -uroot -p'<your-database-root-password>' -h<endpoint-of-your-RDS-instance> < ./init/4-init-user-procedures.sql
```

```sh
mysql -uroot -p'<your-database-root-password>' -h<endpoint-of-your-RDS-instance> < ./init/5-init-document-procedures.sql
```

To confirm you have successfully created tables, run the following command:

```sh
mysql -uroot -p'<your-database-root-password>' -h<endpoint-of-your-RDS-instance> -e "USE markdown_db; SHOW COLUMNS from users;"
+-----------------+-------------+------+-----+---------+----------------+
| Field           | Type        | Null | Key | Default | Extra          |
+-----------------+-------------+------+-----+---------+----------------+
| id              | int         | NO   | PRI | NULL    | auto_increment |
| email           | varchar(50) | NO   | UNI | NULL    |                |
| hashed_password | char(60)    | NO   |     | NULL    |                |
| is_activated    | tinyint(1)  | NO   |     | 0       |                |
+-----------------+-------------+------+-----+---------+----------------+
```

```sh
mysql -uroot -p'<your-database-root-password>' -h<endpoint-of-your-RDS-instance> -e "USE markdown_db; SHOW COLUMNS from documents;"
+----------------+----------------+------+-----+---------+-------+
| Field          | Type           | Null | Key | Default | Extra |
+----------------+----------------+------+-----+---------+-------+
| id             | char(36)       | NO   | PRI | NULL    |       |
| user_id        | int            | NO   | MUL | NULL    |       |
| name           | varchar(50)    | YES  |     | NULL    |       |
| content        | varchar(20000) | YES  |     | NULL    |       |
| created_at     | datetime       | NO   |     | NULL    |       |
| updated_at     | datetime       | NO   |     | NULL    |       |
| saved_on_db_at | datetime       | NO   |     | NULL    |       |
| is_deleted     | tinyint(1)     | NO   |     | 0       |       |
+----------------+----------------+------+-----+---------+-------+
```

#### Create MemoryDB for Redis

Create new cluster of MemoryDB for Redis with following configurations:

Cluster info

- Name: `markdown-redis`

Subnet groups

- Subnet groups: `Create a new subnet group`
- Name: `markdown-redis-subnet`
- VPC ID: Choose `markdown-vpc`
- Selected subnets: Select two of private subnets we had created before.
- Tags for subnet group: Key - `Project` / Value - `MarkdownEditor`

Security

- Selected security groups: Choose `mdb-sg-markdown-redis`
- Encryption key: `AWS owned key`
- Encryption in transit: Select `No encryption`
- Click `Create ACL` to set ACL.
- In Create access control list (ACL) window: ACL name: `markdown-redis-user-apps`
- In Create access control list (ACL) window: ACL name: Click `Create user`
- In Create user window: User name: `markdown-api`
- In Create user window: Authentication mode: `Password(s)`
- In Create user window: Password 1: `<password-for-api>`
- In Create user window: Access string: `on +@all -@dangerous ~*`
- In Create user window: Tags: Key - `Project` / Value - `MarkdownEditor`
- In Create user window: Click `Create`
- In Create access control list (ACL) window: Click `Manage` on Selected users and select `markdown-api`
- In Create access control list (ACL) window: Tags: Key - `Project` / Value - `MarkdownEditor`
- In Create access control list (ACL) window: Click `Create`
- Access control lists (ACL): Select `markdown-redis-user-apps`
- Tags for cluster: Key - `Project` / Value - `MarkdownEditor`
- Click `Create`

##### Try connecting Redis from bastion host

Before trying to connect, you need to add an inbound rule of `mdb-sg-markdown-redis` which accepts connections from `ec2-vm-sg-markdown-bastion`.
Add below to the inbound rules on EC2/Security groups page.

- Inbound rules: Type - `Custom TCP` with port range `6379` / Source - `Custom` and select `ec2-vm-sg-markdown-bastion` from dropdown list

Try connecting Redis from your bastion host by installing `redis-cli` in it. See [here](https://docs.aws.amazon.com/memorydb/latest/devguide/getting-startedclusters.connecttonode.html) for more information.
As a snippet, the working command will be something like:

```sh
redis-cli -c -h clustercfg.markdown-redis.xxxxxx.memorydb.your-project-region.amazonaws.com --user markdown-api --pass your-password-for-api --tls -p 6379
```

#### Create a cluster

- Name: `markdown-cluster`
- Create and set cluster service role(you would see reference links around the field)
- Select what you have created previous VPC step for VPC/Subnets/Security groups
- Cluster endpoint access: `Public`

#### Deploy

To deploy apps to clusters on EKS, you need to configure `aws-cli`. See [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) how to install and configure.

<!-- Deploy -->

<!-- Networking -->

<!-- CI/CD -->
