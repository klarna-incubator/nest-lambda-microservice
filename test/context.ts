import { Context } from 'aws-lambda'
import { jest } from '@jest/globals'

export const lambdaContextFactory = (): Context => ({
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'testLambda',
  functionVersion: '$LATEST',
  invokedFunctionArn: 'arn:aws:lambda:eu-west-1:000000000000:function:testLambda',
  memoryLimitInMB: '128',
  awsRequestId: '6925a7b4-ad31-433f-ab94-7a7f4f4b345f',
  logGroupName: '/aws/lambda/testLambda',
  logStreamName: '2000/01/01/[$LATEST]fca734e43bb742cdaa937d1a53eaf072',
  getRemainingTimeInMillis: jest.fn<() => number>(),
  done: jest.fn(),
  fail: jest.fn(),
  succeed: jest.fn(),
})
