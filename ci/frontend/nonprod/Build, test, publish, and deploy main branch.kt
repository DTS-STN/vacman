package _Self.buildTypes

import jetbrains.buildServer.configs.kotlin.v2018_2.*
import jetbrains.buildServer.configs.kotlin.v2018_2.buildSteps.dockerCommand
import jetbrains.buildServer.configs.kotlin.v2018_2.buildSteps.script
import jetbrains.buildServer.configs.kotlin.v2018_2.triggers.vcs

object BuildTestPublishAndDeployMainBranch : BuildType({
	name = "Build, test, publish, and deploy main branch"

	params {
		select("DEBUG", "false", label = "Debug", options = listOf("false", "true"))
		param("version", "0.0.0")
		param("env.NODE_CONTAINER_IMAGE", "docker.io/library/node:24")
		param("env.BUILD_DATE", "1970-01-01T00:00:00.000Z")
		param("env.BUILD_VERSION", "0.0.0")
		param("env.BUILD_IMAGE_NAME", "vacman/vacman-frontend")
		param("env.BUILD_ID", "000000")
		param("env.BUILD_REVISION", "00000000")
	}

	vcs {
		root(AbsoluteId("DtsDevelopment_VacancyManagement_VacancyManagementGitHub"))

		branchFilter = """
			-:*
			+:<default>
		""".trimIndent()
	}

	steps {
		script {
			name = "Set build parameters"
			workingDir = "./frontend/"
			scriptContent = """
				set -eux

				echo "##teamcity[setParameter name='env.CI' value='true']"

				echo "##teamcity[setParameter name='env.NODE_CONTAINER_IMAGE' value='${'$'}(awk '/FROM (.+) AS base/ { print ${'$'}2 }' ./containerfile)']"
				echo "##teamcity[setParameter name='env.BUILD_DATE' value='${'$'}(date -u +%%Y-%%m-%%dT%%H:%%M:%%SZ)']"
				echo "##teamcity[setParameter name='env.BUILD_ID' value='${'$'}(printf %%05x %env.BUILD_NUMBER%)']"
				echo "##teamcity[setParameter name='env.BUILD_IMAGE_NAME' value='%env.CLOUD_ACR_DOMAIN%/vacman/vacman-frontend']"
				echo "##teamcity[setParameter name='env.BUILD_REVISION' value='${'$'}(git rev-parse --short=8 HEAD)']"
				echo "##teamcity[setParameter name='env.BUILD_VERSION' value='%version%']"

				# uncomment to for 0.0.0-00000000-00000 style version strings...
				echo "##teamcity[setParameter name='env.BUILD_VERSION' value='%version%-${'$'}(git rev-parse --short=8 HEAD)-${'$'}(printf %%05x %env.BUILD_NUMBER%)']"
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
		script {
			name = "Execute end-to-end tests"
			enabled = false
			workingDir = "./frontend"
			scriptContent = """
				set -eux

				corepack enable
				corepack prepare pnpm@10.10.0 --activate

				pnpm install --frozen-lockfile
				pnpm exec playwright install chromium --with-deps
				pnpm run test:e2e
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
					%env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%
					%env.BUILD_IMAGE_NAME%:latest
				""".trimIndent()
				commandArgs = "--pull --build-arg BUILD_DATE=%env.BUILD_DATE% --build-arg BUILD_ID=%env.BUILD_ID% --build-arg BUILD_REVISION=%env.BUILD_REVISION% --build-arg BUILD_VERSION=%env.BUILD_VERSION%"
			}
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
			name = "Publish container image"
			workingDir = "./frontend/"
			scriptContent = """
				set -eux

				# push versioned image (ex: dtsrhpdevscedacr.azurecr.io/vacman/vacman-frontend:0.0.0-00000000-0000)
				docker push %env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%

				# main branch is always tagged as `latest`
				docker push %env.BUILD_IMAGE_NAME%:latest
			""".trimIndent()
		}
		script {
			name = "Deploy to `dev` environment"
			workingDir = "./frontend/"
			scriptContent = """
				set -eux

				kubectl rollout restart deployment/vacman-frontend-dev \
					--kubeconfig ./tmp/dts-dev-sced-rhp-akscluster.yaml \
					--namespace vacancy-management
			""".trimIndent()
		}
		script {
			name = "Deploy to `int` environment"
			workingDir = "./frontend/"
			scriptContent = """
				set -eux

				kubectl rollout restart deployment/vacman-frontend-int \
					--kubeconfig ./tmp/dts-dev-sced-rhp-akscluster.yaml \
					--namespace vacancy-management
			""".trimIndent()
		}
		script {
			name = "Deploy to `uat` environment"
			workingDir = "./frontend/"
			scriptContent = """
				set -eux

				kubectl rollout restart deployment/vacman-frontend-uat \
					--kubeconfig ./tmp/dts-dev-sced-rhp-akscluster.yaml \
					--namespace vacancy-management
			""".trimIndent()
		}
	}

	triggers {
		vcs {
			triggerRules = """
				-:**
				+:frontend/**
			""".trimIndent()
			branchFilter = ""
		}
	}
})
