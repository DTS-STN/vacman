package _Self.buildTypes

import jetbrains.buildServer.configs.kotlin.v2018_2.*
import jetbrains.buildServer.configs.kotlin.v2018_2.buildSteps.script
import jetbrains.buildServer.configs.kotlin.v2018_2.triggers.vcs

object SynchronizeAllEnvironments : BuildType({
	name = "Synchronize all environments"

	enablePersonalBuilds = false
	type = BuildTypeSettings.Type.DEPLOYMENT
	maxRunningBuilds = 1

	params {
		select("DEBUG", "false", label = "DEBUG", options = listOf("false", "true"))
	}

	vcs {
		root(AbsoluteId("DtsCluster_VacancyManagement_HttpsGithubComDtsStnVacmanGit"))

		branchFilter = """
			-:*
			+:<default>
		""".trimIndent()
	}

	steps {
		script {
			name = "Dump environment variables"

			conditions {
				equals("DEBUG", "true")
			}
			workingDir = "./gitops/"
			scriptContent = """
				set -eux
				env | sort # | base64
			""".trimIndent()
		}
		script {
			name = "Authenticate using Azure CLI"
			workingDir = "./gitops/"
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
				  --file ./dts-prod-sced-rhp-akscluster.yaml

				kubelogin convert-kubeconfig \
				  --login spn \
				  --client-id %env.TEAMCITY_SPN_ID% \
				  --client-secret %env.TEAMCITY_SPN_PASS% \
				  --kubeconfig ./dts-prod-sced-rhp-akscluster.yaml
			""".trimIndent()
		}
		script {
			name = "Synchronize `prod` environment"
			workingDir = "./gitops/"
			scriptContent = """
				set -eux

				kubectl apply --kubeconfig ./dts-prod-sced-rhp-akscluster.yaml --kustomize ./prod/ --namespace vacancy-management --force
			""".trimIndent()
		}
	}

	triggers {
		vcs {
			triggerRules = "+:gitops/**"
			branchFilter = "+:<default>"
		}
	}
})
