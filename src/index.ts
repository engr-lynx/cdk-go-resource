import {
  Construct,
  CustomResource,
} from '@aws-cdk/core'
import {
  IGrantable,
  IPrincipal,
} from '@aws-cdk/aws-iam'
import {
  GoFunction,
} from '@aws-cdk/aws-lambda-go'
import {
  Runtime,
} from '@aws-cdk/aws-lambda'
import {
  Provider,
} from '@aws-cdk/custom-resources'

// !ToDo: Use projen (https://www.npmjs.com/package/projen).
// ToDo: Use CDK nag (https://www.npmjs.com/package/cdk-nag).

export interface KeyValue {
  readonly [key: string]: string | number
}

export interface KeyString {
  readonly [key: string]: string
}

export interface GoResourceProps {
  readonly entry: string
  readonly buildArgs?: KeyString
  readonly cgoEnabled?: boolean
  readonly goBuildFlags?: string[]
  readonly runtime?: Runtime
  readonly properties?: KeyValue
}

export class GoResource extends Construct implements IGrantable {

  public readonly resource: CustomResource
  readonly grantPrincipal: IPrincipal

  constructor(scope: Construct, id: string, props: GoResourceProps) {
    super(scope, id)
    const bundling = {
      buildArgs: props.buildArgs,
      cgoEnabled: props.cgoEnabled,
      goBuildFlags: props.goBuildFlags,
    }
    const onEventHandler = new GoFunction(this, 'Handler', {
      entry: props.entry,
      bundling,
      runtime: props.runtime,
    })
    this.grantPrincipal = onEventHandler.grantPrincipal
    const provider = new Provider(this, 'Provider', {
      onEventHandler,
    })
    this.resource = new CustomResource(this, 'Resource', {
      serviceToken: provider.serviceToken,
      properties: props.properties,
    })
  }

}