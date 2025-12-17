package _Self.buildTypes

import jetbrains.buildServer.configs.kotlin.v2018_2.*
import jetbrains.buildServer.configs.kotlin.v2018_2.buildSteps.dockerCommand
import jetbrains.buildServer.configs.kotlin.v2018_2.buildSteps.script
import jetbrains.buildServer.configs.kotlin.v2018_2.triggers.vcs

object BuildTestPublishAndDeployReleaseBranches : BuildType({
	name = "Build, test, publish, and deploy release branches"

	params {
		select("DEBUG", "false", label = "Debug", options = listOf("false", "true"))
		param("env.NODE_CONTAINER_IMAGE", "docker.io/library/node:24")
		param("env.BUILD_DATE", "1970-01-01T00:00:00.000Z")
		param("env.BUILD_VERSION", "0.0.0")
		param("env.BUILD_IMAGE_NAME", "vacman/vacman-frontend")
		param("env.BUILD_RC_LABEL", "0000")
		param("env.BUILD_ID", "0000")
		param("env.BUILD_REVISION", "00000000")
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
			workingDir = "./frontend/"
			scriptContent = """
				#!/usr/bin/bash -eux

				if [[ ! "%teamcity.build.branch%" =~ ^release/v[0-9]+.[0-9]+.[0-9]+(-.+)?${'$'} ]]
				then
				  echo "Invalid release branch name; branch name must match 'release/v0.0.0' with an optional suffix"
				  exit 1
				fi

				BUILD_DATE=${'$'}(date -u +%%Y-%%m-%%dT%%H:%%M:%%SZ)
				BUILD_ID=${'$'}(printf %%05x %env.BUILD_NUMBER%)
				BUILD_IMAGE_NAME=%env.CLOUD_ACR_DOMAIN%/vacman/vacman-frontend
				BUILD_RC_LABEL=${'$'}(printf %%03d "%env.BUILD_NUMBER%")
				BUILD_REVISION=${'$'}(git rev-parse --short=8 HEAD)
				BUILD_VERSION=${'$'}(echo "%teamcity.build.branch%" | sed 's/^release\/v//')

				echo "##teamcity[setParameter name='env.CI' value='true']"
				echo "##teamcity[setParameter name='env.NODE_CONTAINER_IMAGE' value='${'$'}(awk '/FROM (.+) AS base/ { print ${'$'}2 }' ./containerfile)']"

				echo "##teamcity[setParameter name='env.BUILD_DATE' value='${'$'}{BUILD_DATE}']"
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
			workingDir = "./frontend/"
			scriptContent = """
				set -eux
				env | sort # | base64
			""".trimIndent()
		}
		script {
			name = "Authenticate using Azure CLI"
			workingDir = "./frontend/"
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
			name = "Check formatting, lint, and typecheck"
			workingDir = "./frontend/"
			scriptContent = """
				set -eux

				corepack enable
				corepack prepare pnpm@10.10.0 --activate

				pnpm install --frozen-lockfile
				pnpm run typecheck
				pnpm run format:check
				pnpm run lint:check
			""".trimIndent()
			dockerImage = "%env.NODE_CONTAINER_IMAGE%"
		}
		script {
			name = "Execute unit tests"
			workingDir = "./frontend/"
			scriptContent = """
				set -eux

				corepack enable
				corepack prepare pnpm@10.10.0 --activate

				pnpm install --frozen-lockfile
				pnpm run test -- --coverage
			""".trimIndent()
			dockerImage = "%env.NODE_CONTAINER_IMAGE%"
		}
		dockerCommand {
			name = "Build container image"
			commandType = build {
				source = file {
					path = "./frontend/containerfile"
				}
				contextDir = "./frontend/"
				namesAndTags = """
					%env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%-RC%env.BUILD_RC_LABEL%-%env.BUILD_REVISION%
					%env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%-RC%env.BUILD_RC_LABEL%
					%env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%-RC
				""".trimIndent()
				commandArgs = """
					--pull
					--build-arg BUILD_DATE=%env.BUILD_DATE%
					--build-arg BUILD_ID=%env.BUILD_ID%
					--build-arg BUILD_REVISION=%env.BUILD_REVISION%
					--build-arg BUILD_VERSION=%env.BUILD_VERSION%-RC%env.BUILD_RC_LABEL%-%env.BUILD_REVISION%
				""".trimIndent()
			}
		}
		script {
			name = "Publish container image"
			workingDir = "./frontend/"
			scriptContent = """
				set -eux

				docker push %env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%-RC%env.BUILD_RC_LABEL%-%env.BUILD_REVISION%
				docker push %env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%-RC%env.BUILD_RC_LABEL%
				docker push %env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%-RC
			""".trimIndent()
		}
	}

	triggers {
		vcs {
		}
	}
})
