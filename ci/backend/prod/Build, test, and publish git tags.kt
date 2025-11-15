package _Self.buildTypes

import jetbrains.buildServer.configs.kotlin.v2018_2.*
import jetbrains.buildServer.configs.kotlin.v2018_2.buildSteps.maven
import jetbrains.buildServer.configs.kotlin.v2018_2.buildSteps.script
import jetbrains.buildServer.configs.kotlin.v2018_2.triggers.vcs

object BuildTestAndPublishGitTags : BuildType({
	name = "Build, test, and publish git tags"

	params {
		select("DEBUG", "false", label = "Debug", options = listOf("false", "true"))
		param("env.BUILD_VERSION", "0.0.0")
		param("env.BUILD_REVISION", "00000000")
		param("env.BUILD_IMAGE_NAME", "vacman/vacman-backend")
	}

	vcs {
		root(AbsoluteId("DtsCluster_VacancyManagement_HttpsGithubComDtsStnVacmanGit"))

		branchFilter = """
			+:refs/tags/v*
			-:*
		""".trimIndent()
	}

	steps {
		script {
			name = "Set build parameters"
			workingDir = "./backend/"
			scriptContent = """
				set -eux

				CURRENT_TAG=${'$'}(git describe --exact-match --tags 2> /dev/null)

				# exit the pipeline if the tag does not match "v0.0.0"
				expr "${'$'}{CURRENT_TAG}" : 'v\?[0-9]\+\.[0-9]\+\.[0-9]\+.*' >/dev/null || exit 1

				BUILD_DATE=${'$'}(date -u +%%Y-%%m-%%dT%%H:%%M:%%SZ)
				BUILD_ID=${'$'}(printf %%05x %env.BUILD_NUMBER%)
				BUILD_IMAGE_NAME=%env.CLOUD_ACR_DOMAIN%/vacman/vacman-backend
				BUILD_REVISION=${'$'}(git rev-parse --short=8 HEAD)
				BUILD_VERSION=${'$'}(echo "${'$'}{CURRENT_TAG}" | sed 's/^v//')

				echo "##teamcity[setParameter name='env.BUILD_ID' value='${'$'}{BUILD_ID}']"
				echo "##teamcity[setParameter name='env.BUILD_IMAGE_NAME' value='${'$'}{BUILD_IMAGE_NAME}']"
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
			""".trimIndent()
		}
		maven {
			name = "Test and build container image"
			goals = "clean spring-boot:build-image"
			pomLocation = "./backend/pom.xml"
			runnerArgs = """
				--define image.name=%env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%
				--define revision=%env.BUILD_VERSION%
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

				# 0.0.0
				docker push %env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%

				# 0.0.0-00000000
				docker tag \
				  %env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION% \
				  %env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%-%env.BUILD_REVISION%

				docker push %env.BUILD_IMAGE_NAME%:%env.BUILD_VERSION%-%env.BUILD_REVISION%
			""".trimIndent()
		}
	}

	triggers {
		vcs {
			branchFilter = "+:refs/tags/v*"
		}
	}
})
