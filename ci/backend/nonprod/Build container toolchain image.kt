package _Self.buildTypes

import jetbrains.buildServer.configs.kotlin.v2018_2.*
import jetbrains.buildServer.configs.kotlin.v2018_2.buildSteps.script

object BuildContainerToolchainImage : BuildType({
	name = "Build container toolchain image"

	vcs {
		root(AbsoluteId("DtsDevelopment_VacancyManagement_VacancyManagementGitHub"))
	}

	steps {
		script {
			name = "Build container toolchain image"
			workingDir = "backend/docker"
			scriptContent = """
				docker build --file containerfile --tag dtsrhpdevscedacr.azurecr.io/vacman/vacman-maven-builder:v1-mvn3.9-java21 .
				docker push dtsrhpdevscedacr.azurecr.io/vacman/vacman-maven-builder:v1-mvn3.9-java21
			""".trimIndent()
		}
	}
})
