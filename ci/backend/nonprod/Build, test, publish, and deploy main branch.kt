package _Self.buildTypes

import jetbrains.buildServer.configs.kotlin.v2018_2.*
import jetbrains.buildServer.configs.kotlin.v2018_2.buildSteps.ScriptBuildStep
import jetbrains.buildServer.configs.kotlin.v2018_2.buildSteps.script
import jetbrains.buildServer.configs.kotlin.v2018_2.triggers.vcs

object BuildTestPublishAndDeployMainBranch : BuildType({
	name = "Build, test, publish, and deploy main branch"

	params {
		param("version", "0.0.0")
		param("env.BUILD_IMAGE_NAME", "vacman/vacman-backend")
		param("env.BUILD_VERSION", "0.0.0")
	}

	vcs {
		root(AbsoluteId("DtsDevelopment_VacancyManagement_VacancyManagementGitHub"))

		cleanCheckout = true
		branchFilter = """
			-:*
			+:<default>
		""".trimIndent()
	}

	steps {
		script {
			name = "Set build parameters"
			workingDir = "./backend/"
			scriptContent = """
				set -eux

				echo "##teamcity[setParameter name='env.CI' value='true']"
				echo "##teamcity[setParameter name='env.BUILD_IMAGE_NAME' value='%env.CLOUD_ACR_DOMAIN%/vacman/vacman-backend']"
				echo "##teamcity[setParameter name='env.BUILD_VERSION' value='%version%-${'$'}(git rev-parse --short=8 HEAD)-${'$'}(printf %%05x %env.BUILD_NUMBER%)']"
			""".trimIndent()
		}
		script {
			name = "Dump environment variables"
			workingDir = "./backend/"
			scriptContent = """
				set -eux
				env | sort # | base64
			""".trimIndent()
		}
		script {
			name = "Authenticate using Azure CLI"
			workingDir = "./backend/"
			scriptContent = """
				set -eux

				az login --service-principal \
				  --tenant %env.CLOUD_TENANT_ID% \
				  --username %env.TEAMCITY_SPN_ID% \
				  --password %env.TEAMCITY_SPN_PASS%

				az acr login --name %env.CLOUD_ACR_DOMAIN% \
				  --subscription %env.CLOUD_SUBSCRIPTION%

				az aks get-credentials --overwrite-existing \
				  --subscription %env.CLOUD_SUBSCRIPTION% \
				  --resource-group %env.CLOUD_K8S_RG% \
				  --name %env.CLOUD_K8S_CLUSTER_NAME% \
				  --file ./tmp/dts-dev-sced-rhp-akscluster.yaml

				kubelogin convert-kubeconfig \
				  --login spn \
				  --client-id %env.TEAMCITY_SPN_ID% \
				  --client-secret %env.TEAMCITY_SPN_PASS% \
				  --kubeconfig ./tmp/dts-dev-sced-rhp-akscluster.yaml
			""".trimIndent()
		}
		script {
			name = "Test and build container image"
			workingDir = "./backend/"
			scriptContent = "mvn -D revision=%env.BUILD_VERSION% -D image.name=%env.BUILD_IMAGE_NAME% clean spring-boot:build-image"
			dockerImage = "dtsrhpdevscedacr.azurecr.io/vacman/vacman-maven-builder:v1-mvn3.9-java21"
			dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
			dockerPull = true
			dockerRunParameters = "--rm --volume /var/run/docker.sock:/var/run/docker.sock"
		}
		script {
			name = "Publish container image"
			workingDir = "./backend/"
			scriptContent = """
				set -eux

				# push versioned image (ex: dtsrhpdevscedacr.azurecr.io/vacman/vacman-backend:0.0.0-00000000-0000)
				docker tag %env.BUILD_IMAGE_NAME%:latest %env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%
				docker push %env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%

				# main branch is always tagged as `latest`
				docker push %env.BUILD_IMAGE_NAME%:latest
			""".trimIndent()
		}
		script {
			name = "Deploy to `dev` environment"
			workingDir = "./backend/"
			scriptContent = """
				set -eux

				kubectl rollout restart deployment/vacman-backend-dev \
					--kubeconfig ./tmp/dts-dev-sced-rhp-akscluster.yaml \
					--namespace vacancy-management
			""".trimIndent()
		}
		script {
			name = "Deploy to `int` environment"
			workingDir = "./backend/"
			scriptContent = """
				set -eux

				kubectl rollout restart deployment/vacman-backend-int \
					--kubeconfig ./tmp/dts-dev-sced-rhp-akscluster.yaml \
					--namespace vacancy-management
			""".trimIndent()
		}
		script {
			name = "Deploy to `uat` environment"
			workingDir = "./backend/"
			scriptContent = """
				set -eux

				kubectl rollout restart deployment/vacman-backend-uat \
					--kubeconfig ./tmp/dts-dev-sced-rhp-akscluster.yaml \
					--namespace vacancy-management
			""".trimIndent()
		}
	}

	triggers {
		vcs {
			triggerRules = """
				-:**
				+:backend/**
			""".trimIndent()
			branchFilter = ""
		}
	}
})
