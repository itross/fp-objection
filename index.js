/* Copyright (c) 2023 IT Resources S.r.l.
 * Code licensed under the MIT license.
 * See license in LICENSE file here in the project or at
 * https://github.com/itross/fp-objection/blob/main/LICENSE
 */

'use strict'

const fp = require('fastify-plugin')
const Knex = require('knex')
const Objection = require('objection')

async function objectionPlugin (fastify, opts) {
  const models = opts.models || []
  const namespace = opts.namespace || 'objection'

  if (!opts.config) {
    throw new Error('missing "config" param. Please, specify the config param as a Knex configuration object.')
  }

  if (!Array.isArray(opts.models)) {
    throw new TypeError(
        `bad type for models: received "${typeof opts.models}", but expecting array of model classes.`)
  }

  if (fastify[namespace]) {
    throw new Error(`Objection Plugin namespace "${namespace}" already registered.`)
  }

  const snakeCase = opts.snakeCase || {}
  const knexConfig = {
    ...opts.config,
    ...Objection.knexSnakeCaseMappers({
      upperCase: snakeCase.upperCase || false,
      underscoreBeforeDigits: snakeCase.underscoreBeforeDigits || false,
      underscoreBetweenUppercaseLetters: snakeCase.underscoreBetweenUppercaseLetters || true
    })
  }

  const knex = Knex(knexConfig)
  const objectionModels = {}

  models.forEach((m) => {
    const model = m.bindKnex(knex)
    objectionModels[`${m.name}Model`] = model
  })

  await fastify.decorate(namespace, {
    knex,
    ...objectionModels
  })

  await fastify.addHook('onClose', async (instance, done) => {
    instance.log.info({ msg: 'closing db connection', namespace })
    await knex.destroy()
    instance.log.info({ msg: 'closed', namespace })
    done()
  })

  fastify.log.debug({ namespace }, 'objection plugin registered')
}

module.exports = fp(objectionPlugin, {
  fastify: '>=4.0.0',
  name: '@itross/fp-objection'
})
