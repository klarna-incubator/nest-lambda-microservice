import { AnyEventBridgeEvent } from '../../src'

export const makeEventBridgeEvent = (source?: string, detailType?: string, detail?: unknown): AnyEventBridgeEvent => ({
  version: '0',
  id: '6a7e8feb-b491-4cf7-a9f1-bf3703467718',
  'detail-type': detailType ?? 'EC2 Instance State-change Notification',
  source: source ?? 'aws.ec2',
  account: 'AWS_ACCOUNT_ID',
  time: '2019-11-30T09:12:33Z',
  region: 'eu-west-1',
  resources: ['arn:aws:ec2:eu-west-1:AWS_ACCOUNT_ID:instance/i-abcd1111'],
  detail: detail ?? {
    'instance-id': 'i-abcd1111',
    state: 'terminated',
  },
})
