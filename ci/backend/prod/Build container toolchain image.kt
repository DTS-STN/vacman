package _Self.buildTypes

import jetbrains.buildServer.configs.kotlin.v2018_2.*
import jetbrains.buildServer.configs.kotlin.v2018_2.buildSteps.script

object BuildContainerToolchainImage : BuildType({
	name = "Build container toolchain image"

	vcs {
		root(AbsoluteId("DtsCluster_VacancyManagement_HttpsGithubComDtsStnVacmanGit"))
	}

	steps {
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
		script {
			name = "Build container toolchain image"
			workingDir = "backend/docker"
			scriptContent = """
				docker build --file containerfile --tag %env.CLOUD_ACR_DOMAIN%/vacman/vacman-maven-builder:v1-mvn3.9-java21 .
				docker push %env.CLOUD_ACR_DOMAIN%/vacman/vacman-maven-builder:v1-mvn3.9-java21
			""".trimIndent()
		}
	}
})
