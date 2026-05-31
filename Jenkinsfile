pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  parameters {
    string(name: 'DEPLOY_HOST', defaultValue: 'your.oracle.vm.ip', description: 'Oracle VM host or IP')
    string(name: 'DEPLOY_USER', defaultValue: 'ubuntu', description: 'SSH user on Oracle VM')
    string(name: 'DEPLOY_DOMAIN', defaultValue: 'your.oracle.vm.ip', description: 'Public domain or public IP used by Nginx')
    string(name: 'DEPLOY_PORT', defaultValue: '22', description: 'SSH port')
    string(name: 'APP_ROOT', defaultValue: '/opt/bloodconnect', description: 'Remote application root directory')
    string(name: 'WEB_ROOT', defaultValue: '/var/www/bloodconnect', description: 'Remote web root for built frontend')
    booleanParam(name: 'RUN_REMOTE_SETUP', defaultValue: false, description: 'Run initial VM setup script before deployment')
    booleanParam(name: 'RUN_HEALTHCHECK', defaultValue: true, description: 'Verify /health after deployment')
    booleanParam(name: 'USE_HTTPS', defaultValue: false, description: 'Use HTTPS for health checks and frontend API URL')
  }

  environment {
    DOTNET_CLI_TELEMETRY_OPTOUT = '1'
    API_PUBLISH_DIR = 'publish/api'
    WEB_DIST_DIR = 'frontend/blood-donor-web/dist'
    PACKAGE_DIR = 'publish/package'
    PACKAGE_NAME = 'bloodconnect-deploy.tgz'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build API') {
      steps {
        bat 'dotnet publish backend/BloodDonor.API/src/BloodDonor.Api/BloodDonor.Api.csproj -c Release -o %API_PUBLISH_DIR%'
      }
    }

    stage('Build Web') {
      steps {
        dir('frontend/blood-donor-web') {
          withEnv(["VITE_API_URL="]) {
            bat 'npm ci'
            bat 'npm run build'
          }
        }
      }
    }

    stage('Package Artifacts') {
      steps {
        bat 'if exist %PACKAGE_DIR% rmdir /s /q %PACKAGE_DIR%'
        bat 'mkdir %PACKAGE_DIR%'
        bat 'xcopy /E /I /Y %API_PUBLISH_DIR% %PACKAGE_DIR%\api'
        bat 'xcopy /E /I /Y %WEB_DIST_DIR% %PACKAGE_DIR%\web'
        bat 'xcopy /E /I /Y deployment %PACKAGE_DIR%\deployment'
        powershell 'Compress-Archive -Path "publish/package/*" -DestinationPath "publish/bloodconnect-deploy.zip" -Force'
      }
    }

    stage('Upload Bundle') {
      steps {
        sshagent(credentials: ['oracle-vm-ssh']) {
          powershell "scp -P ${params.DEPLOY_PORT} -o StrictHostKeyChecking=no publish/bloodconnect-deploy.zip ${params.DEPLOY_USER}@${params.DEPLOY_HOST}:/tmp/bloodconnect-deploy.zip"
          powershell "scp -P ${params.DEPLOY_PORT} -o StrictHostKeyChecking=no deployment/scripts/remote_deploy.sh ${params.DEPLOY_USER}@${params.DEPLOY_HOST}:/tmp/remote_deploy.sh"
          powershell "scp -P ${params.DEPLOY_PORT} -o StrictHostKeyChecking=no deployment/scripts/remote_setup.sh ${params.DEPLOY_USER}@${params.DEPLOY_HOST}:/tmp/remote_setup.sh"
        }
      }
    }

    stage('Initial Remote Setup') {
      when {
        expression { return params.RUN_REMOTE_SETUP }
      }
      steps {
        sshagent(credentials: ['oracle-vm-ssh']) {
          powershell "ssh -p ${params.DEPLOY_PORT} -o StrictHostKeyChecking=no ${params.DEPLOY_USER}@${params.DEPLOY_HOST} \"chmod +x /tmp/remote_setup.sh && sudo DEPLOY_DOMAIN='${params.DEPLOY_DOMAIN}' APP_ROOT='${params.APP_ROOT}' WEB_ROOT='${params.WEB_ROOT}' /tmp/remote_setup.sh\""
        }
      }
    }

    stage('Deploy to Oracle VM') {
      steps {
        sshagent(credentials: ['oracle-vm-ssh']) {
          withCredentials([
            string(credentialsId: 'bloodconnect-db-connection-string', variable: 'DB_CONNECTION_STRING'),
            string(credentialsId: 'bloodconnect-jwt-signing-key', variable: 'JWT_SIGNING_KEY')
          ]) {
            powershell "ssh -p ${params.DEPLOY_PORT} -o StrictHostKeyChecking=no ${params.DEPLOY_USER}@${params.DEPLOY_HOST} \"chmod +x /tmp/remote_deploy.sh && APP_ROOT='${params.APP_ROOT}' WEB_ROOT='${params.WEB_ROOT}' DEPLOY_DOMAIN='${params.DEPLOY_DOMAIN}' DB_CONNECTION_STRING='${env.DB_CONNECTION_STRING}' JWT_SIGNING_KEY='${env.JWT_SIGNING_KEY}' /tmp/remote_deploy.sh\""
          }
        }
      }
    }

    stage('Health Check') {
      when {
        expression { return params.RUN_HEALTHCHECK }
      }
      steps {
        script {
          def scheme = params.USE_HTTPS ? 'https' : 'http'
          powershell "Invoke-WebRequest -UseBasicParsing -Uri ${scheme}://${params.DEPLOY_DOMAIN}/health | Select-Object -ExpandProperty Content"
        }
      }
    }
  }
}
