package _Self.buildTypes

import jetbrains.buildServer.configs.kotlin.v2018_2.*
import jetbrains.buildServer.configs.kotlin.v2018_2.buildSteps.maven
import jetbrains.buildServer.configs.kotlin.v2018_2.buildSteps.script
import jetbrains.buildServer.configs.kotlin.v2018_2.triggers.vcs

object BuildTestPublishAndDeployReleaseBranches : BuildType({
	name = "Build, test, publish, and deploy release branches"

	params {
		select("DEBUG", "false", label = "Debug", options = listOf("false", "true"))
		param("version", "0.0.0")
		param("env.BUILD_VERSION", "0.0.0")
		param("env.BUILD_RC_LABEL", "RC000")
		param("env.BUILD_REVISION", "00000000")
		param("env.BUILD_IMAGE_NAME", "vacman/vacman-backend")
	}

	vcs {
		root(AbsoluteId("DtsDevelopment_VacancyManagement_VacancyManagementGitHub"))

		branchFilter = """
			-:<default>
			+:release/v*
		""".trimIndent()
	}

	steps {
		script {
			name = "Set build parameters"
			workingDir = "./backend/"
			scriptContent = """
				#!/usr/bin/bash -eux

				if [[ ! "%teamcity.build.branch%" =~ ^release/v[0-9]+.[0-9]+.[0-9]+(-.+)?${'$'} ]]
				then
				  echo "Invalid release branch name; branch name must match 'release/v0.0.0' with an optional suffix"
				  exit 1
				fi

				BUILD_DATE=${'$'}(date -u +%%Y-%%m-%%dT%%H:%%M:%%SZ)
				BUILD_ID=${'$'}(printf %%05x %env.BUILD_NUMBER%)
				BUILD_IMAGE_NAME=%env.CLOUD_ACR_DOMAIN%/vacman/vacman-backend
				BUILD_RC_LABEL=${'$'}(printf %%03d "%env.BUILD_NUMBER%")
				BUILD_REVISION=${'$'}(git rev-parse --short=8 HEAD)
				BUILD_VERSION=${'$'}(echo "%teamcity.build.branch%" | sed 's/^release\/v//')

				echo "##teamcity[setParameter name='env.BUILD_ID' value='${'$'}{BUILD_ID}']"
				echo "##teamcity[setParameter name='env.BUILD_IMAGE_NAME' value='${'$'}{BUILD_IMAGE_NAME}']"
				echo "##teamcity[setParameter name='env.BUILD_RC_LABEL' value='${'$'}{BUILD_RC_LABEL}']"
				echo "##teamcity[setParameter name='env.BUILD_REVISION' value='${'$'}{BUILD_REVISION}']"
				echo "##teamcity[setParameter name='env.BUILD_VERSION' value='${'$'}{BUILD_VERSION}']"
			""".trimIndent()
		}
		script {
			name = "Dump environment variables"

			conditions {
				equals("DEBUG", "true")
			}
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
		maven {
			name = "Test and build container image"
			goals = "clean spring-boot:build-image"
			pomLocation = "./backend/pom.xml"
			runnerArgs = """
				--define image.name=%env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%-RC%env.BUILD_RC_LABEL%-%env.BUILD_REVISION%
				--define revision=%env.BUILD_VERSION%-RC%env.BUILD_RC_LABEL%-%env.BUILD_REVISION%
			""".trimIndent()
			workingDir = "./backend/"
			dockerImage = "%env.CLOUD_ACR_DOMAIN%/vacman/vacman-maven-builder:v1-mvn3.9-java21"
			dockerRunParameters = "--volume /var/run/docker.sock:/var/run/docker.sock"
		}
		script {
			name = "Publish container image"
			workingDir = "./backend/"
			scriptContent = """
				set -eux

				# 0.0.0-RC0001-00000000
				docker push %env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%-RC%env.BUILD_RC_LABEL%-%env.BUILD_REVISION%

				# 0.0.0-RC0001
				docker tag \
				  %env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%-RC%env.BUILD_RC_LABEL%-%env.BUILD_REVISION% \
				  %env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%-RC%env.BUILD_RC_LABEL%

				docker push %env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%-RC%env.BUILD_RC_LABEL%

				# 0.0.0-RC
				docker tag \
				  %env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%-RC%env.BUILD_RC_LABEL%-%env.BUILD_REVISION% \
				  %env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%-RC

				docker push %env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%-RC
			""".trimIndent()
		}
	}

	triggers {
		vcs {
		}
	}
})
