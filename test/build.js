/* Copyright (c) 2023 IT Resources S.r.l.
 * Code licensed under the MIT license.
 * See license in LICENSE file here in the project or at
 * https://github.com/itross/fp-objection/blob/main/LICENSE
 */

'use strict'

const Fastify = require('fastify')

module.exports = async function build (t) {
  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))
  return fastify
}
