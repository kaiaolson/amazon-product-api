import { IInventory } from './types'
import { Result,
         IResult } from '@mcrowe/result'


export function parse(data): IResult<IInventory> {
  try {

    if (isError(data)) {
      const msg = parseError(data).code
      const error = normalizeAmazonError(msg)
      return Result.Error(error)
    }

    const cart = getCart(data)

    const inventory = getInventory(cart)

    return Result.OK({inventory})

  } catch (e) {
    console.error('parse_error ' + e)
    return Result.Error('parse_error')

  }
}


function isError(data) {
  return data.CartCreateErrorResponse
}


function getCart(data) {
  return data.CartCreateResponse.Cart
}


function getInventory(data) {
  const q = data.CartItems.CartItem.Quantity

  return q && parseInt(q)
}


function parseError(data) {
  const error = data.CartCreateErrorResponse.Error
  return {
    code: error.Code,
    message: error.Message
  }
}


function normalizeAmazonError(msg: string): string {
  switch (msg) {
    case 'AWS.InvalidAssociate':
      return 'invalid_associate'
    case 'InvalidClientTokenId':
    case 'SignatureDoesNotMatch':
      return 'invalid_key'
    case 'RequestThrottled':
      return 'aws_throttle'
    case 'AWS.ECommerceService.InvalidQuantity':
    case 'AWS.ECommerceService.CartInfoMismatch':
      return 'cart_error'
    case 'AWS.InternalError':
      return 'aws_server_error'
    default:
      throw new Error('Unexpected amazon error: ' + msg)
  }
}